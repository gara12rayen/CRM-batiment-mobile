import { Link } from "expo-router";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export function LoginView() {
  return (
    <PlaceholderView
      title="Connexion"
      description="L'écran d'authentification sera intégré dans une prochaine étape."
    >
      <Link href="/(auth)/forgot-password" style={{ color: "#2563EB", marginTop: 16 }}>
        Mot de passe oublié ?
      </Link>
    </PlaceholderView>
  );
}
