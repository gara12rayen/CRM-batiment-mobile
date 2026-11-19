import { useRef } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import SignatureScreen, { type SignatureViewRef } from "react-native-signature-canvas";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

/** The API refuses a signature over 500 Ko (base64 text of about 700 000 characters). */
const TAILLE_MAX = 700_000;

type Props = {
  visible: boolean;
  titre: string;
  sousTitre?: string;
  onFermer: () => void;
  /** PNG as « data:image/png;base64,… » (the format the API expects) */
  onValider: (png: string) => void;
  onErreur?: (message: string) => void;
};

/**
 * Full-screen signature area (react-native-signature-canvas, needs react-native-webview).
 * Full screen on purpose: in a scrolling page the finger would scroll instead of drawing.
 */
export function SignaturePad({ visible, titre, sousTitre, onFermer, onValider, onErreur }: Props) {
  const ref = useRef<SignatureViewRef>(null);

  const recu = (png: string) => {
    if (!png.startsWith("data:image/png;base64,")) {
      onErreur?.("Signature illisible. Recommencez.");
      return;
    }
    if (png.length > TAILLE_MAX) {
      onErreur?.("Signature trop lourde. Effacez et signez plus simplement.");
      return;
    }
    onValider(png);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onFermer}>
      <View style={styles.page}>
        <View style={styles.entete}>
          <Text style={styles.titre}>{titre}</Text>
          {sousTitre ? <Text style={styles.sousTitre}>{sousTitre}</Text> : null}
        </View>

        <View style={styles.zone}>
          <SignatureScreen
            ref={ref}
            onOK={recu}
            onEmpty={() => onErreur?.("Signez dans le cadre avant de valider.")}
            imageType="image/png"
            autoClear={false}
            descriptionText=""
            webStyle={WEB_STYLE}
          />
        </View>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={onFermer} style={[styles.bouton, styles.outline]}>
            <Text style={styles.outlineTexte}>Annuler</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => ref.current?.clearSignature()} style={[styles.bouton, styles.outline]}>
            <Text style={styles.outlineTexte}>Effacer</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => ref.current?.readSignature()} style={[styles.bouton, styles.primaire]}>
            <Text style={styles.primaireTexte}>Valider</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/** Hides the built-in buttons of the library: ours are below the area. */
const WEB_STYLE = `
  .m-signature-pad { box-shadow: none; border: 2px dashed #D8E2EE; border-radius: 12px; margin: 0; }
  .m-signature-pad--footer { display: none; }
  .m-signature-pad--body { border: none; }
  body, html { width: 100%; height: 100%; }
`;

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT, paddingTop: spacing["3xl"], padding: spacing.lg, gap: spacing.md },
  entete: { gap: spacing.xs },
  titre: { fontSize: 20, fontWeight: "700", color: colors.text.DEFAULT },
  sousTitre: { color: colors.text.muted },
  zone: { flex: 1, backgroundColor: colors.white, borderRadius: 12, overflow: "hidden" },
  actions: { flexDirection: "row", gap: spacing.sm, paddingBottom: spacing.lg },
  bouton: { flex: 1, borderRadius: 10, padding: spacing.md, alignItems: "center" },
  primaire: { backgroundColor: colors.brand[700] },
  primaireTexte: { color: colors.white, fontWeight: "700" },
  outline: { borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  outlineTexte: { color: colors.text.DEFAULT, fontWeight: "600" },
});
