import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Loading } from "@/shared/components/Loading";
import { useDevicePermission } from "../hooks/useDevicePermission";
import type { PermissionType } from "../models/permission.types";
import { PermissionDeniedView } from "./PermissionDeniedView";
import { PermissionRationaleModal } from "./PermissionRationaleModal";

type PermissionGateProps = {
  type: PermissionType;
  /** Contexte métier optionnel */
  contextReason?: string;
  /** Composant optionnel affiché en cas de refus (utilise PermissionDeniedView par défaut) */
  fallback?: ReactNode;
  /** Contenu à afficher lorsque la permission est accordée */
  children: ReactNode;
};

export function PermissionGate({
  type,
  contextReason,
  fallback,
  children,
}: PermissionGateProps) {
  const {
    isGranted,
    isLoading,
    isRationaleVisible,
    checkStatus,
    confirmRationale,
    dismissRationale,
  } = useDevicePermission(type, { contextReason });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  if (isGranted) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <PermissionRationaleModal
        visible={isRationaleVisible}
        type={type}
        contextReason={contextReason}
        onConfirm={confirmRationale}
        onCancel={dismissRationale}
      />

      {fallback ? (
        fallback
      ) : (
        <PermissionDeniedView
          type={type}
          onRetry={checkStatus}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
