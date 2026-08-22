import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Modal, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { wishlistsApi } from "../api/wishlists";
import { colors, radius, spacing } from "../theme/colors";
import { WishlistItem } from "../types";
import { Button, Card, Muted, SubHeading, TextInput } from "./ui";
import { PriceBadge } from "./PriceBadge";

function Thumbnail({ uri }: { uri?: string | null }) {
  if (uri) return <Image source={{ uri }} style={styles.thumb} />;
  return (
    <View style={[styles.thumb, styles.thumbPlaceholder]}>
      <Ionicons name="gift-outline" size={26} color={colors.textMuted} />
    </View>
  );
}

// Owner-authenticated view of one item: whether reserved or not, the owner never learns
// who got it or even whether it's already spoken for beyond "someone's got this" — the whole
// point of a wishlist is that the recipient stays surprised, even if they poke around their
// own list.
function OwnerItemRow({ item }: { item: WishlistItem }) {
  const isReserved = Boolean(item.reservedAt);
  return (
    <Card>
      <View style={{ flexDirection: "row" }}>
        <Thumbnail uri={item.imageUrl} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>{item.title}</Text>
          {item.description ? <Muted>{item.description}</Muted> : null}
          <PriceBadge itemId={item.id} sourceUrl={item.sourceUrl} />
        </View>
      </View>
      {isReserved ? (
        <View style={styles.mysteryBanner}>
          <Ionicons name="sparkles" size={16} color={colors.accent} />
          <Text style={styles.mysteryText}>Iemand heeft dit al voor je geregeld — verrassing!</Text>
        </View>
      ) : null}
    </Card>
  );
}

// Guest/buyer-facing view: items already crossed off by someone else are shown blind
// ("Door iemand anders afgestreept") behind a "Toon kado" reveal, matching the reference —
// so browsing guests can decide to reveal only if they actually want to check before buying
// something else. Not-yet-reserved items get the "Afstrepen" flow with an e-mail check so the
// buyer can undo it later if they change their mind.
function GuestItemRow({
  item,
  shareCode,
  onChange,
}: {
  item: WishlistItem;
  shareCode: string;
  onChange: (updated: WishlistItem) => void;
}) {
  const { user } = useAuth();
  const [revealed, setRevealed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState(user?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReserved = Boolean(item.reservedAt);
  const reservedByMe = isReserved && item.reservedByEmail === user?.email;

  async function handleConfirmReserve() {
    if (!email.trim() || !user) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await wishlistsApi.reserve(shareCode, item.id, user.name, email.trim().toLowerCase());
      onChange(updated);
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Afstrepen lukte niet");
    } finally {
      setBusy(false);
    }
  }

  async function handleUndo() {
    if (!user) return;
    setBusy(true);
    try {
      const updated = await wishlistsApi.unreserve(shareCode, item.id, user.email);
      onChange(updated);
    } finally {
      setBusy(false);
    }
  }

  if (isReserved && !revealed && !reservedByMe) {
    return (
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Ionicons name="lock-closed-outline" size={22} color={colors.textMuted} />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Muted>Door iemand anders afgestreept</Muted>
            <Text style={{ color: colors.accent, fontWeight: "600" }} onPress={() => setRevealed(true)}>
              Toon kado ›
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card style={{ opacity: isReserved && !reservedByMe ? 0.7 : 1 }}>
      <View style={{ flexDirection: "row" }}>
        <Thumbnail uri={item.imageUrl} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
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
          {item.description ? <Muted>{item.description}</Muted> : null}
          <PriceBadge itemId={item.id} sourceUrl={item.sourceUrl} />
        </View>
      </View>

      {isReserved ? (
        reservedByMe ? (
          <View style={styles.rowFooter}>
            <Text style={{ color: colors.textMuted, flex: 1, marginRight: spacing.sm }}>Door jou afgestreept</Text>
            <Button title="Oeps, zet terug" variant="ghost" onPress={handleUndo} loading={busy} />
          </View>
        ) : (
          <Muted>Al afgestreept door iemand anders.</Muted>
        )
      ) : (
        <View style={{ marginTop: spacing.md }}>
          <Button title="Ik koop dit — afstrepen" onPress={() => setModalOpen(true)} />
        </View>
      )}

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: spacing.lg }}>
          <Card style={{ marginBottom: 0 }}>
            <SubHeading>Voer je e-mailadres in om af te strepen</SubHeading>
            <TextInput placeholder="Je e-mailadres" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <Muted>
              Je krijgt hiermee de mogelijkheid dit later weer terug te zetten als je toch iets anders koopt. We
              geven je e-mailadres nooit aan anderen.
            </Muted>
            {error ? <Text style={{ color: colors.danger, marginBottom: spacing.xs }}>{error}</Text> : null}
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <Button title="Annuleren" variant="ghost" onPress={() => setModalOpen(false)} />
              <View style={{ width: spacing.sm }} />
              <Button title="Afstrepen" onPress={handleConfirmReserve} loading={busy} disabled={!email.trim()} />
            </View>
          </Card>
        </View>
      </Modal>
    </Card>
  );
}

export function WishlistItemRow({
  item,
  shareCode,
  isOwner,
  onChange,
}: {
  item: WishlistItem;
  shareCode: string;
  isOwner: boolean;
  onChange: (updated: WishlistItem) => void;
}) {
  if (isOwner) return <OwnerItemRow item={item} />;
  return <GuestItemRow item={item} shareCode={shareCode} onChange={onChange} />;
}

const styles = {
  thumb: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  thumbPlaceholder: { alignItems: "center" as const, justifyContent: "center" as const },
  mysteryBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mysteryText: { color: colors.textMuted, marginLeft: spacing.xs, fontStyle: "italic" as const },
  rowFooter: { flexDirection: "row" as const, alignItems: "center" as const, marginTop: spacing.md },
};
