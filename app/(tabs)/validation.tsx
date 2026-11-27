import { AccessGate } from "@/features/access/AccessGate";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function ValidationTabRoute() {
  return (
    <AccessGate permission="validation">
      <PlaceholderView
        title="Validation"
        description="Photos, pointages et rapports à valider. Ces écrans seront intégrés dans une prochaine étape."
      />
    </AccessGate>
  );
}
