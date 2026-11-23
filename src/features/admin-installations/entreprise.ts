export type TypeEntreprise = "REGIE" | "SOUS_TRAITANT" | "LES_DEUX";

// Mock: mn b3d had valeur kat-ji mn l'API (profil de l'entreprise)
export const TYPE_ENTREPRISE_MOCK: TypeEntreprise = "REGIE";

export const installationsVisibles = (t: TypeEntreprise = TYPE_ENTREPRISE_MOCK) =>
  t === "REGIE" || t === "LES_DEUX";