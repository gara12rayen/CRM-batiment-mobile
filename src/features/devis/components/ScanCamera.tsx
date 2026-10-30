import { CameraView } from "expo-camera";
import { StyleSheet } from "react-native";

type ScanCameraProps = {
  onScan: (data: string) => void;
  disabled: boolean;
};

export function ScanCamera({ onScan, disabled }: ScanCameraProps) {
  return (
    <CameraView
      style={styles.camera}
      facing="back"
      barcodeScannerSettings={{
        barcodeTypes: ["qr"],
      }}
      onBarcodeScanned={
        disabled ? undefined : ({ data }) => onScan(data)
      }
    />
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
});