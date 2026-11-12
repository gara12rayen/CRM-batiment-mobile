import { AccessGate } from "@/features/access/AccessGate";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function NotificationsRoute() {
  return (
    <AccessGate permission="mobile.use">
      <PlaceholderView
        title="Notifications"
        description="Vos notifications apparaîtront ici."
      />
    </AccessGate>
  );
}
