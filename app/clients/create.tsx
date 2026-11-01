
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import {
  createClient,
  getClientById,
  getClients,
  updateClient,
  type ClientPayload,
} from "@/features/clients/services/clients.service";

type ClientType = "PARTICULIER" | "PROFESSIONNEL";

type Duplicate = {
  id: number;
  nom: string;
  telephone?: string | null;
  email?: string | null;
};

export default function CreateClientRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const clientId = Number(rawId);
  const isEditMode =
    Boolean(rawId) && Number.isInteger(clientId) && clientId > 0;

  const [typeClient, setTypeClient] =
    useState<ClientType>("PARTICULIER");

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [siret, setSiret] = useState("");
  const [tvaIntracom, setTvaIntracom] = useState("");
  const [contactNom, setContactNom] = useState("");
  const [contactFonction, setContactFonction] = useState("");
  const [adresseClient, setAdresseClient] = useState("");
  const [adresseChantier, setAdresseChantier] = useState("");
  const [besoin, setBesoin] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  // Charger les informations du client en mode modification.
  useEffect(() => {
    if (!isEditMode) return;

    let active = true;

    const loadClient = async () => {
      try {
        const client = await getClientById(clientId);

        if (!active) return;

        setTypeClient(client.typeClient);
        setNom(client.nom ?? "");
        setPrenom(client.prenom ?? "");
        setTelephone(client.telephone ?? "");
        setEmail(client.email ?? "");
        setSiret(client.siret ?? "");
        setTvaIntracom(client.tvaIntracom ?? "");
        setContactNom(client.contactNom ?? "");
        setContactFonction(client.contactFonction ?? "");
        setAdresseClient(client.adresseClient ?? "");
        setAdresseChantier(client.adresseChantier ?? "");
        setBesoin(client.besoin ?? "");
        setNotes(client.notes ?? "");
      } catch (error) {
        if (!active) return;

        Alert.alert(
          "Erreur",
          error instanceof Error
            ? error.message
            : "Impossible de charger le client.",
          [
            {
              text: "Retour",
              onPress: () => router.back(),
            },
          ],
        );
      } finally {
        if (active) {
          setInitialLoading(false);
        }
      }
    };

    void loadClient();

    return () => {
      active = false;
    };
  }, [clientId, isEditMode, router]);

  const normalizePhone = (value: string) =>
    value.replace(/\D/g, "");

  // Recherche des doublons par téléphone et adresse e-mail.
  const findDuplicates = async (): Promise<Duplicate[]> => {
    const values = [
      telephone.trim(),
      email.trim(),
    ].filter(Boolean);

    if (values.length === 0) return [];

    const responses = await Promise.all(
      values.map((value) =>
        getClients({ page: 1, limit: 50, search: value }),
      ),
    );

    const clients = responses.flatMap((response) => response.data);
    const unique = new Map<number, Duplicate>();

    for (const client of clients) {
      const samePhone =
        Boolean(telephone.trim()) &&
        Boolean(client.telephone) &&
        normalizePhone(client.telephone!) === normalizePhone(telephone);

      const sameEmail =
        Boolean(email.trim()) &&
        Boolean(client.email) &&
        client.email!.trim().toLowerCase() ===
          email.trim().toLowerCase();

      if (samePhone || sameEmail) {
        unique.set(client.id, {
          id: client.id,
          nom: [client.prenom, client.nom]
            .filter(Boolean)
            .join(" "),
          telephone: client.telephone,
          email: client.email,
        });
      }
    }

    return Array.from(unique.values());
  };

  const submitClient = async () => {
    if (!nom.trim()) {
      Alert.alert(
        "Champ obligatoire",
        "Veuillez saisir le nom du client.",
      );
      return;
    }

    if (
      email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      Alert.alert(
        "E-mail invalide",
        "Veuillez vérifier l'adresse e-mail.",
      );
      return;
    }

    if (
      telephone.trim() &&
      normalizePhone(telephone).length < 6
    ) {
      Alert.alert(
        "Téléphone invalide",
        "Veuillez vérifier le numéro.",
      );
      return;
    }

    // En modification, on ne recherche pas le client lui-même
    // comme doublon.
    if (isEditMode) {
      await saveClient();
      return;
    }

    setLoading(true);

    try {
      const duplicates = await findDuplicates();

      if (duplicates.length > 0) {
        setLoading(false);

        const duplicate = duplicates[0];

        Alert.alert(
          "Client potentiellement existant",
          duplicates
            .map(
              (item) =>
                `${item.nom}\n${item.telephone || ""}\n${item.email || ""}`,
            )
            .join("\n\n"),
          [
            {
              text: "Voir la fiche",
              onPress: () =>
                router.push(`/clients/${duplicate.id}`),
            },
            {
              text: "Créer quand même",
              onPress: () => {
                void saveClient();
              },
            },
            {
              text: "Annuler",
              style: "cancel",
            },
          ],
        );

        return;
      }

      await saveClient();
    } catch (error) {
      setLoading(false);

      Alert.alert(
        "Erreur",
        error instanceof Error
          ? error.message
          : "Impossible de vérifier les doublons.",
      );
    }
  };

  // Création ou modification selon le mode du formulaire.
  const saveClient = async () => {
    setLoading(true);

    const payload: ClientPayload = {
      nom: nom.trim(),
      typeClient,
      telephone: telephone.trim() || null,
      email: email.trim() || null,
      adresseClient: adresseClient.trim() || null,
      adresseChantier: adresseChantier.trim() || null,
      besoin: besoin.trim() || null,
      notes: notes.trim() || null,
      ...(typeClient === "PARTICULIER"
        ? {
            prenom: prenom.trim() || null,
          }
        : {
            siret: siret.trim() || null,
            tvaIntracom: tvaIntracom.trim() || null,
            contactNom: contactNom.trim() || null,
            contactFonction: contactFonction.trim() || null,
          }),
    };

    try {
      if (isEditMode) {
        await updateClient(clientId, payload);

        Alert.alert(
          "Client modifié",
          "Les informations du client ont été mises à jour.",
          [
            {
              text: "Voir la fiche",
              onPress: () =>
                router.replace(`/clients/${clientId}`),
            },
          ],
        );
      } else {
        const created = await createClient(payload);

        Alert.alert(
          "Client créé",
          "Le client a été ajouté avec succès.",
          [
            {
              text: "Voir la fiche",
              onPress: () => {
                if (created?.id) {
                  router.replace(`/clients/${created.id}`);
                } else {
                  router.replace("/clients");
                }
              },
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert(
        "Erreur",
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Impossible de modifier le client."
            : "Impossible de créer le client.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderField = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    placeholder: string,
    options: {
      multiline?: boolean;
      keyboardType?: "default" | "email-address" | "phone-pad";
      required?: boolean;
    } = {},
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {options.required ? " *" : ""}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        style={[
          styles.input,
          options.multiline && styles.multilineInput,
        ]}
        multiline={options.multiline}
        keyboardType={options.keyboardType || "default"}
        autoCapitalize={
          options.keyboardType === "email-address"
            ? "none"
            : "sentences"
        }
        textAlignVertical={options.multiline ? "top" : "center"}
      />
    </View>
  );

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
        <Text style={styles.loadingText}>
          Chargement des informations du client...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {isEditMode ? "Modifier le client" : "Nouveau client"}
        </Text>

        <Text style={styles.subtitle}>
          {isEditMode
            ? "Modifiez les informations du client."
            : "Renseignez les informations du nouveau client."}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de client</Text>

          <View style={styles.typeRow}>
            <Pressable
              style={[
                styles.typeButton,
                typeClient === "PARTICULIER" &&
                  styles.typeButtonSelected,
              ]}
              onPress={() => setTypeClient("PARTICULIER")}
              disabled={loading}
            >
              <Text
                style={[
                  styles.typeText,
                  typeClient === "PARTICULIER" &&
                    styles.typeTextSelected,
                ]}
              >
                Particulier
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.typeButton,
                typeClient === "PROFESSIONNEL" &&
                  styles.typeButtonSelected,
              ]}
              onPress={() => setTypeClient("PROFESSIONNEL")}
              disabled={loading}
            >
              <Text
                style={[
                  styles.typeText,
                  typeClient === "PROFESSIONNEL" &&
                    styles.typeTextSelected,
                ]}
              >
                Professionnel
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations générales</Text>

          {renderField("Nom", nom, setNom, "Nom du client", {
            required: true,
          })}

          {typeClient === "PARTICULIER" &&
            renderField(
              "Prénom",
              prenom,
              setPrenom,
              "Prénom du client",
            )}

          {typeClient === "PROFESSIONNEL" && (
            <>
              {renderField("SIRET", siret, setSiret, "Numéro SIRET")}

              {renderField(
                "TVA intracommunautaire",
                tvaIntracom,
                setTvaIntracom,
                "Numéro TVA",
              )}

              {renderField(
                "Nom du contact",
                contactNom,
                setContactNom,
                "Nom de la personne à contacter",
              )}

              {renderField(
                "Fonction du contact",
                contactFonction,
                setContactFonction,
                "Ex. : Responsable",
              )}
            </>
          )}

          {renderField(
            "Téléphone",
            telephone,
            setTelephone,
            "Numéro de téléphone",
            { keyboardType: "phone-pad" },
          )}

          {renderField(
            "E-mail",
            email,
            setEmail,
            "adresse@exemple.com",
            { keyboardType: "email-address" },
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresses</Text>

          {renderField(
            "Adresse du client",
            adresseClient,
            setAdresseClient,
            "Adresse complète",
          )}

          {renderField(
            "Adresse du chantier",
            adresseChantier,
            setAdresseChantier,
            "Adresse du chantier",
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Informations complémentaires
          </Text>

          {renderField(
            "Besoin / Projet",
            besoin,
            setBesoin,
            "Décrivez le besoin du client",
            { multiline: true },
          )}

          {renderField(
            "Notes",
            notes,
            setNotes,
            "Informations supplémentaires",
            { multiline: true },
          )}
        </View>

        <Pressable
          style={[
            styles.submitButton,
            loading && styles.disabledButton,
          ]}
          onPress={submitClient}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitText}>
              {isEditMode
                ? "Enregistrer les modifications"
                : "Ajouter le client"}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.DEFAULT,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  loadingText: {
    color: colors.text.muted,
    marginTop: spacing.md,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing["3xl"],
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
    marginBottom: spacing.xl,
  },
  section: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.DEFAULT,
    marginBottom: spacing.md,
  },
  typeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: 10,
    padding: spacing.md,
    alignItems: "center",
    backgroundColor: colors.surface.muted,
  },
  typeButtonSelected: {
    backgroundColor: colors.brand[100],
    borderColor: colors.brand[700],
  },
  typeText: {
    color: colors.text.muted,
    fontWeight: "600",
  },
  typeTextSelected: {
    color: colors.brand[900],
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.DEFAULT,
    marginBottom: spacing.xs,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: 9,
    paddingHorizontal: spacing.md,
    color: colors.text.DEFAULT,
    backgroundColor: colors.surface.DEFAULT,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 90,
    paddingTop: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.brand[700],
    borderRadius: 10,
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
  cancelButton: {
    alignItems: "center",
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  cancelText: {
    color: colors.text.muted,
    fontWeight: "600",
  },
});
