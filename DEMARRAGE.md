# PhishGuard - Plateforme de Simulation de Phishing

## Architecture
- **Frontend** : React 18 + Vite + Tailwind CSS v4 + Recharts → port 5173
- **Backend**  : Node.js + Express 5 + Mongoose → port 5000
- **Base de données** : MongoDB

## Démarrage

### 1. Prérequis
- Node.js v18+
- MongoDB (local ou MongoDB Atlas)

### 2. Backend

```bash
cd backend
# Configurer .env si nécessaire (MONGO_URI)
npm run seed       # Initialiser la base avec des données de démo
npm run dev        # Démarrer le serveur (nodemon)
```

### 3. Frontend

```bash
cd phishing-platform
npm run dev        # Démarrer le frontend
```

### 4. Ouvrir dans le navigateur
http://localhost:5173

## Comptes de démonstration
| Email                    | Mot de passe | Rôle         |
|--------------------------|-------------|--------------|
| admin@company.com        | password123 | Administrateur |
| operator@company.com     | password123 | Opérateur    |

## Structure du projet

```
├── backend/
│   ├── config/db.js          # Connexion MongoDB
│   ├── models/               # Schémas Mongoose
│   │   ├── User.js
│   │   ├── Campaign.js
│   │   ├── EmailTemplate.js
│   │   ├── TargetGroup.js
│   │   └── LandingPage.js
│   ├── controllers/          # Logique métier
│   ├── routes/               # Routes API REST
│   ├── middleware/auth.js    # JWT middleware
│   ├── seed.js               # Données de démonstration
│   └── server.js             # Point d'entrée
│
└── phishing-platform/        # Frontend React
    └── src/
        ├── api/axios.js      # Client HTTP
        ├── store/            # Zustand (état global)
        ├── pages/            # Pages (Dashboard, Campaigns, etc.)
        ├── components/       # Composants réutilisables
        └── router/           # Navigation protégée

## API Endpoints
POST   /api/auth/login
GET    /api/auth/me
GET    /api/campaigns
POST   /api/campaigns
POST   /api/campaigns/:id/launch
POST   /api/campaigns/:id/pause
GET    /api/campaigns/stats/dashboard
GET    /api/templates
POST   /api/templates
GET    /api/groups
POST   /api/groups
POST   /api/groups/:id/targets
GET    /api/landing-pages
POST   /api/landing-pages
GET    /api/users              (admin seulement)
```
