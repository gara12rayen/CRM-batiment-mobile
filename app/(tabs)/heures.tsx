import { AccessPlaceholderScreen } from "@/features/access/AccessPlaceholderScreen";

export default function HeuresTabRoute() {
  return (
    <AccessPlaceholderScreen
      permission="heures"
      title="Heures"
      description="La saisie des heures sera intégrée dans une prochaine étape. Aucun prix n’est affiché."
    />
  );
}
