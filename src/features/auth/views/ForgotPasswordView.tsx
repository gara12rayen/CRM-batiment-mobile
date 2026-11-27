import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  onSubmit: (email: string) => void;
  isLoading: boolean;
  errorMessage: string;
};

export default function ForgotPasswordView({
  onSubmit,
  isLoading,
  errorMessage,
}: Props) {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");

  function handlePress() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setValidationError("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    setValidationError("");
    onSubmit(normalizedEmail);
  }

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-2 text-2xl font-bold text-[#143B68]">
        Mot de passe oublié ?
      </Text>

      <Text className="mb-6 text-base text-gray-600">
        Saisissez votre adresse e-mail pour recevoir un code de vérification.
      </Text>

      <Text className="mb-2 font-medium text-gray-800">Adresse e-mail</Text>

      <TextInput
        className="mb-2 rounded-xl border border-gray-300 px-4 py-3 text-base"
        value={email}
        onChangeText={setEmail}
        placeholder="nom@exemple.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
        accessibilityLabel="Adresse e-mail"
      />

      {!!validationError && (
        <Text className="mb-3 text-sm text-red-600">{validationError}</Text>
      )}

      {!!errorMessage && (
        <Text className="mb-3 text-sm text-red-600">{errorMessage}</Text>
      )}

      <Pressable
        className="items-center rounded-xl bg-[#185FA5] py-4"
        onPress={handlePress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-semibold text-white">Envoyer le code</Text>
        )}
      </Pressable>
    </View>
  );
}
