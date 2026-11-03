import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  email?: string;
  isLoading: boolean;
  errorMessage: string;
  successMessage: string;
  handleSubmit: (password: string) => void;
};

const passwordRules = [
  {
    label: "Au moins 10 caractères",
    validate: (value: string) => value.length >= 10,
  },
  {
    label: "72 caractères maximum",
    validate: (value: string) => value.length <= 72,
  },
  {
    label: "Une lettre minuscule",
    validate: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "Une lettre majuscule",
    validate: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "Un chiffre",
    validate: (value: string) => /\d/.test(value),
  },
];

export default function ResetPasswordView({
  isLoading,
  errorMessage,
  successMessage,
  handleSubmit,
}: Props) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const passwordIsValid = passwordRules.every((rule) =>
    rule.validate(password),
  );

  const passwordsMatch = confirmation.length > 0 && password === confirmation;

  function handlePress() {
    setValidationError("");

    if (!passwordIsValid) {
      setValidationError(
        "Veuillez respecter toutes les règles du mot de passe.",
      );
      return;
    }

    if (!passwordsMatch) {
      setValidationError("Les mots de passe ne correspondent pas.");
      return;
    }

    handleSubmit(password);
  }

  return (
    <View className="flex-1 justify-center bg-white px-6 py-8">
      <Text className="mb-2 text-2xl font-bold text-[#143B68]">
        Nouveau mot de passe
      </Text>

      <Text className="mb-6 text-gray-600">
        Choisissez un nouveau mot de passe pour votre compte.
      </Text>

      <Text className="mb-2 font-medium text-gray-800">
        Nouveau mot de passe
      </Text>

      <TextInput
        className="mb-4 rounded-xl border border-gray-300 px-4 py-3"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        maxLength={72}
        autoCapitalize="none"
        editable={!isLoading}
        placeholder="Saisissez votre nouveau mot de passe"
      />

      <Text className="mb-2 font-medium text-gray-800">
        Confirmer le mot de passe
      </Text>

      <TextInput
        className="mb-4 rounded-xl border border-gray-300 px-4 py-3"
        value={confirmation}
        onChangeText={setConfirmation}
        secureTextEntry={!showPassword}
        maxLength={72}
        autoCapitalize="none"
        editable={!isLoading}
        placeholder="Confirmez votre mot de passe"
      />

      <Pressable
        className="mb-4 self-start"
        onPress={() => setShowPassword((current) => !current)}
      >
        <Text className="font-medium text-[#185FA5]">
          {showPassword
            ? "Masquer les mots de passe"
            : "Afficher les mots de passe"}
        </Text>
      </Pressable>

      <View className="mb-4">
        {passwordRules.map((rule) => {
          const valid = rule.validate(password);

          return (
            <Text
              key={rule.label}
              className={`mb-1 text-sm ${
                valid ? "text-green-700" : "text-gray-500"
              }`}
            >
              {password.length > 0 && valid ? "✓ " : "• "}
              {rule.label}
            </Text>
          );
        })}
      </View>

      {confirmation.length > 0 && (
        <Text
          className={`mb-3 text-sm ${
            passwordsMatch ? "text-green-700" : "text-red-600"
          }`}
        >
          {passwordsMatch
            ? "✓ Les mots de passe correspondent."
            : "Les mots de passe ne correspondent pas."}
        </Text>
      )}

      {!!validationError && (
        <Text className="mb-3 text-sm text-red-600">{validationError}</Text>
      )}

      {!!errorMessage && (
        <Text className="mb-3 text-sm text-red-600">{errorMessage}</Text>
      )}

      {!!successMessage && (
        <Text className="mb-3 text-sm text-green-700">{successMessage}</Text>
      )}

      <Pressable
        className="items-center rounded-xl bg-[#185FA5] py-4"
        onPress={handlePress}
        disabled={isLoading || !passwordIsValid || !passwordsMatch}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-semibold text-white">
            Réinitialiser le mot de passe
          </Text>
        )}
      </Pressable>
    </View>
  );
}
