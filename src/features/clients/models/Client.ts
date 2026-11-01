
export type Client = {
  id: number;
  nom: string;
  prenom?: string | null;
  typeClient: "PARTICULIER" | "PROFESSIONNEL";
  statut: "PROSPECT" | "QUALIFIE" | "CLIENT";
  telephone?: string | null;
  email?: string | null;
  siret?: string | null;
  adresseClient?: string | null;
};
