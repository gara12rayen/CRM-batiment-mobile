
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getClientById } from "@/features/clients/services/clients.service";
import type { ClientDetails } from "@/features/clients/models/ClientDetails";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

function getClientName(client: ClientDetails): string {
  if (client.typeClient === "PARTICULIER") {
    return [client.prenom, client.nom].filter(Boolean).join(" ");
  }

  return client.nom;
}

function formatDate(date?: string | null): string {
  if (!date) return "Date non disponible";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date non disponible";
  }

  return parsedDate.toLocaleDateString("fr-FR");
}

function formatAmount(amount?: number | null): string {
  if (amount === null || amount === undefined) {
    return "Non renseigné";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function getStatusColor(status: string) {
  switch (status) {
    case "CLIENT":
    case "SIGNE":
    case "SIGNÉ":
    case "TERMINE":
    case "TERMINEE":
      return { backgroundColor: "#DCFCE7", color: "#15803D" };

    case "QUALIFIE":
    case "EN_COURS":
    case "ENVOYE":
    case "ENVOYÉ":
      return { backgroundColor: "#DBEAFE", color: "#1D4ED8" };

    case "REFUSE":
    case "REFUSÉ":
      return { backgroundColor: "#FEE2E2", color: "#B91C1C" };

    default:
      return { backgroundColor: "#FEF3C7", color: "#B45309" };
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PROSPECT: "Prospect",
    QUALIFIE: "Qualifié",
    CLIENT: "Client",
    BROUILLON: "Brouillon",
    ENVOYE: "Envoyé",
    ENVOYÉ: "Envoyé",
    SIGNE: "Signé",
    SIGNÉ: "Signé",
    REFUSE: "Refusé",
    REFUSÉ: "Refusé",
    EN_COURS: "En cours",
    TERMINE: "Terminé",
    TERMINEE: "Terminée",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

export default function ClientDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const canReadClients = user !== null && permissions.canReadClients(user.role);
  const canManageClients = user !== null && permissions.canAccessCommercial(user.role);

  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClient = useCallback(async () => {
    const clientId = Number(id);

    if (!canReadClients) {
      setError("Vous n'avez pas accès à cette fiche client.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!id || !Number.isInteger(clientId) || clientId <= 0) {
      setError("Identifiant du client invalide.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);

      const response = await getClientById(clientId);
      setClient(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger la fiche client.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, canReadClients]);

  useEffect(() => {
  const timer = setTimeout(() => {
    void loadClient();
  }, 0);

  return () => clearTimeout(timer);
  }, [loadClient]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadClient();
  };

  const handleCall = async () => {
    if (!client?.telephone) return;

    try {
      await Linking.openURL(`tel:${client.telephone}`);
    } catch {
      setError("Impossible d'ouvrir l'application téléphone.");
    }
  };

  const handleDirections = async () => {
    const address = client?.adresseClient || client?.adresseChantier;

    if (!address) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    try {
      await Linking.openURL(url);
    } catch {
      setError("Impossible d'ouvrir l'application de navigation.");
    }
  };

  const canCreateQuote = user !== null && permissions.canManageQuotes(user.role);

  // New draft quote for this client, saved in the database through the API
  const handleCreateQuote = () => {
    if (!client || !canCreateQuote) return;

    router.push({
      pathname: "/devis/create",
      params: { clientId: String(client.id) },
    });
  };

  const handleEdit = () => {
    if (!client || !canManageClients) return;

    router.push({
      pathname: "/clients/create",
      params: { id: String(client.id) },
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
        <Text style={styles.loadingText}>
          Chargement de la fiche client...
        </Text>
      </View>
    );
  }

  if (!canReadClients) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Vous n'avez pas accès à cette fiche client."
      />
    );
  }

  if (error && !client) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>

        <Pressable style={styles.primaryButton} onPress={loadClient}>
          <Text style={styles.primaryButtonText}>Réessayer</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Retour aux clients</Text>
        </Pressable>
      </View>
    );
  }

  if (!client) return null;

  const clientName = getClientName(client);
  const address = client.adresseClient || client.adresseChantier;
  const statusStyle = getStatusColor(client.statut);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Retour aux clients</Text>
      </Pressable>

      {error ? <Text style={styles.warningText}>{error}</Text> : null}

      {/* En-tête du client */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(clientName.charAt(0) || "C").toUpperCase()}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.clientName}>{clientName}</Text>

            <Text style={styles.clientType}>
              {client.typeClient === "PROFESSIONNEL"
                ? "Professionnel"
                : "Particulier"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusStyle.backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {getStatusLabel(client.statut)}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Pressable
            style={[
              styles.actionButton,
              !client.telephone && styles.disabledButton,
            ]}
            disabled={!client.telephone}
            onPress={handleCall}
          >
            <Text style={styles.actionButtonText}>☎ Appeler</Text>
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              styles.mapButton,
              !address && styles.disabledButton,
            ]}
            disabled={!address}
            onPress={handleDirections}
          >
            <Text style={styles.actionButtonText}>⌖ Itinéraire</Text>
          </Pressable>

          {canManageClients && (
            <Pressable
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEdit}
            >
              <Text style={styles.actionButtonText}>✎ Modifier</Text>
            </Pressable>
          )}

          {canCreateQuote && (
            <Pressable
              style={[styles.actionButton, styles.editButton]}
              onPress={handleCreateQuote}
            >
              <Text style={styles.actionButtonText}>＋ Devis</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Coordonnées */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coordonnées</Text>

        <InfoRow label="Nom" value={client.nom} />
        <InfoRow label="Prénom" value={client.prenom} />
        <InfoRow label="Téléphone" value={client.telephone} />
        <InfoRow label="E-mail" value={client.email} />
        <InfoRow label="Adresse" value={client.adresseClient} />

        {client.siret ? (
          <InfoRow label="SIRET" value={client.siret} />
        ) : null}

        {client.tvaIntracom ? (
          <InfoRow label="TVA" value={client.tvaIntracom} />
        ) : null}

        {client.contactNom ? (
          <InfoRow label="Contact" value={client.contactNom} />
        ) : null}

        {client.contactFonction ? (
          <InfoRow label="Fonction" value={client.contactFonction} />
        ) : null}
      </View>

      {/* Informations complémentaires */}
      {(client.source || client.besoin || client.notes) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Informations complémentaires
          </Text>

          <InfoRow label="Source" value={client.source} />
          <InfoRow label="Besoin" value={client.besoin} />
          <InfoRow label="Notes" value={client.notes} />
        </View>
      )}

      {/* Résumé */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Résumé de l'activité</Text>

        <View style={styles.statisticsRow}>
          <Statistic
            label="Devis"
            value={client._count?.devis ?? client.devis?.length ?? 0}
          />

          <Statistic
            label="Chantiers"
            value={client._count?.chantiers ?? client.chantiers?.length ?? 0}
          />

          <Statistic
            label="Demandes"
            value={
              client._count?.demandesDevis ??
              client.demandesDevis?.length ??
              0
            }
          />
        </View>
      </View>

      {/* Historique des devis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historique des devis</Text>

        {client.devis && client.devis.length > 0 ? (
          client.devis.map((devis) => {
            const devisStatus = getStatusColor(devis.statut);

            return (
              <Pressable
                key={devis.id}
                style={styles.historyCard}
                onPress={() => router.push(`/devis/${devis.id}`)}
              >
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>
                    {devis.reference || `Devis #${devis.id}`}
                  </Text>

                  <Text
                    style={[
                      styles.historyStatus,
                      { color: devisStatus.color },
                    ]}
                  >
                    {getStatusLabel(devis.statut)}
                  </Text>
                </View>

                {user && permissions.canViewAmounts(user.role) && (
                  <Text style={styles.historyDetail}>
                    Montant : {formatAmount(devis.totalTTC)}
                  </Text>
                )}

                <Text style={styles.historyDate}>
                  Créé le {formatDate(devis.createdAt)}
                </Text>
              </Pressable>
            );
          })
        ) : (
          <Text style={styles.emptyText}>
            Aucun devis associé à ce client.
          </Text>
        )}
      </View>

      {/* Chantiers associés */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chantiers associés</Text>

        {client.chantiers && client.chantiers.length > 0 ? (
          client.chantiers.map((chantier) => {
            const chantierStatus = getStatusColor(chantier.statut);

            return (
              <View key={chantier.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>
                    {chantier.reference || `Chantier #${chantier.id}`}
                  </Text>

                  <Text
                    style={[
                      styles.historyStatus,
                      { color: chantierStatus.color },
                    ]}
                  >
                    {getStatusLabel(chantier.statut)}
                  </Text>
                </View>

                <Text style={styles.historyDetail}>
                  Adresse : {chantier.adresse || "Non renseignée"}
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>
            Aucun chantier associé à ce client.
          </Text>
        )}
      </View>

      {/* Demandes de devis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demandes de devis</Text>

        {client.demandesDevis && client.demandesDevis.length > 0 ? (
          client.demandesDevis.map((demande) => (
            <View key={demande.id} style={styles.historyCard}>
              <Text style={styles.historyTitle}>
                {demande.reference || `Demande #${demande.id}`}
              </Text>

              <Text style={styles.historyDetail}>
                Statut : {getStatusLabel(demande.statut)}
              </Text>

              <Text style={styles.historyDate}>
                Créée le {formatDate(demande.createdAt)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            Aucune demande de devis.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Statistic({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={styles.statisticCard}>
      <Text style={styles.statisticValue}>{value}</Text>
      <Text style={styles.statisticLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.DEFAULT,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.DEFAULT,
    padding: spacing.xl,
    gap: spacing.md,
  },
  loadingText: {
    color: colors.text.muted,
    fontSize: 14,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 14,
    textAlign: "center",
  },
  warningText: {
    color: colors.status.error,
    marginBottom: spacing.md,
  },
  backButton: {
    marginBottom: spacing.md,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: colors.brand[700],
    fontSize: 14,
    fontWeight: "600",
  },
  backText: {
    color: colors.brand[700],
    fontWeight: "600",
  },
  profileCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.brand[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 23,
    fontWeight: "700",
    color: colors.brand[900],
  },
  profileInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.DEFAULT,
  },
  clientType: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: spacing.md,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    minWidth: 90,
    backgroundColor: colors.brand[700],
    padding: spacing.md,
    borderRadius: 10,
    alignItems: "center",
  },
  mapButton: {
    backgroundColor: colors.brand[900],
  },
  editButton: {
    backgroundColor: "#0F766E",
  },
  disabledButton: {
    opacity: 0.4,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  section: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.DEFAULT,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.DEFAULT,
  },
  infoLabel: {
    width: 105,
    fontSize: 13,
    color: colors.text.muted,
    fontWeight: "500",
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: colors.text.DEFAULT,
  },
  statisticsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statisticCard: {
    flex: 1,
    backgroundColor: colors.surface.muted,
    borderRadius: 10,
    padding: spacing.md,
    alignItems: "center",
  },
  statisticValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.brand[700],
  },
  statisticLabel: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: colors.surface.muted,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  historyTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.DEFAULT,
  },
  historyStatus: {
    fontSize: 11,
    fontWeight: "700",
  },
  historyDetail: {
    fontSize: 13,
    color: colors.text.DEFAULT,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: colors.text.muted,
  },
  emptyText: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.brand[700],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: "700",
  },
});
