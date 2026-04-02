# CESIZen — Application de Santé Mentale

Application complète de gestion du stress et de la santé mentale.

**Stack :** Node.js · Express · Prisma · PostgreSQL · React (Backoffice) · React Native Expo 54 (Mobile)

---

## Structure du projet

cesizen/
├── api/ → API REST Node.js + Prisma
├── backoffice/ → Interface admin React (port 5173)
├── mobile/ → App mobile React Native Expo 54
└── README.md


---

## Prérequis

- **Node.js** v18+ et **npm** v9+
- **PostgreSQL** installé avec **pgAdmin4**
- **Expo Go** installé sur votre téléphone (iOS ou Android)
- Base de données `cesizen` créée dans pgAdmin4

---

## Installation & Lancement

### 1. Base de données PostgreSQL

Dans pgAdmin4, vérifiez que la base `cesizen` existe avec :
- Utilisateur : `postgres`
- Mot de passe : `postgresql`

### 2. API (Port 3000)

```bash
cd api
npm install
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

L'API sera disponible sur : `http://localhost:3000`

> **Comptes de test créés par le seed :**
> - Admin : `admin@cesizen.fr` / `Admin1234!`
> - User  : `alice@cesizen.fr` / `User1234!`

### 3. Backoffice (Port 5173)

```bash
cd backoffice
npm install
npm run dev
```

Ouvrez : `http://localhost:5173`

### 4. Mobile (Expo Go)

> **Important** : Avant de lancer, créer un .env dans le dossier /mobile afin d'y mettre l'adresse IP locale de votre machine (ex: `192.168.1.XX`) sous ce format : EXPO_PUBLIC_API_URL="votre_adresse_ip". Votre téléphone et votre PC doivent être sur le même réseau Wi-Fi.

```bash
cd mobile
npm install
npx expo start
```

Scannez le QR code avec **Expo Go** (Android) ou l'app Appareil photo (iOS).

---

## Tests

```bash
cd api
npm run test
```

Les tests couvrent :
- **auth.test.js** — Inscription, connexion, refresh token
- **user.test.js** — CRUD utilisateurs, rôles, activation
- **information.test.js** — CRUD informations
- **exercise.test.js** — CRUD exercices de respiration

---

## Dépendances principales

### API
| Package | Rôle |
|---|---|
| `express` | Framework serveur HTTP |
| `@prisma/client` + `prisma` | ORM & migrations PostgreSQL |
| `jsonwebtoken` | Génération/vérification JWT |
| `bcryptjs` | Hashage des mots de passe |
| `cors` | Gestion des origines croisées |
| `dotenv` | Variables d'environnement |
| `nodemon` | Rechargement automatique (dev) |
| `jest` + `supertest` | Tests automatisés |

### Backoffice
| Package | Rôle |
|---|---|
| `react` + `react-dom` | Interface utilisateur |
| `react-router-dom` | Navigation SPA |
| `axios` | Requêtes HTTP + intercepteurs JWT |
| `vite` | Bundler & serveur de développement |

### Mobile
| Package | Rôle |
|---|---|
| `expo ~54` | Plateforme React Native |
| `react-navigation` | Navigation mobile (stack + tabs) |
| `axios` | Requêtes HTTP + intercepteurs JWT |
| `@react-native-async-storage/async-storage` | Persistance tokens |

---

## Authentification JWT Dual Token

| Token | Durée | Stockage |
|---|---|---|
| Access Token | 15 minutes | Memory / Header |
| Refresh Token | 7 jours | BDD + AsyncStorage |

Le refresh token permet de renouveler l'access token automatiquement via les intercepteurs Axios, sans redemander la connexion à l'utilisateur.

---

## Modèle de données

Tables : `user` · `information` · `manage` · `exercise` · `handle` · `respiration_phase` · `compose` · `refresh_token`

Migrations : gérées automatiquement par Prisma (`prisma migrate dev`)
