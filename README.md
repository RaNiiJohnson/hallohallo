# Hallomada

<p align="center">
  <a href="https://hallomada.de">
    <img src="public/logo.png" alt="Logo Hallomada" width="120" />
  </a>
</p>

<p align="center">
  <strong>La plateforme communautaire des Malagasy en Allemagne.</strong>
</p>

<p align="center">
  <a href="https://hallomada.de">Découvrir Hallomada</a>
</p>

Hallomada facilite les échanges, l'entraide et le partage d'opportunités au
sein de la communauté Malagasy en Allemagne. La plateforme réunit dans un même
espace les communautés, les profils, les offres d'emploi et les annonces
immobilières.

## Fonctionnalités

- création de communautés et partage de publications ;
- profils publics et activité des membres ;
- publication et consultation d'offres d'emploi ;
- publication et consultation d'annonces immobilières ;
- modération administrative des offres et annonces avant leur publication ;
- notifications pour les membres et les administrateurs ;
- tableau de bord d'administration ;
- interface disponible en français, allemand et anglais.

## Modération des annonces

Les offres d'emploi et les annonces immobilières suivent le même processus de
validation :

```text
Soumission par un membre
          ↓
     En attente
          ↓
Validation par un administrateur
          ↓
 Publication ou refus
          ↓
Notification envoyée au membre
```

Tant qu'une annonce est en attente, elle reste visible uniquement par son
auteur et les administrateurs.

## Stack technique

- [Next.js](https://nextjs.org/) 16 et React 19 ;
- TypeScript ;
- [Convex](https://www.convex.dev/) pour le backend réactif et les données ;
- Better Auth pour l'authentification ;
- next-intl pour l'internationalisation ;
- Tailwind CSS et Radix UI pour l'interface ;
- Vitest et convex-test pour les tests.

## Installation locale

### Prérequis

- Node.js ;
- [pnpm](https://pnpm.io/) ;
- un projet Convex configuré.

### Démarrage

```bash
pnpm install
```

Utilisez le fichier [`.env-template`](./.env-template) comme référence.
Copiez son bloc **CLIENT / NEXT.JS** dans `.env.local`, puis configurez son bloc
**CONVEX BACKEND** sur votre déploiement Convex. Le template distingue les
variables obligatoires, optionnelles et fournies automatiquement par Convex.

Les identifiants OAuth, les secrets d'envoi d'e-mails et les clés des services
externes doivent rester dans les environnements sécurisés correspondants. Ne
commitez jamais leurs valeurs dans le dépôt.

Lancez Convex dans un premier terminal :

```bash
pnpm exec convex dev
```

Puis lancez l'application dans un second terminal :

```bash
pnpm dev
```

## Commandes utiles

| Commande                 | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `pnpm dev`               | Lance le serveur de développement               |
| `pnpm build`             | Génère le build de production                   |
| `pnpm start`             | Lance le build de production                    |
| `pnpm lint`              | Vérifie le code avec ESLint                     |
| `pnpm exec tsc --noEmit` | Vérifie les types TypeScript                    |
| `pnpm test`              | Lance les tests en mode interactif              |
| `pnpm test:once`         | Exécute toute la suite de tests une fois        |
| `pnpm test:coverage`     | Exécute les tests avec le rapport de couverture |

## Structure du projet

```text
app/                  Routes et interfaces Next.js
convex/               Schéma, fonctions backend, authentification et services
messages/             Traductions françaises, allemandes et anglaises
src/components/       Composants d'interface partagés
src/lib/              Utilitaires et logique partagée
*.test.ts(x)           Tests automatisés placés près du code concerné
docs/                  Documentation et notes de préparation au lancement
```

## Qualité

Chaque changement doit au minimum passer les contrôles suivants :

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test:once
pnpm build
```

## Statut du projet

Hallomada est en développement actif. Les fonctionnalités et les parcours
utilisateur continuent d'évoluer avec les besoins de la communauté.

---

<p align="center">
  Hallomada — ensemble, construisons une communauté forte.
</p>
