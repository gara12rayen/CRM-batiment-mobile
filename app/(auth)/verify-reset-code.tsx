import VerifyResetCodeView from "@/features/auth/views/VerifyResetCodeView";
import { useVerifyResetCodeViewModel } from "@/features/auth/viewmodels/useVerifyResetCodeViewModel";

export default function VerifyResetCodeScreen() {
  const viewModel = useVerifyResetCodeViewModel();

  return <VerifyResetCodeView {...viewModel} />;
}
