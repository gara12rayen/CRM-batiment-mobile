import ForgotPasswordView from "@/features/auth/views/ForgotPasswordView";
import { useForgotPasswordViewModel } from "@/features/auth/viewmodels/useForgotPasswordViewModel";

export default function ForgotPasswordScreen() {
  const { handleSubmit, isLoading, errorMessage } =
    useForgotPasswordViewModel();

  return (
    <ForgotPasswordView
      onSubmit={handleSubmit}
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  );
}
