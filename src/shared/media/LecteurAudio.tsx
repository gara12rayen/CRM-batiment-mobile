import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

const duree = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Play / pause a local audio file (already downloaded). */
export function LecteurAudio({ uri, libelle }: { uri: string; libelle: string }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  const basculer = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration - 0.2)) player.seekTo(0);
    player.play();
  };

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${status.playing ? "Pause" : "Écouter"} : ${libelle}`} onPress={basculer} style={({ pressed }) => [styles.ligne, pressed && styles.pressed]}>
      <View style={styles.bouton}>
        <Text style={styles.icone}>{status.playing ? "❚❚" : "▶"}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.libelle}>{libelle}</Text>
        <Text style={styles.temps}>
          {duree(status.currentTime)} / {status.duration > 0 ? duree(status.duration) : "—"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  pressed: { opacity: 0.7 },
  bouton: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.brand[700], alignItems: "center", justifyContent: "center" },
  icone: { color: colors.white, fontWeight: "700" },
  flex: { flex: 1 },
  libelle: { color: colors.text.DEFAULT, fontWeight: "600" },
  temps: { color: colors.text.muted, fontSize: 12 },
});
