# Workflow Git

1. Créer une branche dédiée depuis la branche d'intégration, par exemple `feature/clients-list`.
2. Garder les changements ciblés et ajouter les tests correspondant au comportement développé.
3. Avant d'ouvrir une pull request, lancer `npm run typecheck`, `npm run lint` et les tests concernés.
4. Ouvrir une pull request décrivant le changement, les vérifications effectuées et les éventuelles migrations/configurations.
5. Ne jamais committer `.env`, secrets, dépendances installées ni sorties de build.
