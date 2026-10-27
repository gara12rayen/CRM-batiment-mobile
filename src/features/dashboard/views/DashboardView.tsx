
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  color: string;
  onPress?: () => void;
};

type SectionTitleProps = {
  title: string;
  action?: string;
  onPress?: () => void;
};

type QuoteStatus = {
  label: string;
  color: string;
};

function MetricCard({
  title,
  value,
  description,
  color,
  onPress,
}: MetricCardProps) {
  const content = (
    <>
      <View style={[styles.metricAccent, { backgroundColor: color }]} />

      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDescription}>{description}</Text>

      {onPress && (
        <Text style={styles.cardAction}>
          Consulter
        </Text>
      )}
    </>
  );

  if (!onPress) {
    return <View style={styles.metricCard}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}. Consulter les détails.`}
      style={({ pressed }) => [
        styles.metricCard,
        pressed && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

function SectionTitle({
  title,
  action,
  onPress,
}: SectionTitleProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {action && onPress && (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text style={styles.actionText}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

function QuoteStatusRow({
  status,
  onPress,
}: {
  status: QuoteStatus;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Consulter les devis : ${status.label}`}
      style={({ pressed }) => [
        styles.statusRow,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.statusLabelContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: status.color },
          ]}
        />

        <Text style={styles.statusLabel}>{status.label}</Text>
      </View>

      <View style={styles.statusRight}>
        <Text style={styles.pendingValue}>—</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

export function DashboardView() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Deux colonnes sur téléphone, trois sur les écrans larges.
  const columns = width >= 700 ? 3 : 2;

  const horizontalPadding = spacing.md * 2;
  const gridGap = spacing.sm;

  const cardWidth =
    (width - horizontalPadding - gridGap * (columns - 1)) /
    columns;

  const quoteStatuses: QuoteStatus[] = [
    { label: "Brouillons", color: "#64748B" },
    { label: "Envoyés", color: "#2563EB" },
    { label: "Signés", color: "#16A34A" },
    { label: "Refusés", color: "#DC2626" },
  ];

  const openRequests = () => router.push("/prospects");
  const openQuotes = () => router.push("/devis");

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* En-tête */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeEyebrow}>
          ESPACE COMMERCIAL
        </Text>

        <Text style={styles.welcomeTitle}>
          Bonjour ! 👋
        </Text>

        <Text style={styles.welcomeDescription}>
          Suivez vos demandes, vos devis et vos visites
          programmées depuis votre tableau de bord.
        </Text>
      </View>

      {/* SECTION 1 : DEMANDES */}
      <View style={styles.section}>
        <SectionTitle
          title="Demandes à traiter"
          action="Voir tout"
          onPress={openRequests}
        />

        <View style={styles.metricsGrid}>
          <View style={{ width: cardWidth }}>
            <MetricCard
              title="À traiter"
              value="—"
              description="Demandes en attente"
              color="#F59E0B"
              onPress={openRequests}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.cardHeadingRow}>
            <Text style={styles.cardHeading}>
              Demandes récentes
            </Text>

            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>
                En attente
              </Text>
            </View>
          </View>

          <EmptyState
            title="Aucune demande chargée"
            description="Les demandes à traiter apparaîtront ici lorsque les données du backend seront disponibles."
          />

          <Pressable
            onPress={openRequests}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              Consulter les demandes
            </Text>
          </Pressable>
        </View>
      </View>

      {/* SECTION 2 : DEVIS */}
      <View style={styles.section}>
        <SectionTitle
          title="Devis par statut"
          action="Voir tout"
          onPress={openQuotes}
        />

        <View style={styles.metricsGrid}>
          <View style={{ width: cardWidth }}>
            <MetricCard
              title="Tous les devis"
              value="—"
              description="Tous les statuts"
              color={colors.primary}
              onPress={openQuotes}
            />
          </View>

          <View style={{ width: cardWidth }}>
            <MetricCard
              title="Devis signés"
              value="—"
              description="Devis acceptés"
              color="#16A34A"
              onPress={openQuotes}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          {quoteStatuses.map((status) => (
            <QuoteStatusRow
              key={status.label}
              status={status}
              onPress={openQuotes}
            />
          ))}

          <Text style={styles.helperText}>
            Les compteurs seront renseignés après la connexion
            aux API du backend.
          </Text>
        </View>
      </View>

      {/* SECTION 3 : VISITES */}
      <View style={styles.section}>
        <SectionTitle title="Visites programmées" />

        <View style={styles.metricsGrid}>
          <View style={{ width: cardWidth }}>
            <MetricCard
              title="À venir"
              value="—"
              description="Visites programmées"
              color="#8B5CF6"
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.cardHeading}>
            Prochaines visites
          </Text>

          <EmptyState
            title="Aucune visite chargée"
            description="Le planning apparaîtra ici après l'intégration des données de visites."
          />
        </View>
      </View>

      <Text style={styles.footer}>
        CRM Bâtiment · Tableau de bord commercial
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },

  welcomeCard: {
    backgroundColor: "#1E3A8A",
    borderRadius: 18,
    padding: spacing.lg,
    gap: spacing.sm,
  },

  welcomeEyebrow: {
    color: "#BFDBFE",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },

  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "700",
  },

  welcomeDescription: {
    color: "#DBEAFE",
    fontSize: 14,
    lineHeight: 21,
  },

  section: {
    gap: spacing.md,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  sectionTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },

  actionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  metricCard: {
    minHeight: 142,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: spacing.md,
    gap: 7,
    overflow: "hidden",
  },

  metricAccent: {
    width: 30,
    height: 4,
    borderRadius: 2,
    marginBottom: 3,
  },

  metricTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "500",
  },

  metricValue: {
    color: colors.text,
    fontSize: 27,
    fontWeight: "700",
  },

  metricDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },

  cardAction: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  pressed: {
    opacity: 0.7,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: spacing.md,
    gap: spacing.md,
  },

  cardHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  cardHeading: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },

  sectionBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  sectionBadgeText: {
    color: "#92400E",
    fontSize: 11,
    fontWeight: "600",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },

  rowPressed: {
    opacity: 0.65,
  },

  statusLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  statusLabel: {
    color: colors.text,
    fontSize: 14,
  },

  statusRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  pendingValue: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "700",
  },

  chevron: {
    color: colors.muted,
    fontSize: 23,
  },

  helperText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: spacing.sm,
  },

  emptyState: {
    gap: spacing.sm,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },

  emptyDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  footer: {
    color: colors.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
