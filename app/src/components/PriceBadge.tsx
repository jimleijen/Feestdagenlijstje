import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, Text, View } from "react-native";
import { wishlistsApi } from "../api/wishlists";
import { colors, radius, spacing } from "../theme/colors";
import { PriceComparison } from "../types";

function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "zojuist";
  if (minutes < 60) return `${minutes} min geleden`;
  const hours = Math.round(minutes / 60);
  return `${hours} uur geleden`;
}

function shopHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Shows the cheapest live, verified price across configured webshops for one item, and lets
// the buyer expand to see every match side by side — including the link the list owner
// pasted in themself — so they can check whether that link is actually the cheapest option
// before buying. Deliberately never shows a number until a real provider has answered — see
// server/src/services/priceAggregator.ts for why "close enough" pricing is not good enough.
export function PriceBadge({ itemId, sourceUrl }: { itemId: string; sourceUrl?: string | null }) {
  const [comparison, setComparison] = useState<PriceComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    wishlistsApi
      .prices(itemId)
      .then(setComparison)
      .finally(() => setLoading(false));
  }, [itemId]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      setComparison(await wishlistsApi.prices(itemId, true));
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) return <Text style={{ color: colors.textMuted, fontSize: 13 }}>Prijzen ophalen…</Text>;

  const shopCount = (comparison?.all.length ?? 0) + (sourceUrl ? 1 : 0);
  const cheapestUrl = comparison?.cheapest?.productUrl;

  return (
    <View style={{ marginTop: spacing.xs }}>
      {comparison?.cheapest ? (
        <Pressable onPress={() => Linking.openURL(comparison.cheapest!.productUrl)}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.success }}>
              € {comparison.cheapest.price.toFixed(2)}
            </Text>
            <Text style={{ marginLeft: 6, fontSize: 13, color: colors.textMuted }}>bij {comparison.cheapest.shopName}</Text>
          </View>
        </Pressable>
      ) : (
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
          {comparison?.noProvidersConfigured ? "Prijsvergelijking nog niet ingesteld door de beheerder" : "Geen prijs gevonden"}
        </Text>
      )}

      {shopCount > 0 ? (
        <Pressable onPress={() => setExpanded((e) => !e)} style={{ marginTop: spacing.xs }}>
          <Text style={{ color: colors.gold, fontSize: 13, fontWeight: "600" }}>
            {expanded ? "Verberg winkels" : `Vergelijk ${shopCount} winkel${shopCount > 1 ? "s" : ""} ›`}
          </Text>
        </Pressable>
      ) : null}

      {expanded ? (
        <View style={{ marginTop: spacing.xs, borderRadius: radius.md, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}>
          {sourceUrl ? (
            <ShopRow label="Jouw link" host={shopHost(sourceUrl)} url={sourceUrl} isOwnLink />
          ) : null}
          {(comparison?.all ?? []).map((shop, i) => (
            <ShopRow
              key={i}
              label={shop.shopName}
              price={shop.price}
              url={shop.productUrl}
              isCheapest={shop.productUrl === cheapestUrl}
            />
          ))}
          <Pressable
            onPress={handleRefresh}
            disabled={refreshing}
            style={{ flexDirection: "row", alignItems: "center", padding: spacing.sm, backgroundColor: colors.surfaceAlt }}
          >
            {refreshing ? <ActivityIndicator size="small" color={colors.gold} /> : null}
            <Text style={{ color: colors.textMuted, fontSize: 12, marginLeft: refreshing ? 6 : 0 }}>
              Ververs prijzen{comparison ? ` · bijgewerkt ${relativeTime(comparison.fetchedAt)}` : ""}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function ShopRow({
  label,
  host,
  price,
  url,
  isCheapest,
  isOwnLink,
}: {
  label: string;
  host?: string;
  price?: number;
  url: string;
  isCheapest?: boolean;
  isOwnLink?: boolean;
}) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm + 2,
        backgroundColor: isCheapest ? "rgba(63, 166, 121, 0.15)" : colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flex: 1, marginRight: spacing.sm }}>
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: isCheapest ? "700" : "500" }} numberOfLines={1}>
          {label} {isCheapest ? "🏆" : ""}
        </Text>
        {host ? (
          <Text style={{ color: colors.textMuted, fontSize: 12 }} numberOfLines={1}>
            {host}
          </Text>
        ) : null}
      </View>
      {price !== undefined ? (
        <Text style={{ color: isCheapest ? colors.success : colors.text, fontWeight: "700", fontSize: 14 }}>
          € {price.toFixed(2)}
        </Text>
      ) : isOwnLink ? (
        <Text style={{ color: colors.gold, fontSize: 12 }}>Openen ›</Text>
      ) : null}
    </Pressable>
  );
}
