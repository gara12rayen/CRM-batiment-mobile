import type { PermissionConfig, PermissionType } from "../models/permission.types";

/**
 * Textes explicatifs contextualisés pour le CRM Bâtiment.
 * Conçus pour rassurer l'artisan / technicien sur le terrain et expliquer la valeur métier.
 */
export const PERMISSION_DESCRIPTIONS: Record<PermissionType, PermissionConfig> = {
  camera: {
    type: "camera",
    title: "Accès à l'appareil photo",
    shortTitle: "Appareil photo",
    rationale:
      "Le CRM Bâtiment utilise votre appareil photo pour capturer les documents contractuels et documenter vos interventions directement sur le chantier.",
    features: [
      "Numériser les devis signés avec détection de contours",
      "Scanner les codes QR des devis et bons de livraison",
      "Prendre des photos d'avancement de chantier et de réserves",
      "Photographier une pièce pour générer un chiffrage avec le Devis IA",
      "Illustrer les tickets SAV et les réclamations clients",
    ],
    deniedTitle: "Appareil photo inaccessible",
    deniedMessage:
      "Sans accès à l'appareil photo, vous ne pourrez pas numériser de devis, scanner de QR codes ou ajouter de photos de chantiers.",
    settingsGuide: {
      ios: "Réglages > CRM Bâtiment > Activer « Appareil photo »",
      android: "Paramètres > Applications > CRM Bâtiment > Autorisations > Appareil photo > Autoriser",
    },
    iconName: "camera",
  },

  microphone: {
    type: "microphone",
    title: "Accès au microphone",
    shortTitle: "Microphone",
    rationale:
      "Le micro vous permet d'enregistrer rapidement des notes vocales en situation de mobilité (au volant ou avec les mains prises sur le chantier).",
    features: [
      "Dicter la description des travaux pour un Devis IA instantané",
      "Enregistrer un mémo vocal pour un prospect rencontré sur le terrain",
      "Ajouter des commentaires vocaux aux comptes-rendus de chantier",
    ],
    deniedTitle: "Microphone inaccessible",
    deniedMessage:
      "Sans accès au microphone, vous devrez saisir toutes vos descriptions et notes de chantier manuellement au clavier.",
    settingsGuide: {
      ios: "Réglages > CRM Bâtiment > Activer « Microphone »",
      android: "Paramètres > Applications > CRM Bâtiment > Autorisations > Microphone > Autoriser",
    },
    iconName: "microphone",
  },

  location: {
    type: "location",
    title: "Accès à la position GPS",
    shortTitle: "Localisation",
    rationale:
      "La géolocalisation sert à horodater et certifier légalement vos passages sur le terrain ainsi qu'à vous guider rapidement vers vos rendez-vous.",
    features: [
      "Certifier la présence sur le chantier lors de la signature d'un devis ou PV",
      "Lancer le guidage GPS en un clic vers l'adresse d'un client ou chantier",
      "Localiser automatiquement les prospects et chantiers à proximité",
    ],
    deniedTitle: "Position GPS inaccessible",
    deniedMessage:
      "Sans géolocalisation, les preuves de signature ne pourront pas certifier votre présence sur le chantier et les boutons d'itinéraire seront limités.",
    settingsGuide: {
      ios: "Réglages > CRM Bâtiment > Position > Choisir « Lorsque l'app est active »",
      android: "Paramètres > Applications > CRM Bâtiment > Autorisations > Position > Autoriser",
    },
    iconName: "location",
  },

  notifications: {
    type: "notifications",
    title: "Autorisation des notifications",
    shortTitle: "Notifications",
    rationale:
      "Les notifications push vous informent immédiatement des événements urgents qui impactent votre planning et vos chantiers.",
    features: [
      "Être prévenu dès qu'un nouveau chantier vous est assigné",
      "Recevoir une alerte quand un client signe ou valide un devis",
      "Être notifié en cas d'écart de livraison ou de retard de matériel",
      "Rappels sur les tâches prioritaires et les tickets SAV urgents",
    ],
    deniedTitle: "Notifications désactivées",
    deniedMessage:
      "Sans notifications, vous risquez de manquer des attributions urgentes de chantiers, des signatures de devis ou des alertes d'anomalies.",
    settingsGuide: {
      ios: "Réglages > CRM Bâtiment > Notifications > Activer « Autoriser les notifications »",
      android: "Paramètres > Applications > CRM Bâtiment > Notifications > Activer",
    },
    iconName: "bell",
  },
};
