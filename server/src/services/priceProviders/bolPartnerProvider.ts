import { PriceProvider, ProductQuery, ProviderQuote } from "./types";

/**
 * Bol.com Partner Program (affiliate) adapter.
 *
 * TODO before going live: sign up at partner.bol.com, request API credentials, and fill in
 * the real request against their Catalog/Offer API here. Deliberately left unimplemented
 * rather than guessing an endpoint shape — a wrong hardcoded URL would silently return no
 * price (safe) but a wrong *response field mapping* could silently show a stale/wrong price
 * (exactly the bug this app exists to avoid), so this must be wired up against the real,
 * current API docs and tested against a known product before enabling it.
 *
 * isConfigured() gates this: until BOL_PARTNER_API_KEY is set, the aggregator skips this
 * provider entirely instead of returning a guessed price.
 */
export class BolPartnerProvider implements PriceProvider {
  shopName = "Bol.com";

  isConfigured(): boolean {
    return Boolean(process.env.BOL_PARTNER_API_KEY);
  }

  async lookup(_query: ProductQuery): Promise<ProviderQuote | null> {
    if (!this.isConfigured()) return null;

    // TODO: call the Bol.com Partner API here and map the response to ProviderQuote.
    // Never fall back to a cached/estimated number if the call fails — return null so the
    // aggregator just omits this shop rather than showing a price that might be wrong.
    return null;
  }
}
