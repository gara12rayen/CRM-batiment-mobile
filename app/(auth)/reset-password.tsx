import ResetPasswordView from "@/features/auth/views/ResetPasswordView";
import { useResetPasswordViewModel } from "@/features/auth/viewmodels/useResetPasswordViewModel";

export default function ResetPasswordScreen() {
  const viewModel = useResetPasswordViewModel();

  return <ResetPasswordView {...viewModel} />;
}
