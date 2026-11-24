import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
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
 * Web version of the signature area (Expo picks this file in the browser): a plain HTML canvas
 * drawn with the mouse, the finger or a pen. The phone keeps SignaturePad.tsx
 * (react-native-signature-canvas, which needs a WebView that does not exist on the web).
 */
export function SignaturePad({ visible, titre, sousTitre, onFermer, onValider, onErreur }: Props) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const dessin = useRef(false);
  const [vide, setVide] = useState(true);

  // Canvas at the real size of its box (sharp lines on high-density screens), white background
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      const c = canvas.current;
      if (!c) return;
      const r = c.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      c.width = Math.max(1, Math.round(r.width * ratio));
      c.height = Math.max(1, Math.round(r.height * ratio));
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.scale(ratio, ratio);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, r.width, r.height);
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0F172A";
      setVide(true);
    }, 50);
    return () => clearTimeout(t);
  }, [visible]);

  const point = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const debut = (e: PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dessin.current = true;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.stroke();
    setVide(false);
  };

  const suite = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!dessin.current) return;
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const fin = () => {
    dessin.current = false;
  };

  const effacer = () => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const r = c.getBoundingClientRect();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, r.width, r.height);
    setVide(true);
  };

  const valider = () => {
    if (vide || !canvas.current) {
      onErreur?.("Signez dans le cadre avant de valider.");
      return;
    }
    const png = canvas.current.toDataURL("image/png");
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
          <canvas
            ref={canvas}
            aria-label="Zone de signature"
            onPointerDown={debut}
            onPointerMove={suite}
            onPointerUp={fin}
            onPointerLeave={fin}
            onPointerCancel={fin}
            style={{ width: "100%", height: "100%", touchAction: "none", cursor: "crosshair", display: "block" }}
          />
        </View>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={onFermer} style={[styles.bouton, styles.outline]}>
            <Text style={styles.outlineTexte}>Annuler</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={effacer} style={[styles.bouton, styles.outline]}>
            <Text style={styles.outlineTexte}>Effacer</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={valider} style={[styles.bouton, styles.primaire]}>
            <Text style={styles.primaireTexte}>Valider</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT, padding: spacing.lg, gap: spacing.md },
  entete: { gap: spacing.xs },
  titre: { fontSize: 20, fontWeight: "700", color: colors.text.DEFAULT },
  sousTitre: { color: colors.text.muted },
  zone: { flex: 1, backgroundColor: colors.white, borderRadius: 12, overflow: "hidden", borderWidth: 2, borderStyle: "dashed", borderColor: colors.border.DEFAULT, minHeight: 240 },
  actions: { flexDirection: "row", gap: spacing.sm, paddingBottom: spacing.lg },
  bouton: { flex: 1, borderRadius: 10, padding: spacing.md, alignItems: "center" },
  primaire: { backgroundColor: colors.brand[700] },
  primaireTexte: { color: colors.white, fontWeight: "700" },
  outline: { borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  outlineTexte: { color: colors.text.DEFAULT, fontWeight: "600" },
});
