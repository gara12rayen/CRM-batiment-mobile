import { Link } from "expo-router";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function NotFoundRoute() {
  return (
    <PlaceholderView
      title="Page introuvable"
      description="Cette page n'existe pas ou n'est plus disponible."
    >
      <Link href="/" style={{ color: "#2563EB", marginTop: 16 }}>
        {"Retour à l'accueil"}
      </Link>
    </PlaceholderView>
  );
}
