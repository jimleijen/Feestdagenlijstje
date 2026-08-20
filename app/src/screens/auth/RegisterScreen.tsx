import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Text } from "react-native";
import { apiErrorMessage, useAuth } from "../../auth/AuthContext";
import { Button, Heading, Muted, Screen, TextInput } from "../../components/ui";
import { AuthStackParamList } from "../../navigation/types";

export function RegisterScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, "Register">) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setLoading(true);
    setError(null);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen style={{ justifyContent: "center" }}>
      <Heading>Account maken</Heading>
      <Muted>Nodig om lijstjes te delen en lootjes te trekken.</Muted>
      <TextInput placeholder="Naam" value={name} onChangeText={setName} style={{ marginTop: 20 }} />
      <TextInput
        placeholder="E-mailadres"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput placeholder="Wachtwoord (min. 8 tekens)" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <Text style={{ color: "#C4392F", marginBottom: 8 }}>{error}</Text> : null}
      <Button title="Registreren" onPress={handleRegister} loading={loading} />
      <Button title="Al een account? Log in" variant="ghost" onPress={() => navigation.navigate("Login")} />
    </Screen>
  );
}
