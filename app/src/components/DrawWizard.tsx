import React, { useState } from "react";
import { Modal, ScrollView, Share, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { colors, spacing } from "../theme/colors";
import { NameDraw } from "../types";
import { Button, Card, Muted, SubHeading, TextInput } from "./ui";
import { StepIndicator } from "./StepIndicator";

interface Participant {
  id: string;
  name: string;
  email: string;
  excludeIds: string;
}

interface DrawApi {
  create: (data: { title: string; budget?: string }) => Promise<NameDraw>;
  get: (id: string) => Promise<NameDraw>;
  addParticipant: (id: string, data: { name: string; email: string }) => Promise<unknown>;
  removeParticipant: (id: string, participantId: string) => Promise<unknown>;
  setExclusions: (id: string, participantId: string, excludeIds: string[]) => Promise<unknown>;
}

const MIN_PARTICIPANTS = 3;

// Three-step wizard, shared by Lootjes trekken and Secret Santa: basisgegevens → deelnemers
// (one at a time, several e-mails pasted at once, or a join-code others can use to add
// themselves) → uitsluitingen (who may not draw whom, e.g. a couple). Mirrors the flow of
// the reference the user liked, restyled in our own look.
export function DrawWizard({
  api,
  titlePlaceholder,
  onCreated,
}: {
  api: DrawApi;
  titlePlaceholder: string;
  onCreated: (drawId: string) => void;
}) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [draw, setDraw] = useState<NameDraw | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingExcludes, setEditingExcludes] = useState<string[]>([]);

  async function refresh(drawId: string) {
    const fresh = await api.get(drawId);
    setDraw(fresh);
    setParticipants(fresh.participants as Participant[]);
  }

  async function handleCreateDraw() {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const created = await api.create({ title: title.trim(), budget: budget.trim() || undefined });
      // The organiser is almost always a participant too — add them straight away like the
      // reference does ("Test Test (dit ben je zelf)"), one less thing to remember.
      if (user) await api.addParticipant(created.id, { name: user.name, email: user.email });
      await refresh(created.id);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddOne() {
    if (!draw || !name.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.addParticipant(draw.id, { name: name.trim(), email: email.trim().toLowerCase() });
      setName("");
      setEmail("");
      await refresh(draw.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon deelnemer niet toevoegen");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPasted() {
    if (!draw) return;
    const emails = pasteText
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    if (emails.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      await Promise.all(
        emails.map((rawEmail) => {
          const localPart = rawEmail.split("@")[0] ?? rawEmail;
          const guessedName = localPart.charAt(0).toUpperCase() + localPart.slice(1);
          return api.addParticipant(draw.id, { name: guessedName, email: rawEmail.toLowerCase() });
        })
      );
      setPasteText("");
      setPasteOpen(false);
      await refresh(draw.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon niet alle e-mailadressen toevoegen");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(participantId: string) {
    if (!draw) return;
    await api.removeParticipant(draw.id, participantId);
    await refresh(draw.id);
  }

  function handleShareCode() {
    if (!draw) return;
    Share.share({ message: `Doe mee met "${draw.title}"! Join-code: ${draw.joinCode}` }).catch(() => {});
  }

  function openExclusions(p: Participant) {
    setEditingId(p.id);
    setEditingExcludes(JSON.parse(p.excludeIds || "[]"));
  }

  function toggleExclude(otherId: string) {
    setEditingExcludes((prev) => (prev.includes(otherId) ? prev.filter((id) => id !== otherId) : [...prev, otherId]));
  }

  async function saveExclusions() {
    if (!draw || !editingId) return;
    setLoading(true);
    try {
      await api.setExclusions(draw.id, editingId, editingExcludes);
      await refresh(draw.id);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon uitsluitingen niet opslaan");
    } finally {
      setLoading(false);
    }
  }

  const editingParticipant = participants.find((p) => p.id === editingId);

  return (
    <View>
      <StepIndicator steps={3} current={step} />

      {step === 1 ? (
        <View>
          <TextInput placeholder={titlePlaceholder} value={title} onChangeText={setTitle} />
          <TextInput placeholder="Budget (optioneel), bv. max 15 euro" value={budget} onChangeText={setBudget} />
          {error ? <Text style={{ color: colors.danger, marginBottom: spacing.xs }}>{error}</Text> : null}
          <Button title="Volgende: deelnemers" onPress={handleCreateDraw} loading={loading} disabled={!title.trim()} />
        </View>
      ) : null}

      {step === 2 && draw ? (
        <View>
          <SubHeading>{participants.length} deelnemer{participants.length === 1 ? "" : "s"}</SubHeading>
          <Card>
            {participants.map((p, i) => (
              <View
                key={p.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: spacing.sm,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>
                    {p.name} {p.email === user?.email ? "(dit ben jij)" : ""}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>{p.email}</Text>
                </View>
                {p.email !== user?.email ? (
                  <Text style={{ color: colors.danger, padding: spacing.xs }} onPress={() => handleRemove(p.id)}>
                    Verwijder
                  </Text>
                ) : null}
              </View>
            ))}
          </Card>

          <TextInput placeholder="Naam" value={name} onChangeText={setName} />
          <TextInput placeholder="E-mailadres" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Button title="Deelnemer toevoegen" variant="secondary" onPress={handleAddOne} loading={loading} disabled={!name.trim() || !email.trim()} />

          <Button title="Meerdere e-mailadressen plakken" variant="ghost" onPress={() => setPasteOpen(true)} />
          <Button title="Deel join-code" variant="ghost" onPress={handleShareCode} />
          <Muted>Anderen kunnen zichzelf ook toevoegen via "Doe mee met code" op het Lootjes-overzicht.</Muted>

          {error ? <Text style={{ color: colors.danger, marginBottom: spacing.xs }}>{error}</Text> : null}
          <Button
            title="Volgende: uitsluitingen"
            onPress={() => setStep(3)}
            disabled={participants.length < MIN_PARTICIPANTS}
          />
          {participants.length < MIN_PARTICIPANTS ? <Muted>Minimaal {MIN_PARTICIPANTS} deelnemers nodig.</Muted> : null}

          <Modal visible={pasteOpen} transparent animationType="fade" onRequestClose={() => setPasteOpen(false)}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: spacing.lg }}>
              <Card style={{ marginBottom: 0 }}>
                <SubHeading>Meerdere deelnemers toevoegen</SubHeading>
                <Muted>Eén e-mailadres per regel, of gescheiden door een komma.</Muted>
                <TextInput
                  placeholder={"anna@example.com\nluuk@voorbeeld.be"}
                  value={pasteText}
                  onChangeText={setPasteText}
                  multiline
                  numberOfLines={5}
                  autoCapitalize="none"
                  style={{ height: 120, textAlignVertical: "top", borderRadius: 16 }}
                />
                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                  <Button title="Annuleren" variant="ghost" onPress={() => setPasteOpen(false)} />
                  <View style={{ width: spacing.sm }} />
                  <Button title="Toevoegen" onPress={handleAddPasted} loading={loading} disabled={!pasteText.trim()} />
                </View>
              </Card>
            </View>
          </Modal>
        </View>
      ) : null}

      {step === 3 && draw ? (
        <View>
          <SubHeading>Uitsluitingen toevoegen</SubHeading>
          <Muted>
            Tik op een deelnemer om aan te geven wie hij of zij niet mag trekken — bijvoorbeeld een stel dat geen
            geheimen voor elkaar kan bewaren.
          </Muted>
          <ScrollView style={{ maxHeight: 380 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {participants.map((p) => {
              const excludeCount = (JSON.parse(p.excludeIds || "[]") as string[]).length;
              return (
                <Card key={p.id} style={{ paddingVertical: spacing.sm }}>
                  <Text
                    style={{ color: colors.text, fontWeight: "600" }}
                    onPress={() => (editingId === p.id ? setEditingId(null) : openExclusions(p))}
                  >
                    {p.name}
                  </Text>
                  <Muted>{excludeCount > 0 ? `${excludeCount} uitsluiting${excludeCount > 1 ? "en" : ""}` : "Geen uitsluitingen"}</Muted>

                  {editingId === p.id ? (
                    <View style={{ marginTop: spacing.sm }}>
                      {participants
                        .filter((other) => other.id !== p.id)
                        .map((other) => {
                          const excluded = editingExcludes.includes(other.id);
                          return (
                            <Text
                              key={other.id}
                              onPress={() => toggleExclude(other.id)}
                              style={{
                                color: excluded ? colors.danger : colors.textMuted,
                                fontWeight: excluded ? "700" : "400",
                                paddingVertical: spacing.xs,
                              }}
                            >
                              {excluded ? "✕ " : "○ "}
                              {other.name}
                            </Text>
                          );
                        })}
                      <Button title="Opslaan" onPress={saveExclusions} loading={loading} />
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </ScrollView>
          {error ? <Text style={{ color: colors.danger, marginTop: spacing.xs }}>{error}</Text> : null}
          <Button title="Klaar — naar overzicht" onPress={() => onCreated(draw.id)} />
        </View>
      ) : null}
    </View>
  );
}
