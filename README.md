# NanoOrbit-front

Interface React (Vite) pour le projet **NanoOrbit** — consultation front-office et actions back-office selon le profil connecté.

- **API** : [NanoOrbit-back](https://github.com/TheoLugagne/NanoOrbit-back) (Flask + MySQL)
- **Auth** : session cookie (`withCredentials: true`) — les identifiants MySQL sont saisis sur la page de login

## Prérequis

- **Node.js** 20+ (LTS recommandé)
- **npm** 10+
- API NanoOrbit-back accessible (locale ou déployée)

---

## Installation locale

```bash
git clone <url-du-repo>
cd NanoOrbit-front
npm install
```

Copiez le fichier d'environnement de développement :

```bash
cp .env.example .env.development
```

Éditez `.env.development` selon votre configuration (voir ci-dessous).

---

## Variables d'environnement

| Variable | Mode | Description |
|----------|------|-------------|
| `VITE_API_BASE_URL` | dev / prod | URL de base de l'API (sans slash final). Vide en dev → requêtes relatives via proxy Vite |
| `VITE_API_PROXY_TARGET` | dev | Cible du proxy Vite pour `/api` (défaut : `http://127.0.0.1:5000`) |
| `VITE_BASE_PATH` | prod | Chemin de base du build (défaut : `/`) |

Les variables doivent être préfixées par `VITE_` pour être exposées au client.

### Exemple — développement avec API locale

Fichier `.env.development` :

```env
# Requêtes relatives → proxy Vite vers Flask local (évite CORS)
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://127.0.0.1:5000
```

Dans ce mode, lancez l'API sur `http://localhost:5000` puis le front.

### Exemple — développement avec API distante (HTTPS)

```env
VITE_API_BASE_URL=https://nano-orbite.tlugagne.live
VITE_API_PROXY_TARGET=http://127.0.0.1:5000
```

> Préférez l'URL **HTTPS** de l'API : une redirection HTTP→HTTPS casse le preflight CORS.

### Exemple — production

Copiez `.env.production.example` vers `.env.production` :

```env
VITE_API_BASE_URL=https://nano-orbite.tlugagne.live
VITE_BASE_PATH=/
```

---

## Lancer l'application en local

```bash
npm run dev
```

Le front est accessible sur **http://localhost:5173**.

Le proxy Vite redirige automatiquement les appels `/api/*` vers `VITE_API_PROXY_TARGET` lorsque `VITE_API_BASE_URL` est vide.

### Autres commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (HMR) |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualisation du build local |
| `npm run lint` | Vérification ESLint |

---

## Déploiement serveur (AlwaysData)

### 1. Récupérer le code

```bash
ssh <user>@ssh-<user>.alwaysdata.net
cd ~/NanoOrbit-front
git pull
```

### 2. Configurer la production

```bash
cp .env.production.example .env.production
```

Adaptez `VITE_API_BASE_URL` vers l'URL publique de l'API (ex. `https://nano-orbite.tlugagne.live`).

### 3. Builder le front

```bash
npm install
npm run build
```

Les fichiers statiques sont générés dans `dist/`.

### 4. Publier les fichiers

Deux approches courantes sur AlwaysData :

**A. Site dédié (sous-domaine)** — ex. `nano-orbite-prod.tlugagne.live`

1. Panneau AlwaysData → **Sites** → pointer la racine vers `~/NanoOrbit-front/dist`
2. Le fichier `public/.htaccess` est copié dans `dist/` au build (routing SPA React Router)

**B. Sous-dossier** — adapter `VITE_BASE_PATH` avant le build :

```env
VITE_BASE_PATH=/nanoorbit/
```

Puis adapter `RewriteBase` dans `public/.htaccess` en conséquence.

### 5. CORS et cookies (API)

Sur le back, vérifier que `CORS_ORIGINS` et `FRONTEND_ORIGIN` incluent l'URL exacte du front déployé, avec :

```env
SESSION_COOKIE_SAMESITE=None
SESSION_COOKIE_SECURE=true
```

Sans cela, la session ne persiste pas entre le front et l'API (domaines différents).

---

## Connexion — comptes de test

Saisissez les **logins applicatifs** (pas les comptes MySQL AlwaysData) :

| Identifiant | Profil | Accès back-office |
|-------------|--------|-------------------|
| `analyste_data` | Analyste | Non |
| `operateur_sat` | Opérateur | Partiel |
| `resp_mission` | Responsable missions | Partiel |
| `admin_nano` | Administrateur | Complet |

Les mots de passe sont ceux définis dans MySQL (Phase 4 locale ou comptes AlwaysData).

---

## Fonctionnalités par écran

| Page | Route | Rôles |
|------|-------|-------|
| Satellites | `/satellites` | Tous (lecture) — BO-01 / désorbitation selon profil |
| Communications | `/communications` | Tous |
| Missions | `/missions` | Tous — assignation (BO-03) : responsable, admin |
| Alertes | `/alertes` | Tous |
| Historique | `/historique` | Tous |
| Instruments | `/instruments` | Opérateur, admin (BO-05) |

---

## Structure du projet

```
src/
├── api/              # Client Axios (auth, front, back)
├── components/       # Composants métier (listes, formulaires BO)
├── context/          # AuthContext (session utilisateur)
├── pages/            # Pages React Router
├── styles/           # Feuilles CSS par écran
└── utils/            # Permissions, helpers date
public/
├── .htaccess         # Rewrite SPA (Apache / AlwaysData)
└── *.svg             # Assets statiques
vite.config.js        # Proxy dev + base path prod
.env.development      # Variables dev (non versionné si personnalisé)
.env.production       # Variables prod (à créer depuis .example)
```

---

## Dépannage

| Problème | Piste |
|----------|-------|
| Erreur CORS | Vérifier `CORS_ORIGINS` côté API ; utiliser HTTPS ; éviter redirection HTTP |
| Session perdue après login | `withCredentials` est actif ; cookies `Secure` + `SameSite=None` en prod |
| 401 sur toutes les routes | API non joignable ou mauvaise `VITE_API_BASE_URL` |
| Page blanche après refresh (prod) | Vérifier `.htaccess` et `VITE_BASE_PATH` |
