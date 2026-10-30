import { ChangePasswordView } from "@/features/auth/views/ChangePasswordView";
import { useChangePasswordViewModel } from "@/features/auth/viewmodels/useChangePasswordViewModel";

export default function ChangePasswordScreen() {
  const { isLoading, errorMessage, handleChangePassword } =
    useChangePasswordViewModel();

  return (
    <ChangePasswordView
      onSubmit={handleChangePassword}
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  );
}
