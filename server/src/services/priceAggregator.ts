import { prisma } from "../prisma";
import { AmazonProvider } from "./priceProviders/amazonProvider";
import { BolPartnerProvider } from "./priceProviders/bolPartnerProvider";
import { CoolblueProvider } from "./priceProviders/coolblueProvider";
import { PriceProvider, ProductQuery } from "./priceProviders/types";

const providers: PriceProvider[] = [new BolPartnerProvider(), new CoolblueProvider(), new AmazonProvider()];

// How long a cached quote may be shown before we're required to re-check it live.
// Kept short on purpose: this is the direct fix for the lijstje.nl "22,99 op de app,
// 32,99 op de site" complaint — a stale quote is worse than no quote.
const FRESHNESS_WINDOW_MS = 15 * 60 * 1000;

export interface PriceComparison {
  cheapest: { shopName: string; price: number; currency: string; productUrl: string } | null;
  all: { shopName: string; price: number; currency: string; productUrl: string; inStock: boolean }[];
  fetchedAt: string;
  /** True if no provider is configured yet (all keys missing in .env) — UI should say so, not show "€0". */
  noProvidersConfigured: boolean;
}

export async function getPriceComparison(wishlistItemId: string, forceRefresh = false): Promise<PriceComparison> {
  const item = await prisma.wishlistItem.findUniqueOrThrow({ where: { id: wishlistItemId } });

  if (!forceRefresh) {
    const cached = await prisma.priceQuote.findMany({
      where: { wishlistItemId, fetchedAt: { gte: new Date(Date.now() - FRESHNESS_WINDOW_MS) } },
      orderBy: { price: "asc" },
    });
    if (cached.length > 0) {
      return toComparison(cached, providers.some((p) => p.isConfigured()));
    }
  }

  const configured = providers.filter((p) => p.isConfigured());
  const query: ProductQuery = { title: item.title, sourceUrl: item.sourceUrl ?? undefined };

  const results = await Promise.allSettled(configured.map((p) => p.lookup(query)));
  const quotes = results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<PriceProvider["lookup"]>>> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((q): q is NonNullable<typeof q> => q !== null);

  // Replace old quotes for this item so we never mix a fresh price with a stale one.
  await prisma.$transaction([
    prisma.priceQuote.deleteMany({ where: { wishlistItemId } }),
    ...quotes.map((q) =>
      prisma.priceQuote.create({
        data: {
          wishlistItemId,
          shopName: q.shopName,
          price: q.price,
          currency: q.currency,
          productUrl: q.productUrl,
          inStock: q.inStock,
        },
      })
    ),
  ]);

  const saved = await prisma.priceQuote.findMany({ where: { wishlistItemId }, orderBy: { price: "asc" } });
  return toComparison(saved, configured.length > 0);
}

function toComparison(
  quotes: { shopName: string; price: number; currency: string; productUrl: string; inStock: boolean; fetchedAt: Date }[],
  anyProviderConfigured: boolean
): PriceComparison {
  const inStock = quotes.filter((q) => q.inStock);
  const cheapest = (inStock[0] ?? quotes[0]) ?? null;
  return {
    cheapest: cheapest
      ? { shopName: cheapest.shopName, price: cheapest.price, currency: cheapest.currency, productUrl: cheapest.productUrl }
      : null,
    all: quotes.map((q) => ({
      shopName: q.shopName,
      price: q.price,
      currency: q.currency,
      productUrl: q.productUrl,
      inStock: q.inStock,
    })),
    fetchedAt: (quotes[0]?.fetchedAt ?? new Date()).toISOString(),
    noProvidersConfigured: !anyProviderConfigured,
  };
}
