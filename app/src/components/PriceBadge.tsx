import React, { useEffect, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { wishlistsApi } from "../api/wishlists";
import { colors, spacing } from "../theme/colors";
import { PriceComparison } from "../types";

// Shows the cheapest live, verified price across configured webshops for one item.
// Deliberately never shows a number until a real provider has answered — see
// server/src/services/priceAggregator.ts for why "close enough" pricing is not good enough here.
export function PriceBadge({ itemId }: { itemId: string }) {
  const [comparison, setComparison] = useState<PriceComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistsApi
      .prices(itemId)
      .then(setComparison)
      .finally(() => setLoading(false));
  }, [itemId]);

  if (loading) return <Text style={{ color: colors.textMuted, fontSize: 13 }}>Prijzen ophalen…</Text>;

  if (!comparison || comparison.noProvidersConfigured) {
    return (
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>
        Prijsvergelijking nog niet ingesteld door de beheerder
      </Text>
    );
  }

  if (!comparison.cheapest) {
    return <Text style={{ color: colors.textMuted, fontSize: 13 }}>Geen prijs gevonden</Text>;
  }

  const { cheapest } = comparison;
  const others = comparison.all.length - 1;

  return (
    <Pressable onPress={() => Linking.openURL(cheapest.productUrl)}>
      <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: spacing.xs }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.secondary }}>
          € {cheapest.price.toFixed(2)}
        </Text>
        <Text style={{ marginLeft: 6, fontSize: 13, color: colors.textMuted }}>
          bij {cheapest.shopName}
          {others > 0 ? ` · ${others} andere winkel${others > 1 ? "s" : ""} vergeleken` : ""}
        </Text>
      </View>
    </Pressable>
  );
}
