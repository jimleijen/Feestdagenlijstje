import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList, Image, Pressable, Share, Text, View } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import { wishlistsApi } from "../../api/wishlists";
import { Button, Card, EmptyState, Heading, Muted, Screen, TextInput } from "../../components/ui";
import { WishlistItemRow } from "../../components/WishlistItemRow";
import { colors, radius, spacing } from "../../theme/colors";
import { fonts } from "../../theme/fonts";
import { WishlistStackParamList } from "../../navigation/types";
import { Wishlist } from "../../types";

function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.xs }}>
      <Ionicons name={icon} size={16} color={colors.accent} style={{ width: 22 }} />
      <Text style={{ color: colors.text, fontSize: 15, flexShrink: 1 }}>{text}</Text>
    </View>
  );
}

export function WishlistDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<WishlistStackParamList, "WishlistDetail">) {
  const { wishlistId, shareCode: shareCodeParam } = route.params ?? {};
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(true);

  const load = useCallback(() => {
    setNotFound(false);
    const fetcher = wishlistId ? wishlistsApi.get(wishlistId) : wishlistsApi.getShared(shareCodeParam!);
    fetcher.then(setWishlist).catch(() => setNotFound(true));
  }, [wishlistId, shareCodeParam]);

  useFocusEffect(load);

  async function handleAddItem() {
    if (!newTitle.trim() || !wishlist) return;
    setAdding(true);
    try {
      await wishlistsApi.addItem(wishlist.id, {
        title: newTitle.trim(),
        sourceUrl: newUrl.trim() || undefined,
      });
      setNewTitle("");
      setNewUrl("");
      load();
    } finally {
      setAdding(false);
    }
  }

  function handleShare() {
    if (!wishlist) return;
    Share.share({
      message: `Bekijk mijn wensenlijstje "${wishlist.title}" op Feestdagenlijstje! Lijstje-code: ${wishlist.shareCode}`,
    }).catch(() => {});
  }

  if (notFound) return <Screen><EmptyState title="Lijstje niet gevonden" subtitle="Controleer de code en probeer het opnieuw." /></Screen>;
  if (!wishlist) return <Screen />;

  const isOwner = Boolean(user && wishlist.ownerId === user.id);
  const shareCode = wishlist.shareCode;

  return (
    <Screen>
      <FlatList
        data={itemsOpen ? wishlist.items ?? [] : []}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={
          <View>
            <Heading>{wishlist.title}</Heading>

            <Card>
              <View style={{ flexDirection: "row" }}>
                {wishlist.photoUrl ? (
                  <Image source={{ uri: wishlist.photoUrl }} style={styles.photo} />
                ) : (
                  <View style={[styles.photo, styles.photoPlaceholder]}>
                    <Ionicons name="gift-outline" size={34} color={colors.textMuted} />
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: spacing.lg, justifyContent: "center" }}>
                  <InfoRow icon="person-outline" text={wishlist.ownerName} />
                  {wishlist.location ? <InfoRow icon="home-outline" text={wishlist.location} /> : null}
                  {wishlist.occasion ? <InfoRow icon="gift-outline" text={wishlist.occasion} /> : null}
                  {wishlist.dateLabel ? <InfoRow icon="calendar-outline" text={wishlist.dateLabel} /> : null}
                </View>
              </View>
              {wishlist.note ? <Text style={styles.note}>{wishlist.note}</Text> : null}
            </Card>

            {isOwner ? (
              <View>
                <Button title="Deel dit lijstje" variant="secondary" onPress={handleShare} />
                <Button title="Gegevens bewerken" variant="ghost" onPress={() => navigation.navigate("WishlistEdit", { wishlistId: wishlist.id })} />

                <Card>
                  <Text style={{ fontWeight: "600", marginBottom: spacing.xs, color: colors.text }}>Cadeau toevoegen</Text>
                  <TextInput placeholder="Wat wil je graag?" value={newTitle} onChangeText={setNewTitle} />
                  <TextInput placeholder="Link naar webwinkel (optioneel)" value={newUrl} onChangeText={setNewUrl} autoCapitalize="none" />
                  <Button title="Toevoegen" onPress={handleAddItem} loading={adding} disabled={!newTitle.trim()} />
                </Card>
              </View>
            ) : null}

            <Pressable
              onPress={() => setItemsOpen((o) => !o)}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.md }}
            >
              <Ionicons name={itemsOpen ? "chevron-down" : "chevron-forward"} size={20} color={colors.accent} />
              <Text style={{ fontFamily: fonts.displayBold, fontSize: 18, color: colors.accent, marginLeft: spacing.xs }}>
                Lijstje
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={itemsOpen ? <EmptyState title="Nog geen cadeaus" subtitle="Voeg hierboven je eerste wens toe." /> : null}
        renderItem={({ item }) => (
          <WishlistItemRow
            item={item}
            shareCode={shareCode}
            isOwner={isOwner}
            onChange={(updated) =>
              setWishlist((prev) =>
                prev ? { ...prev, items: prev.items?.map((i) => (i.id === updated.id ? updated : i)) } : prev
              )
            }
          />
        )}
      />
    </Screen>
  );
}

const styles = {
  photo: { width: 96, height: 96, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  photoPlaceholder: { alignItems: "center" as const, justifyContent: "center" as const },
  note: {
    fontFamily: fonts.display,
    fontStyle: "italic" as const,
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
};
