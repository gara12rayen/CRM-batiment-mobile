import { AccessGate } from "@/features/access/AccessGate";
import { ProfileView } from "@/features/auth/views/ProfileView";

export default function ProfileRoute() {
  return (
    <AccessGate permission="profile">
      <ProfileView />
    </AccessGate>
  );
}
