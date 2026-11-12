import { PlaceholderView } from "@/shared/components/PlaceholderView";
import { AccessGate } from "@/features/access/AccessGate";

export default function ChantiersTabRoute() {
  return (
    <AccessGate permission="chantiers.read">
      <PlaceholderView
        title="Chantiers"
        description="La liste des chantiers sera intégrée dans une prochaine étape."
      />
    </AccessGate>
  );
}
