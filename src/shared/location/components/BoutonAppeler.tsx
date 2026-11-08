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

export interface BoutonAppelerProps {
  /** Numéro de téléphone à appeler (obligatoire) */
  phoneNumber: string;
  /** Nom du contact ou du client */
  contactName?: string;
  /** Libellé personnalisé du bouton (par défaut : "Appeler") */
  label?: string;
  /** Style visuel */
  variant?: ActionButtonVariant;
  /** Taille du bouton */
  size?: ActionButtonSize;
  /** Demander confirmation avant l'appel (par défaut: true) */
  promptConfirmation?: boolean;
  /** Callback optionnel déclenché au clic */
  onCallStarted?: () => void;
  /** Désactivation */
  disabled?: boolean;
  /** Styles additionnels pour le conteneur */
  style?: StyleProp<ViewStyle>;
  /** Styles additionnels pour le texte */
  textStyle?: StyleProp<TextStyle>;
}

export function BoutonAppeler({
  phoneNumber,
  contactName,
  label,
  variant = "primary",
  size = "md",
  promptConfirmation = true,
  onCallStarted,
  disabled = false,
  style,
  textStyle,
}: BoutonAppelerProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handlePress = async () => {
    if (disabled || isLoading || !phoneNumber) return;

    setIsLoading(true);
    onCallStarted?.();

    try {
      await contactService.callNumber({
        phoneNumber,
        contactName,
        promptConfirmation,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const textColor = getTextColor(variant, disabled);
  const displayLabel = label ?? (contactName ? `Appeler ${contactName}` : "Appeler");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Appeler ${contactName || phoneNumber}`}
      accessibilityHint="Ouvre le composeur téléphonique"
      disabled={disabled || isLoading}
      onPress={handlePress}
      style={({ pressed }) => [
        buttonStyles,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
          style={styles.spinner}
        />
      ) : (
        <Text style={[styles.icon, { color: textColor }]}>📞</Text>
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
          {displayLabel}
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
      return "#059669"; // Vert téléphone professionnel
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
    backgroundColor: "#059669", // Vert téléphone / appel
  },
  secondary: {
    backgroundColor: "#E6F4EA",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#059669",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  iconOnly: {
    backgroundColor: "#E6F4EA",
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
