import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  email?: string;
  code: string;
  setCode: (value: string) => void;
  remainingSeconds: number;
  timerLabel: string;
  isLoading: boolean;
  isResending: boolean;
  errorMessage: string;
  infoMessage: string;
  handleVerify: () => void;
  handleResend: () => void;
};

export default function VerifyResetCodeView({
  email,
  code,
  setCode,
  remainingSeconds,
  timerLabel,
  isLoading,
  isResending,
  errorMessage,
  infoMessage,
  handleVerify,
  handleResend,
}: Props) {
  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-2 text-2xl font-bold text-[#143B68]">
        Vérification du code
      </Text>

      <Text className="mb-6 text-gray-600">
        Saisissez le code reçu par e-mail
        {email ? ` à ${email}` : ""}.
      </Text>

      <TextInput
        className="mb-3 rounded-xl border border-gray-300 px-4 py-4 text-center text-2xl tracking-[8px]"
        value={code}
        onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="000000"
        editable={!isLoading}
        accessibilityLabel="Code de vérification à six chiffres"
      />

      <Text className="mb-4 text-center text-gray-600">
        {remainingSeconds > 0
          ? `Le code expire dans ${timerLabel}`
          : "Le code a expiré."}
      </Text>

      {!!errorMessage && (
        <Text className="mb-3 text-sm text-red-600">{errorMessage}</Text>
      )}

      {!!infoMessage && (
        <Text className="mb-3 text-sm text-green-700">{infoMessage}</Text>
      )}

      <Pressable
        className="mb-4 items-center rounded-xl bg-[#185FA5] py-4"
        onPress={handleVerify}
        disabled={isLoading || remainingSeconds <= 0}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-semibold text-white">Vérifier le code</Text>
        )}
      </Pressable>

      <Pressable
        className="items-center py-3"
        onPress={handleResend}
        disabled={isResending}
      >
        {isResending ? (
          <ActivityIndicator color="#185FA5" />
        ) : (
          <Text className="font-semibold text-[#185FA5]">Renvoyer le code</Text>
        )}
      </Pressable>
    </View>
  );
}
