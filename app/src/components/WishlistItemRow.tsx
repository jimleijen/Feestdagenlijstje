import React, { useState } from "react";
import { Text, View } from "react-native";
import { wishlistsApi } from "../api/wishlists";
import { colors, spacing } from "../theme/colors";
import { WishlistItem } from "../types";
import { Button, Card, TextInput } from "./ui";
import { PriceBadge } from "./PriceBadge";

export function WishlistItemRow({
  item,
  shareCode,
  onChange,
}: {
  item: WishlistItem;
  shareCode: string;
  onChange: (updated: WishlistItem) => void;
}) {
  const [buyerName, setBuyerName] = useState("");
  const [busy, setBusy] = useState(false);

  const isReserved = Boolean(item.reservedAt);

  async function handleReserve() {
    if (!buyerName.trim()) return;
    setBusy(true);
    try {
      const updated = await wishlistsApi.reserve(shareCode, item.id, buyerName.trim());
      onChange(updated);
    } finally {
      setBusy(false);
    }
  }

  async function handleUndo() {
    setBusy(true);
    try {
      const updated = await wishlistsApi.unreserve(shareCode, item.id);
      onChange(updated);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card style={{ opacity: isReserved ? 0.6 : 1 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: colors.text,
          textDecorationLine: isReserved ? "line-through" : "none",
        }}
      >
        {item.title}
      </Text>
      {item.description ? <Text style={{ color: colors.textMuted, marginTop: spacing.xs }}>{item.description}</Text> : null}

      <View style={{ marginTop: spacing.sm }}>
        <PriceBadge itemId={item.id} sourceUrl={item.sourceUrl} />
      </View>

      {isReserved ? (
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: spacing.md }}>
          <Text style={{ color: colors.textMuted, flex: 1, marginRight: spacing.sm }}>
            Afgestreept door {item.reservedByName}
          </Text>
          <Button title="Oeps, zet terug" variant="ghost" onPress={handleUndo} loading={busy} />
        </View>
      ) : (
        <View style={{ marginTop: spacing.md }}>
          <TextInput placeholder="Jouw naam (om af te strepen)" value={buyerName} onChangeText={setBuyerName} />
          <Button title="Ik koop dit — afstrepen" onPress={handleReserve} loading={busy} disabled={!buyerName.trim()} />
        </View>
      )}
    </Card>
  );
}
