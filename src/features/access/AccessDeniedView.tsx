import { useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { typography } from "@/core/theme/typography";
import { Button } from "@/shared/components/Button";
import { clearSession } from "@/features/auth/services/authStorage";
import type { AccessDenyCode } from "./access.types";
import { denyMessage } from "./accessEngine";
import { MODULE_LABELS } from "./menuCatalog";

const WEB_APP_URL = process.env.EXPO_PUBLIC_APP_URL;

type AccessDeniedViewProps = {
  code?: AccessDenyCode | string;
  permission?: string;
  canGoBack?: boolean;
};

function isDenyCode(value: string | undefined): value is AccessDenyCode {
  return (
    value === "ROLE_WEB_ONLY" ||
    value === "COMPANY_NO_MOBILE" ||
    value === "MODULE_FORBIDDEN" ||
    value === "SESSION_REQUIRED"
  );
}

export function AccessDeniedView({
  code,
  permission,
  canGoBack = true,
}: AccessDeniedViewProps) {
  const router = useRouter();
  const denyCode: AccessDenyCode = isDenyCode(code) ? code : "MODULE_FORBIDDEN";
  const moduleLabel = permission ? MODULE_LABELS[permission] : undefined;
  const message = denyMessage(denyCode, moduleLabel);
  const showWebCta = denyCode === "ROLE_WEB_ONLY" || denyCode === "COMPANY_NO_MOBILE";

  const subtitle = useMemo(() => {
    if (denyCode === "ROLE_WEB_ONLY") {
      return "Profil hors application mobile";
    }
    if (denyCode === "COMPANY_NO_MOBILE") {
      return "Entreprise hors périmètre mobile";
    }
    return "Élément hors périmètre";
  }, [denyCode]);

  async function handleBack() {
    if (denyCode === "ROLE_WEB_ONLY" || denyCode === "COMPANY_NO_MOBILE" || denyCode === "SESSION_REQUIRED") {
      await clearSession();
      router.replace("/(auth)/login");
      return;
    }

    if (canGoBack && router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>{subtitle}</Text>
      <Text style={styles.title}>Accès refusé</Text>
      <Text style={styles.message}>{message}</Text>

      <Button
        label={
          denyCode === "ROLE_WEB_ONLY" || denyCode === "COMPANY_NO_MOBILE"
            ? "Retour à la connexion"
            : "Retour"
        }
        onPress={() => void handleBack()}
      />

      {showWebCta && WEB_APP_URL ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => {
            void Linking.openURL(WEB_APP_URL);
          }}
        >
          <Text style={styles.link}>Ouvrir la version web</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background.DEFAULT,
  },
  kicker: {
    ...typography.caption,
    color: colors.status.error,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    ...typography.title,
    color: colors.text.DEFAULT,
  },
  message: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  link: {
    ...typography.body,
    color: colors.brand[700],
    textAlign: "center",
    fontWeight: "600",
    marginTop: spacing.sm,
  },
});
