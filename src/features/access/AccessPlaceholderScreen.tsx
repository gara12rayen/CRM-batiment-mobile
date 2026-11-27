import { AccessGate } from "./AccessGate";
import type { Permission } from "./access.types";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

type AccessPlaceholderScreenProps = {
  permission: Permission;
  title: string;
  description: string;
};

export function AccessPlaceholderScreen({
  permission,
  title,
  description,
}: AccessPlaceholderScreenProps) {
  return (
    <AccessGate permission={permission}>
      <PlaceholderView title={title} description={description} />
    </AccessGate>
  );
}
