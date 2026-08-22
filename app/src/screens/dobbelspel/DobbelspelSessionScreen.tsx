import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { gameApi } from "../../api/draws";
import { apiErrorMessage } from "../../auth/AuthContext";
import { Button, Card, Heading, Muted, Screen, SubHeading, TextInput } from "../../components/ui";
import { Dice } from "../../components/Dice";
import { RuleFlash } from "../../components/RuleFlash";
import { RoundTimer } from "../../components/RoundTimer";
import { announce } from "../../game/voice";
import { useShakeToRoll } from "../../game/shakeDetector";
import { colors, spacing } from "../../theme/colors";
import { DobbelspelStackParamList } from "../../navigation/types";
import { GameSession } from "../../types";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DobbelspelSessionScreen({
  route,
}: NativeStackScreenProps<DobbelspelStackParamList, "DobbelspelSession">) {
  const { joinCode } = route.params;
  const [session, setSession] = useState<GameSession | null>(null);
  const [face, setFace] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [rollId, setRollId] = useState(0);
  const [editing, setEditing] = useState(false);
  const [ruleDrafts, setRuleDrafts] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<GameSession | null>(null);

  const load = useCallback(() => {
    gameApi.getByJoinCode(joinCode).then((s) => {
      setSession(s);
      sessionRef.current = s;
      setRuleDrafts(Object.fromEntries(s.rules.map((r) => [r.face, r.text])));
    });
  }, [joinCode]);

  useEffect(load, [load]);

  const handleRoll = useCallback(() => {
    setRolling((current) => {
      if (current) return current;
      runRoll();
      return true;
    });
  }, []);

  function runRoll() {
    // Quick cycling animation before landing on the final face, so the roll feels physical.
    let ticks = 0;
    const interval = setInterval(() => {
      setFace(1 + Math.floor(Math.random() * 6));
      ticks += 1;
      if (ticks >= 8) {
        clearInterval(interval);
        const finalFace = 1 + Math.floor(Math.random() * 6);
        setFace(finalFace);
        setRolling(false);
        setRollId((id) => id + 1);
        const rule = sessionRef.current?.rules.find((r) => r.face === finalFace);
        if (rule) announce(`${finalFace}! ${rule.text}`);
      }
    }, 90);
  }

  useShakeToRoll(handleRoll, !rolling);

  async function handleSaveRule(faceNum: number) {
    if (!session) return;
    try {
      await gameApi.updateRule(session.id, faceNum, ruleDrafts[faceNum]);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  if (!session) return <Screen />;

  const activeRule = face ? session.rules.find((r) => r.face === face) : null;

  return (
    <Screen style={{ paddingBottom: 0 }}>
      <Heading>{session.title}</Heading>
      <Muted>Join-code: {session.joinCode}</Muted>

      {/* The dice itself is the whole point of this screen, so it gets centered in the
          leftover vertical space rather than just sitting under the title — flexGrow lets
          the same container scroll normally once the rule editor makes it taller than the
          screen. */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingBottom: spacing.xl }}>
        <Card style={{ alignItems: "center", paddingVertical: spacing.xxl }}>
          <Dice face={face} rolling={rolling} />
          <View style={{ height: spacing.lg }} />
          <Muted>Schud je telefoon, of gooi hieronder</Muted>
          <Button title={rolling ? "Gooien…" : "Gooi de dobbelsteen"} onPress={handleRoll} loading={rolling} />
          {activeRule && face ? <RuleFlash rollId={rollId} face={face} text={activeRule.text} /> : null}
        </Card>

        <RoundTimer />

        <View style={{ height: spacing.md }} />
        <Button title={editing ? "Regels verbergen" : "Regels bewerken (host)"} variant="ghost" onPress={() => setEditing((e) => !e)} />
        {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
        {editing ? (
          <Card>
            <SubHeading>Opdrachten per vlak</SubHeading>
            {[1, 2, 3, 4, 5, 6].map((f) => (
              <View key={f} style={{ marginBottom: spacing.md }}>
                <Text style={{ fontWeight: "600", color: colors.text, marginBottom: spacing.xs }}>
                  {DICE_FACES[f]} Vlak {f}
                </Text>
                <TextInput
                  value={ruleDrafts[f] ?? ""}
                  onChangeText={(text) => setRuleDrafts((d) => ({ ...d, [f]: text }))}
                  onSubmitEditing={() => handleSaveRule(f)}
                  onBlur={() => handleSaveRule(f)}
                />
              </View>
            ))}
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
