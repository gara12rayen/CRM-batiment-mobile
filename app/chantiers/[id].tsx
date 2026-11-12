import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AccessGate } from "@/features/access/AccessGate";
import { useAccess } from "@/features/access/AccessProvider";
import { PlaceholderView } from "@/shared/components/PlaceholderView";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

export default function ChantierDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <AccessGate permission="chantiers.read">
      <ChantierDetailsContent id={id} />
    </AccessGate>
  );
}

function ChantierDetailsContent({ id }: { id: string | undefined }) {
  const { profile } = useAccess();

  return (
    <PlaceholderView
      title="Détail du chantier"
      description={
        profile.canSeePrices
          ? `Chantier : ${id ?? "—"}`
          : `Chantier : ${id ?? "—"} · les prix ne sont pas visibles sur ce profil`
      }
    >
      <View style={styles.sections}>
        {profile.chantierSections.map((section) => (
          <Text key={section.id} style={styles.section}>
            {section.title}
          </Text>
        ))}
      </View>
    </PlaceholderView>
  );
}

const styles = StyleSheet.create({
  sections: { marginTop: spacing.md, gap: spacing.sm },
  section: { color: colors.text.DEFAULT, fontSize: 16 },
});
