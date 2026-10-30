import { useCameraPermissions } from "expo-camera";

import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScanCamera } from "@/features/devis/components/ScanCamera";
import { useScanDevis } from "@/features/devis/viewmodels/useScanDevis";

export function ScanDevisView() {
  const [permission, requestPermission] = useCameraPermissions();

  const { scannedData, handleScan, resetScan } = useScanDevis();

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Chargement de la caméra...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.title}>Accès à la caméra</Text>

          <Text style={styles.description}>
            Autorisez l'accès à la caméra pour scanner le QR code du devis.
          </Text>

          <Pressable style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Autoriser la caméra</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Scanner un devis signé</Text>

      <Text style={styles.description}>
        Placez le QR code du devis devant la caméra.
      </Text>

      <View style={styles.cameraContainer}>
        {scannedData === null ? (
          <ScanCamera onScan={handleScan} disabled={false} />
        ) : (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>QR code détecté</Text>

            <Text selectable style={styles.resultText}>
              {scannedData}
            </Text>
          </View>
        )}
      </View>

      {scannedData !== null && (
        <Pressable style={styles.button} onPress={resetScan}>
          <Text style={styles.buttonText}>Scanner à nouveau</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1E293B",
  },

  description: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },

  cameraContainer: {
    flex: 1,
    minHeight: 300,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
  },

  resultContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#15803D",
  },

  resultText: {
    fontSize: 14,
    color: "#1E293B",
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});