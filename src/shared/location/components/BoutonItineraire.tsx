import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import type {
  ActionButtonSize,
  ActionButtonVariant,
} from "../models/location.types";
import { contactService } from "../services/contactService";

export interface BoutonItineraireProps {
  /** Adresse textuelle de destination (ex: "10 Rue de la Paix, 75002 Paris") */
  address?: string;
  /** Coordonnées géographiques directes */
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  /** Libellé du point de chute affiché dans le GPS (ex: "Chantier Dupont") */
  destinationLabel?: string;
  /** Libellé personnalisé du bouton (par défaut : "Itinéraire") */
  label?: string;
  /** Mode de déplacement ('driving' par défaut) */
  transportMode?: "driving" | "walking" | "transit";
  /** Style visuel */
  variant?: ActionButtonVariant;
  /** Taille du bouton */
  size?: ActionButtonSize;
  /** Callback déclenché avant l'ouverture du GPS */
  onNavigationStarted?: () => void;
  /** Désactivation */
  disabled?: boolean;
  /** Styles additionnels conteneur */
  style?: StyleProp<ViewStyle>;
  /** Styles additionnels texte */
  textStyle?: StyleProp<TextStyle>;
}

export function BoutonItineraire({
  address,
  coordinates,
  destinationLabel,
  label = "Itinéraire",
  transportMode = "driving",
  variant = "primary",
  size = "md",
  onNavigationStarted,
  disabled = false,
  style,
  textStyle,
}: BoutonItineraireProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const hasDestination = Boolean(address || coordinates);

  const handlePress = async () => {
    if (disabled || isLoading || !hasDestination) return;

    setIsLoading(true);
    onNavigationStarted?.();

    try {
      await contactService.openItinerary({
        address,
        coordinates,
        label: destinationLabel,
        transportMode,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    (!hasDestination || disabled) && styles.disabled,
    style,
  ];

  const textColor = getTextColor(variant, !hasDestination || disabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Lancer l'itinéraire vers ${destinationLabel || address || "la destination"}`}
      accessibilityHint="Ouvre l'application de navigation GPS native"
      disabled={disabled || isLoading || !hasDestination}
      onPress={handlePress}
      style={({ pressed }) => [
        buttonStyles,
        pressed && hasDestination && !disabled && styles.pressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
          style={styles.spinner}
        />
      ) : (
        <Text style={[styles.icon, { color: textColor }]}>🧭</Text>
      )}

      {variant !== "iconOnly" && (
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            styles[`label_${size}`],
            { color: textColor },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function getTextColor(variant: ActionButtonVariant, disabled: boolean): string {
  if (disabled) return colors.muted;
  switch (variant) {
    case "primary":
      return "#FFFFFF";
    case "secondary":
      return colors.text;
    case "outline":
    case "ghost":
    case "iconOnly":
      return colors.primary; // Bleu standard CRM Bâtiment
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: "#E5E7EB",
    borderColor: "#D1D5DB",
  },
  // Variantes
  primary: {
    backgroundColor: colors.primary, // Bleu de guidage
  },
  secondary: {
    backgroundColor: "#EFF6FF",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  iconOnly: {
    backgroundColor: "#EFF6FF",
    aspectRatio: 1,
    paddingHorizontal: 0,
    borderRadius: 999,
  },
  // Tailles
  size_sm: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    minHeight: 34,
  },
  size_md: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  size_lg: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    minHeight: 52,
  },
  // Textes
  label: {
    fontWeight: "700",
  },
  label_sm: {
    fontSize: 13,
  },
  label_md: {
    fontSize: 15,
  },
  label_lg: {
    fontSize: 17,
  },
  icon: {
    fontSize: 16,
  },
  spinner: {
    marginRight: 4,
  },
});
