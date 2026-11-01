import type { Client } from "./Client";

export type ClientQuote = {
  id: number;
  reference?: string | null;
  statut: string;
  totalTTC?: number | null;
  createdAt?: string | null;
};

export type ClientJobSite = {
  id: number;
  reference?: string | null;
  statut: string;
  adresse?: string | null;
};

export type ClientRequest = {
  id: number;
  reference?: string | null;
  statut: string;
  createdAt?: string | null;
};

export type ClientDetails = Client & {
  contactNom?: string | null;
  contactFonction?: string | null;
  tvaIntracom?: string | null;
  adresseChantier?: string | null;
  source?: string | null;
  besoin?: string | null;
  notes?: string | null;

  devis?: ClientQuote[];
  chantiers?: ClientJobSite[];
  demandesDevis?: ClientRequest[];

  _count?: {
    devis?: number;
    chantiers?: number;
    demandesDevis?: number;
    savTickets?: number;
  };
};