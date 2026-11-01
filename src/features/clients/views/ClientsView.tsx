
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import type { Client } from "../models/Client";
import { getClients } from "../services/clients.service";
import { Input } from "@/shared/components/Input";
import { Loading } from "@/shared/components/Loading";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

const PAGE_SIZE = 20;

type TypeFilter = "TOUS" | "PARTICULIER" | "PROFESSIONNEL";
type StatusFilter = "TOUS" | "PROSPECT" | "QUALIFIE" | "CLIENT";

function getClientName(client: Client): string {
  if (client.typeClient === "PARTICULIER") {
    return [client.prenom, client.nom].filter(Boolean).join(" ");
  }
  return client.nom;
}

function getStatusLabel(status: Client["statut"]): string {
  switch (status) {
    case "CLIENT":
      return "Client";
    case "QUALIFIE":
      return "Qualifié";
    default:
      return "Prospect";
  }
}

export function ClientsView() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("TOUS");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TOUS");
  const [sortDescending, setSortDescending] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadClients = useCallback(
    async (pageNumber: number, searchValue: string, append = false) => {
      try {
        setError(null);

        const response = await getClients({
          page: pageNumber,
          limit: PAGE_SIZE,
          search: searchValue,
        });

        setClients((previous) =>
          append ? [...previous, ...response.data] : response.data,
        );

        setPage(response.meta.page);
        setTotalPages(response.meta.totalPages);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les clients.",
        );
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const response = await getClients({
          page: 1,
          limit: PAGE_SIZE,
          search,
        });

        if (!active) return;

        setClients(response.data);
        setPage(response.meta.page);
        setTotalPages(response.meta.totalPages);
        setError(null);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les clients.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadClients(1, search);
    } finally {
      setRefreshing(false);
    }
  }, [loadClients, search]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || loading || page >= totalPages) return;

    setLoadingMore(true);
    try {
      await loadClients(page + 1, search, true);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, page, totalPages, loadClients, search]);

  const filteredClients = useMemo(() => {
    let result = [...clients];

    if (typeFilter !== "TOUS") {
      result = result.filter((client) => client.typeClient === typeFilter);
    }

    if (statusFilter !== "TOUS") {
      result = result.filter((client) => client.statut === statusFilter);
    }

    result.sort((a, b) => {
      const nameA = getClientName(a).toLocaleLowerCase();
      const nameB = getClientName(b).toLocaleLowerCase();

      return sortDescending
        ? nameB.localeCompare(nameA)
        : nameA.localeCompare(nameB);
    });

    return result;
  }, [clients, typeFilter, statusFilter, sortDescending]);

  const openClient = (id: number) => {
    router.push({
      pathname: "/clients/[id]",
      params: { id: String(id) },
    });
  };

  const openCreateForm = () => {
    router.push("/clients/create");
  };

  const renderFilter = (
    label: string,
    selected: boolean,
    onPress: () => void,
  ) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={[styles.filterChip, selected && styles.filterChipSelected]}
    >
      <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );

  const renderClient = ({ item }: { item: Client }) => {
    const isProfessional = item.typeClient === "PROFESSIONNEL";

    const statusStyle =
      item.statut === "CLIENT"
        ? styles.statusClient
        : item.statut === "QUALIFIE"
          ? styles.statusQualified
          : styles.statusProspect;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.clientCard,
          pressed && styles.clientCardPressed,
        ]}
        onPress={() => openClient(item.id)}
      >
        <View style={styles.clientHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(getClientName(item).charAt(0) || "C").toUpperCase()}
            </Text>
          </View>

          <View style={styles.clientInfo}>
            <Text style={styles.clientName} numberOfLines={2}>
              {getClientName(item)}
            </Text>

            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {isProfessional ? "Professionnel" : "Particulier"}
              </Text>
            </View>
          </View>

          <View style={[styles.statusBadge, statusStyle]}>
            <Text style={styles.statusBadgeText}>
              {getStatusLabel(item.statut)}
            </Text>
          </View>
        </View>

        <View style={styles.contactSection}>
          {item.telephone ? (
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>Téléphone</Text>
              <Text style={styles.contactValue}>{item.telephone}</Text>
            </View>
          ) : null}

          {item.email ? (
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>E-mail</Text>
              <Text style={styles.contactValue} numberOfLines={1}>
                {item.email}
              </Text>
            </View>
          ) : null}

          {item.adresseClient ? (
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>Adresse</Text>
              <Text style={styles.contactValue} numberOfLines={2}>
                {item.adresseClient}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.detailsLink}>Voir la fiche client</Text>
          <Text style={styles.arrow}>→</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mes clients</Text>
          <Text style={styles.subtitle}>Consultez et gérez vos clients</Text>
        </View>

        <Pressable style={styles.addButton} onPress={openCreateForm}>
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </Pressable>
      </View>

      <Input
        value={search}
        onChangeText={setSearch}
        placeholder="Nom, téléphone, email..."
        autoCapitalize="none"
        style={styles.searchInput}
      />

      {/* Zone des filtres */}
      <View style={styles.filtersSection}>
        <Text style={styles.filterTitle}>Type de client</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {renderFilter("Tous", typeFilter === "TOUS", () =>
            setTypeFilter("TOUS"),
          )}
          {renderFilter("Particuliers", typeFilter === "PARTICULIER", () =>
            setTypeFilter("PARTICULIER"),
          )}
          {renderFilter("Professionnels", typeFilter === "PROFESSIONNEL", () =>
            setTypeFilter("PROFESSIONNEL"),
          )}
        </ScrollView>

        <Text style={styles.filterTitle}>Statut</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {renderFilter("Tous", statusFilter === "TOUS", () =>
            setStatusFilter("TOUS"),
          )}
          {renderFilter("Prospects", statusFilter === "PROSPECT", () =>
            setStatusFilter("PROSPECT"),
          )}
          {renderFilter("Qualifiés", statusFilter === "QUALIFIE", () =>
            setStatusFilter("QUALIFIE"),
          )}
          {renderFilter("Clients", statusFilter === "CLIENT", () =>
            setStatusFilter("CLIENT"),
          )}
        </ScrollView>
      </View>

      {/* Résultats et tri */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {filteredClients.length} client(s) affiché(s)
        </Text>

        <Pressable
          style={styles.sortButton}
          onPress={() => setSortDescending((previous) => !previous)}
        >
          <Text style={styles.sortText}>
            {sortDescending ? "Z → A" : "A → Z"}
          </Text>
        </Pressable>
      </View>

      {error ? <ErrorMessage message={error} /> : null}

      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderClient}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun client trouvé.</Text>
          }
          ListFooterComponent={loadingMore ? <Loading /> : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.DEFAULT,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    color: colors.text.DEFAULT,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  addButton: {
    backgroundColor: colors.brand[700],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginLeft: spacing.sm,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 13,
  },
  searchInput: {
    marginBottom: spacing.md,
  },
  filtersSection: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    marginBottom: spacing.md,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.DEFAULT,
    marginBottom: spacing.sm,
  },
  filtersContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.surface.muted,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
  },
  filterChipSelected: {
    backgroundColor: colors.brand[100],
    borderColor: colors.brand[700],
  },
  filterText: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: "500",
  },
  filterTextSelected: {
    color: colors.brand[900],
    fontWeight: "700",
  },
  resultsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  resultsText: {
    fontSize: 13,
    color: colors.text.muted,
    fontWeight: "600",
  },
  sortButton: {
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
  },
  sortText: {
    fontSize: 13,
    color: colors.brand[700],
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  clientCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  clientCardPressed: {
    opacity: 0.8,
  },
  clientHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.brand[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.brand[900],
    fontSize: 18,
    fontWeight: "700",
  },
  clientInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: spacing.sm,
  },
  clientName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.DEFAULT,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface.muted,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 5,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.muted,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "center",
  },
  statusClient: {
    backgroundColor: "#DCFCE7",
  },
  statusQualified: {
    backgroundColor: "#DBEAFE",
  },
  statusProspect: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.DEFAULT,
  },
  contactSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border.DEFAULT,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  contactLabel: {
    width: 75,
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: "500",
  },
  contactValue: {
    flex: 1,
    fontSize: 12,
    color: colors.text.DEFAULT,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: spacing.md,
  },
  detailsLink: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand[700],
  },
  arrow: {
    fontSize: 16,
    color: colors.brand[700],
    marginLeft: 5,
  },
  emptyText: {
    textAlign: "center",
    color: colors.text.muted,
    marginTop: spacing.xl,
  },
});
