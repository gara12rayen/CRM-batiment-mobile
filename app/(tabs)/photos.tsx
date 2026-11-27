import { AccessPlaceholderScreen } from "@/features/access/AccessPlaceholderScreen";

export default function PhotosTabRoute() {
  return (
    <AccessPlaceholderScreen
      permission="photos"
      title="Photos"
      description="Les photos de chantier seront intégrées dans une prochaine étape."
    />
  );
}
