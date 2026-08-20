import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Text } from "react-native";
import { apiErrorMessage, useAuth } from "../../auth/AuthContext";
import { Button, Heading, Muted, Screen, TextInput } from "../../components/ui";
import { AuthStackParamList } from "../../navigation/types";

export function LoginScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, "Login">) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen style={{ justifyContent: "center" }}>
      <Heading>Welkom terug 🎁</Heading>
      <Muted>Log in om je lijstjes, lootjes en Secret Santa te bekijken.</Muted>
      <TextInput
        placeholder="E-mailadres"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ marginTop: 20 }}
      />
      <TextInput placeholder="Wachtwoord" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <Text style={{ color: "#C4392F", marginBottom: 8 }}>{error}</Text> : null}
      <Button title="Inloggen" onPress={handleLogin} loading={loading} />
      <Button title="Nog geen account? Registreer" variant="ghost" onPress={() => navigation.navigate("Register")} />
    </Screen>
  );
}
