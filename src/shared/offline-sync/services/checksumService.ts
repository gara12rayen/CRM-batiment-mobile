/**
 * Service de calcul d'empreinte (checksum) et d'identifiants uniques.
 * Assure la protection contre les envois en double dans la file différée.
 */

class ChecksumService {
  /**
   * Génère un identifiant unique (UUID v4 simplifié) pour un envoi.
   */
  generateUniqueId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    const extra = Math.random().toString(36).substring(2, 6);
    return `up_${timestamp}_${randomPart}_${extra}`;
  }

  /**
   * Calcule un checksum déterministe (empreinte numérique) pour un fichier et son contexte.
   * Utilise l'algorithme FNV-1a 64-bit sur les attributs invariants :
   *   - Nom du fichier
   *   - Taille en octets
   *   - Endpoint cible
   *   - Payload métier (ex: devisId, chantierId)
   */
  computeChecksum(params: {
    fileName: string;
    fileSize: number;
    endpoint: string;
    payload?: Record<string, unknown>;
  }): string {
    const payloadStr = params.payload ? JSON.stringify(params.payload) : "";
    const rawSignature = `${params.fileName}::${params.fileSize}::${params.endpoint}::${payloadStr}`;

    return this.fnv1a64(rawSignature);
  }

  /**
   * Algorithme de hachage FNV-1a non cryptographique rapide et sans dépendance externe.
   * Produit une empreinte hexadécimale de 16 caractères.
   */
  private fnv1a64(str: string): string {
    let h1 = 0x811c9dc5;
    let h2 = 0xcbf29ce4;

    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      h1 ^= code;
      h1 = Math.imul(h1, 0x01000193);

      h2 ^= code;
      h2 = Math.imul(h2, 0x01000193);
    }

    const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
    const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
    return `${hex1}${hex2}`;
  }
}

export const checksumService = new ChecksumService();
