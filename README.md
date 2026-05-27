# MG-Connect 🇲🇬🇩🇪

> La plateforme communautaire des Malagasy en Allemagne

MG-Connect est une application web dédiée au réseautage et à l'entraide entre les natifs et la diaspora Malagasy vivant en Allemagne. Notre mission est de créer un pont entre les communautés pour faciliter l'intégration et le partage d'expériences.

## ✨ Fonctionnalités

### 🤝 Communauté

- Connectez-vous avec d'autres Malagasy en Allemagne
- Créez des liens durables au sein de notre communauté
- Partagez vos expériences d'expatriation

### 💼 Opportunités

- Trouvez des offres d'emploi adaptées à votre profil
- Découvrez des formations et stages
- Publiez vos propres opportunités professionnelles

### 🏠 Immobilier

- Partagez et trouvez des logements facilement
- Réseau de confiance au sein de la communauté
- Annonces vérifiées par les membres

## 🚀 Technologies

- **Framework**: Next.js 16 avec App Router
- **Base de données**: Convex (Backend-as-a-Service)
- **Authentification**: Better Auth (via Convex)
- **UI**: shadCn UI + Tailwind CSS
- **Validation**: Zod + React Hook Form

## 🛠️ Installation

### Prérequis

- Node.js 20+
- pnpm (recommandé)

### Configuration

1. **Cloner le projet**

```bash
git clone <repository-url>
cd hallohallo
```

1. **Installer les dépendances**

```bash
pnpm install
```

<!--
1. **Configuration de l'environnement**

```bash
cp .env.example .env.local
```

Configurez les variables suivantes dans `.env.local` :

```env
# Convex
CONVEX_DEPLOYMENT="dev:impartial-rabbit-961"
NEXT_PUBLIC_CONVEX_URL="https://impartial-rabbit-961.convex.cloud"
NEXT_PUBLIC_CONVEX_SITE_URL="https://impartial-rabbit-961.convex.site"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
``` -->

1. **Authentification (Better Auth)**

```bash
npx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
```

```bash
npx convex env set SITE_URL http://localhost:3000
```

1. **Lancer le serveur de développement**

```bash
pnpm dev
```

En parallèle, assurez-vous que le serveur Convex tourne (souvent lancé automatiquement ou via `npx convex dev`).

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📝 Scripts disponibles

```bash
# Développement
pnpm dev              # Lance Next.js et Convex
npx convex dev        # Lance le serveur de développement Convex seul

# Build de production
pnpm build

# Démarrer en production
pnpm start

## 🎯 Notre Mission

**Créer un pont entre les Malagasy vivant en Allemagne et ceux restés au pays, facilitant l'intégration et le partage d'expériences.**

### Nos Valeurs

- **Solidarité** : La force de la communauté pour surmonter ensemble les défis
- **Partage** : Échanger expériences et connaissances
- **Entraide** : S'entraider dans les démarches d'expatriation
- **Identité** : Préserver la culture Malagasy tout en embrassant la diversité allemande

<!-- ## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter vos changements (`git commit -m 'Ajout: nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request -->

---

**Hallo Hallo** - Ensemble, construisons une communauté forte ! 🇲🇬❤️🇩🇪
```
