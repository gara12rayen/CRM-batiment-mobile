export type Client = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  type: "PARTICULIER" | "ENTREPRISE";
};

export type ClientForm = Omit<Client, "id">;

export const CLIENT_VIDE: ClientForm = {
  nom: "",
  email: "",
  telephone: "",
  adresse: "",
  type: "PARTICULIER",
};

export function validerClient(f: ClientForm): string | null {
  if (!f.nom.trim()) return "Le nom est obligatoire.";
  if (!/^\S+@\S+\.\S+$/.test(f.email)) return "Email invalide.";
  if (f.telephone.replace(/\D/g, "").length < 8) return "Téléphone invalide.";
  return null;
}
