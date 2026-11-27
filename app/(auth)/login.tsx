import LoginView from "@/features/auth/views/LoginView";
import { useLoginViewModel } from "@/features/auth/viewmodels/useLoginViewModel";

export default function LoginScreen() {
  const { handleLogin, isLoading, errorMessage } = useLoginViewModel();

  return (
    <LoginView
      onLogin={handleLogin}
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  );
}
