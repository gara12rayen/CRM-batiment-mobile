import { AccessPlaceholderScreen } from "@/features/access/AccessPlaceholderScreen";

export default function SavTabRoute() {
  return (
    <AccessPlaceholderScreen
      permission="sav.read"
      title="SAV"
      description="Le suivi SAV sera intégré dans une prochaine étape."
    />
  );
}
