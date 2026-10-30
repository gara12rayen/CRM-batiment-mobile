import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { colors, radius, spacing } from "@/core/theme";

export type LoginFormValues = {
  email: string;
  password: string;
};

type LoginViewProps = {
  onLogin: (values: LoginFormValues) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | null;
};

export default function LoginView({
  onLogin,
  isLoading = false,
  errorMessage = null,
}: LoginViewProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Initializes the form and tracks validation errors.
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submit = async (values: LoginFormValues) => {
    await onLogin({
      email: values.email.trim(),
      password: values.password,
    });
  };

  return (
    <View
      className="flex-1 justify-center px-6"
      style={{ backgroundColor: colors.background.DEFAULT }}
    >
      <View className="w-full self-center" style={{ maxWidth: 420 }}>
        {/* Header */}
        <View className="mb-8 items-center">
          <View
            className="mb-5 items-center justify-center"
            style={{
              width: 68,
              height: 68,
              borderRadius: radius.xl,
              backgroundColor: colors.brand[700],
            }}
          >
            <Text className="text-3xl font-bold text-white">B</Text>
          </View>

          <Text
            className="text-3xl font-bold"
            style={{ color: colors.text.DEFAULT }}
          >
            BâtiFlow
          </Text>

          <Text
            className="mt-2 text-center text-base"
            style={{ color: colors.text.muted }}
          >
            Connectez-vous à votre espace professionnel
          </Text>
        </View>

        {/* Login card */}
        <View
          className="p-6"
          style={{
            backgroundColor: colors.surface.DEFAULT,
            borderRadius: radius.xl,
            borderWidth: 1,
            borderColor: colors.border.DEFAULT,
          }}
        >
          <Text
            className="mb-1 text-2xl font-bold"
            style={{ color: colors.text.DEFAULT }}
          >
            Connexion
          </Text>

          <Text className="mb-6 text-sm" style={{ color: colors.text.muted }}>
            Entrez vos identifiants pour continuer.
          </Text>

          {/* Email */}
          <View className="mb-4">
            <Text
              className="mb-2 text-sm font-semibold"
              style={{ color: colors.text.DEFAULT }}
            >
              Adresse e-mail
            </Text>

            <Controller
              control={control}
              name="email"
              rules={{
                required: "L'adresse e-mail est obligatoire.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Veuillez saisir une adresse e-mail valide.",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="nom@entreprise.com"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  editable={!isLoading}
                  accessibilityLabel="Adresse e-mail"
                  className="border px-4 py-3"
                  style={{
                    color: colors.text.DEFAULT,
                    backgroundColor: colors.background.soft,
                    borderColor: errors.email
                      ? colors.status.error
                      : colors.border.DEFAULT,
                    borderRadius: radius.md,
                    minHeight: 48,
                  }}
                />
              )}
            />

            {errors.email && (
              <Text
                className="mt-1 text-sm"
                style={{ color: colors.status.error }}
                accessibilityRole="alert"
              >
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* Password */}
          <View className="mb-5">
            <Text
              className="mb-2 text-sm font-semibold"
              style={{ color: colors.text.DEFAULT }}
            >
              Mot de passe
            </Text>

            <View
              className="flex-row items-center border"
              style={{
                backgroundColor: colors.background.soft,
                borderColor: errors.password
                  ? colors.status.error
                  : colors.border.DEFAULT,
                borderRadius: radius.md,
                minHeight: 48,
              }}
            >
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "Le mot de passe est obligatoire.",
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Votre mot de passe"
                    placeholderTextColor={colors.text.muted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="current-password"
                    editable={!isLoading}
                    accessibilityLabel="Mot de passe"
                    className="flex-1 px-4 py-3"
                    style={{ color: colors.text.DEFAULT }}
                  />
                )}
              />

              <Pressable
                onPress={() => setShowPassword((current) => !current)}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                className="px-3 py-3"
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.brand[700] }}
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </Text>
              </Pressable>
            </View>

            {errors.password && (
              <Text
                className="mt-1 text-sm"
                style={{ color: colors.status.error }}
                accessibilityRole="alert"
              >
                {errors.password.message}
              </Text>
            )}
          </View>

          {/* Backend error */}
          {errorMessage && (
            <View
              className="mb-4 p-3"
              style={{
                backgroundColor: "#FEF2F2",
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: "#FECACA",
              }}
            >
              <Text
                className="text-sm"
                style={{ color: colors.status.error }}
                accessibilityRole="alert"
              >
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Submit button */}
          <Pressable
            onPress={handleSubmit(submit)}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Se connecter"
            className="flex-row items-center justify-center px-4 py-4"
            style={{
              backgroundColor: isLoading
                ? colors.brand[500]
                : colors.brand[700],
              borderRadius: radius.md,
              minHeight: 50,
              opacity: isLoading ? 0.8 : 1,
            }}
          >
            {isLoading && (
              <ActivityIndicator
                color={colors.white}
                style={{ marginRight: spacing.sm }}
              />
            )}

            <Text className="text-base font-bold text-white">
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Text
          className="mt-6 text-center text-xs"
          style={{ color: colors.text.muted }}
        >
          BâtiFlow · Espace professionnel sécurisé
        </Text>
      </View>
    </View>
  );
}
