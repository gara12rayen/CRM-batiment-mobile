
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";
import { formatDate, formatEuros, fullName } from "@/shared/utils/format";
import { DEMANDE_STATUT } from "../models/CommercialDashboard";
import { useCommercialDashboardViewModel } from "../viewmodels/useCommercialDashboardViewModel";

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
        <Text style={styles.cardAction}>Consulter</Text>
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
  count,
  onPress,
}: {
  status: QuoteStatus;
  count: number | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Consulter les devis : ${status.label}${count !== null ? `, ${count}` : ""}`}
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
        <Text style={[styles.pendingValue, count !== null && styles.countValue]}>
          {count ?? "—"}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

const heure = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function DashboardView() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user, isLoading } = useAuth();
  const vm = useCommercialDashboardViewModel();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user || !permissions.canAccessCommercial(user.role)) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Vous n'avez pas accès au tableau de bord commercial."
      />
    );
  }

  // Deux colonnes sur téléphone, trois sur les écrans larges.
  const columns = width >= 700 ? 3 : 2;

  const horizontalPadding = spacing.md * 2;
  const gridGap = spacing.sm;

  const cardWidth =
    (width - horizontalPadding - gridGap * (columns - 1)) /
    columns;

  const d = vm.donnees;
  const n = (v: number | undefined) => (v === undefined ? "—" : String(v));
  const peutConvertir = permissions.canConvertRequest(user.role);

  const quoteStatuses: (QuoteStatus & { count: number | null })[] = [
    { label: "Brouillons", color: "#64748B", count: d?.devis.brouillons ?? null },
    { label: "En attente du client", color: "#2563EB", count: d?.devis.enAttenteClient ?? null },
    { label: "Acceptés (à signer)", color: "#7C3AED", count: d?.devis.acceptes ?? null },
    { label: "Signés papier à vérifier", color: "#D97706", count: d?.devis.signesPapierAVerifier ?? null },
  ];

  const openRequests = () => router.push("/prospects");
  const openQuotes = () => router.push("/devis");
  const openQuote = (id: number) =>
    router.push({ pathname: "/devis/[id]", params: { id: String(id) } });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} />
      }
    >
      {/* En-tête */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeEyebrow}>
          {d?.perimetre === "MOI" ? "MON ESPACE COMMERCIAL" : "ESPACE COMMERCIAL"}
        </Text>

        <Text style={styles.welcomeTitle}>
          Bonjour {user.prenom} ! 👋
        </Text>

        <Text style={styles.welcomeDescription}>
          Suivez vos demandes, vos devis et vos visites
          programmées depuis votre tableau de bord.
        </Text>
      </View>

      {vm.loading && !d ? (
        <ActivityIndicator size="large" color={colors.brand[700]} />
      ) : null}

      {vm.erreur ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{vm.erreur}</Text>
          <Pressable onPress={() => void vm.retry()} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.actionText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : null}

      {/* CHIFFRE D'AFFAIRES DU MOIS */}
      <View style={styles.section}>
        <SectionTitle title="Ce mois-ci" />
        <View style={styles.metricsGrid}>
          <View style={{ width: cardWidth }}>
            <MetricCard
              title="CA signé HT"
              value={d ? formatEuros(d.chiffreAffaires.signeMoisHT) : "—"}
              description={d ? `${d.chiffreAffaires.devisSignesMois} devis signé(s)` : "Devis signés du mois"}
              color="#16A34A"
            />
          </View>
          <View style={{ width: cardWidth }}>
            <MetricCard
              title="Conversion"
              value={d?.conversion.taux !== null && d?.conversion.taux !== undefined ? `${String(d.conversion.taux).replace(".", ",")} %` : "—"}
              description={d ? `${d.conversion.gagnes} gagné(s) sur ${d.conversion.envoyes} envoyé(s) en ${d.periodeJours} j` : "Devis gagnés / envoyés"}
              color={colors.brand[700]}
            />
          </View>
        </View>
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
              value={n(d?.prospects.total)}
              description={d ? `${d.prospects.nouveaux} nouvelle(s) · ${d.prospects.enCours} en cours · ${d.prospects.qualifies} qualifiée(s)` : "Demandes en attente"}
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

          {d && !d.prospects.derniers.length ? (
            <EmptyState
              title="Aucune demande à traiter"
              description="Les nouvelles demandes de vos clients apparaîtront ici."
            />
          ) : null}

          {d?.prospects.derniers.map((dm) => {
            const statut = DEMANDE_STATUT[dm.statut];
            return (
              <View key={dm.id} style={styles.itemRow}>
                <Pressable
                  onPress={() => router.push({ pathname: "/prospects/[id]", params: { id: String(dm.id) } })}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.itemMain, pressed && styles.rowPressed]}
                >
                  <Text style={styles.itemTitle}>{fullName(dm.client) || "Client"}</Text>
                  <Text style={styles.itemMeta}>
                    {dm.reference} · {formatDate(dm.createdAt)}
                  </Text>
                  {statut ? (
                    <Text style={[styles.itemBadge, { color: statut.couleur, backgroundColor: statut.fond }]}>
                      {statut.label}
                    </Text>
                  ) : null}
                </Pressable>
                {peutConvertir ? (
                  <Pressable
                    onPress={() => void vm.creerDevis(dm.id)}
                    disabled={vm.conversion !== null}
                    accessibilityRole="button"
                    accessibilityLabel={`Créer le devis de la demande ${dm.reference}`}
                    style={({ pressed }) => [styles.smallButton, (pressed || vm.conversion !== null) && styles.pressed]}
                  >
                    <Text style={styles.smallButtonText}>
                      {vm.conversion === dm.id ? "Création…" : "Créer le devis"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}

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

        <View style={styles.sectionCard}>
          {quoteStatuses.map((status) => (
            <QuoteStatusRow
              key={status.label}
              status={status}
              count={status.count}
              onPress={openQuotes}
            />
          ))}
        </View>

        {d?.aRelancer.items.length ? (
          <View style={styles.sectionCard}>
            <View style={styles.cardHeadingRow}>
              <Text style={styles.cardHeading}>À relancer ({d.aRelancer.total})</Text>
              <Text style={styles.itemMeta}>sans réponse depuis {d.aRelancer.joursSansReponse} j</Text>
            </View>
            {d.aRelancer.items.map((dv) => (
              <Pressable
                key={dv.id}
                onPress={() => openQuote(dv.id)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.statusRow, pressed && styles.rowPressed]}
              >
                <View style={styles.itemMain}>
                  <Text style={styles.itemTitle}>{fullName(dv.client) || "Client"}</Text>
                  <Text style={styles.itemMeta}>
                    {dv.reference} · envoyé le {formatDate(dv.dateEnvoi ?? dv.remisLe)}
                  </Text>
                </View>
                <Text style={styles.itemAmount}>{formatEuros(dv.totalTTC)}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      {/* SECTION 3 : VISITES */}
      <View style={styles.section}>
        <SectionTitle title="Visites programmées" />

        <View style={styles.metricsGrid}>
          <View style={{ width: cardWidth }}>
            <MetricCard
              title="À venir"
              value={n(d?.visites.aVenir)}
              description="Visites programmées"
              color="#8B5CF6"
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.cardHeading}>
            Prochaines visites
          </Text>

          {d && !d.visites.prochaines.length ? (
            <EmptyState
              title="Aucune visite programmée"
              description="Les visites prévues chez vos clients apparaîtront ici."
            />
          ) : null}

          {d?.visites.prochaines.map((v) => (
            <View key={v.id} style={styles.visitRow}>
              <Text style={styles.visitDate}>{heure(v.dateHeure)}</Text>
              <Text style={styles.itemTitle}>{fullName(v.client) || "Client"}</Text>
              {v.objet ? <Text style={styles.itemMeta}>{v.objet}</Text> : null}
              {v.adresse ? <Text style={styles.itemMeta}>{v.adresse}</Text> : null}
              {d.perimetre === "ENTREPRISE" && v.commercial ? (
                <Text style={styles.itemMeta}>Avec {fullName(v.commercial)}</Text>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.footer}>
        CRM Bâtiment · Tableau de bord commercial
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

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
    color: colors.text.DEFAULT,
    fontSize: 18,
    fontWeight: "700",
  },

  actionText: {
    color: colors.brand[700],
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
    color: colors.text.muted,
    fontSize: 13,
    fontWeight: "500",
  },

  metricValue: {
    color: colors.text.DEFAULT,
    fontSize: 27,
    fontWeight: "700",
  },

  metricDescription: {
    color: colors.text.muted,
    fontSize: 12,
    lineHeight: 17,
  },

  cardAction: {
    color: colors.brand[700],
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
    color: colors.text.DEFAULT,
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
    color: colors.text.DEFAULT,
    fontSize: 14,
  },

  statusRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  pendingValue: {
    color: colors.text.muted,
    fontSize: 16,
    fontWeight: "700",
  },

  chevron: {
    color: colors.text.muted,
    fontSize: 23,
  },

  helperText: {
    color: colors.text.muted,
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
    color: colors.text.DEFAULT,
    fontSize: 15,
    fontWeight: "600",
  },

  emptyDescription: {
    color: colors.text.muted,
    fontSize: 13,
    lineHeight: 20,
  },

  primaryButton: {
    backgroundColor: colors.brand[700],
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

  countValue: {
    color: colors.text.DEFAULT,
  },

  errorCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: spacing.md,
    gap: spacing.sm,
  },

  errorText: {
    color: colors.status.error,
    fontSize: 13,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },

  itemMain: {
    flex: 1,
    gap: 3,
  },

  itemTitle: {
    color: colors.text.DEFAULT,
    fontSize: 14,
    fontWeight: "600",
  },

  itemMeta: {
    color: colors.text.muted,
    fontSize: 12,
  },

  itemBadge: {
    alignSelf: "flex-start",
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 2,
  },

  itemAmount: {
    color: colors.text.DEFAULT,
    fontSize: 14,
    fontWeight: "700",
  },

  smallButton: {
    borderWidth: 1,
    borderColor: colors.brand[700],
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },

  smallButtonText: {
    color: colors.brand[700],
    fontSize: 12,
    fontWeight: "600",
  },

  visitRow: {
    gap: 3,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },

  visitDate: {
    color: "#7C3AED",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  footer: {
    color: colors.text.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
