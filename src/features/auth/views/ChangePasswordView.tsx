import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";

import {
  PASSWORD_POLICY,
  type ChangePasswordCredentials,
} from "@/features/auth/models/auth.types";

type ChangePasswordViewProps = {
  onSubmit: (values: ChangePasswordCredentials) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | null;
};

type FormValues = ChangePasswordCredentials & {
  confirmPassword: string;
};

const passwordRules = [
  {
    label: `Au moins ${PASSWORD_POLICY.minLength} caractères`,
    validate: (value: string) => value.length >= PASSWORD_POLICY.minLength,
  },
  {
    label: "Moins de 72 caractères",
    validate: (value: string) => value.length <= PASSWORD_POLICY.maxLength,
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
    validate: (value: string) => /[0-9]/.test(value),
  },
];

export function ChangePasswordView({
  onSubmit,
  isLoading = false,
  errorMessage,
}: ChangePasswordViewProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const currentPassword = watch("currentPassword");
  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  const allRulesValid = passwordRules.every((rule) =>
    rule.validate(newPassword),
  );

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const canSubmit =
    currentPassword.length > 0 &&
    currentPassword.length <= PASSWORD_POLICY.maxLength &&
    allRulesValid &&
    passwordsMatch &&
    !isLoading;

  const submit = (values: FormValues) => {
    void onSubmit({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1, padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center">
        <Text className="mb-2 text-2xl font-bold text-[#143B68]">
          Changement obligatoire
        </Text>

        <Text className="mb-6 text-base leading-6 text-gray-600">
          Pour sécuriser votre compte, vous devez choisir un nouveau mot de
          passe avant de continuer.
        </Text>

        <Text className="mb-2 font-semibold text-gray-800">
          Mot de passe actuel
        </Text>

        <Controller
          control={control}
          name="currentPassword"
          rules={{
            required: "Le mot de passe actuel est obligatoire.",
            maxLength: {
              value: 72,
              message: "Maximum 72 caractères.",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="mb-1 rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900"
              placeholder="Votre mot de passe temporaire"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={!showCurrentPassword}
              maxLength={72}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          )}
        />

        {errors.currentPassword && (
          <Text className="mb-3 text-sm text-red-600">
            {errors.currentPassword.message}
          </Text>
        )}

        <Pressable
          className="mb-5 self-end"
          onPress={() => setShowCurrentPassword((value) => !value)}
        >
          <Text className="text-sm font-medium text-[#185FA5]">
            {showCurrentPassword ? "Masquer" : "Afficher"} le mot de passe
          </Text>
        </Pressable>

        <Text className="mb-2 font-semibold text-gray-800">
          Nouveau mot de passe
        </Text>

        <Controller
          control={control}
          name="newPassword"
          rules={{
            required: "Le nouveau mot de passe est obligatoire.",
            validate: (value) =>
              passwordRules.every((rule) => rule.validate(value)) ||
              PASSWORD_POLICY.description,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900"
              placeholder="Choisissez un nouveau mot de passe"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={!showNewPassword}
              maxLength={72}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          )}
        />

        <Pressable
          className="mb-4 mt-2 self-end"
          onPress={() => setShowNewPassword((value) => !value)}
        >
          <Text className="text-sm font-medium text-[#185FA5]">
            {showNewPassword ? "Masquer" : "Afficher"} le mot de passe
          </Text>
        </Pressable>

        <View className="mb-6 rounded-xl bg-gray-50 p-4">
          <Text className="mb-3 font-semibold text-gray-800">
            Votre mot de passe doit contenir :
          </Text>

          {passwordRules.map((rule) => {
            const valid = rule.validate(newPassword);

            return (
              <View key={rule.label} className="mb-2 flex-row items-center">
                <Text
                  className={`mr-2 text-base font-bold ${
                    valid ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {valid ? "✓" : "○"}
                </Text>
                <Text
                  className={`text-sm ${
                    valid ? "text-green-700" : "text-gray-600"
                  }`}
                >
                  {rule.label}
                </Text>
              </View>
            );
          })}
        </View>

        <Text className="mb-2 font-semibold text-gray-800">
          Confirmer le nouveau mot de passe
        </Text>

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: "Veuillez confirmer votre nouveau mot de passe.",
            validate: (value) =>
              value === newPassword ||
              "Les mots de passe ne correspondent pas.",
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900"
              placeholder="Confirmez votre nouveau mot de passe"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={!showConfirmation}
              maxLength={72}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          )}
        />

        <Pressable
          className="mb-2 mt-2 self-end"
          onPress={() => setShowConfirmation((value) => !value)}
        >
          <Text className="text-sm font-medium text-[#185FA5]">
            {showConfirmation ? "Masquer" : "Afficher"} le mot de passe
          </Text>
        </Pressable>

        {confirmPassword.length > 0 && (
          <Text
            className={`mb-4 text-sm ${
              passwordsMatch ? "text-green-700" : "text-red-600"
            }`}
          >
            {passwordsMatch
              ? "✓ Les mots de passe correspondent."
              : "Les mots de passe ne correspondent pas."}
          </Text>
        )}

        {errors.newPassword && (
          <Text className="mb-3 text-sm text-red-600">
            {errors.newPassword.message}
          </Text>
        )}

        {errorMessage && (
          <Text className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </Text>
        )}

        <Pressable
          className={`mt-2 items-center rounded-xl py-4 ${
            canSubmit ? "bg-[#185FA5]" : "bg-gray-300"
          }`}
          disabled={!canSubmit}
          onPress={handleSubmit(submit)}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-semibold text-white">
              Confirmer le nouveau mot de passe
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
