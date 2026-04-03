# Conception - PhishGuard

---

## 1. Diagramme de Cas d'Utilisation

```mermaid
graph TD
    Admin((Administrateur))
    Operator((Opérateur))
    Viewer((Observateur))
    Cible((Cible / Employé))

    Admin --> UC1[Se connecter]
    Admin --> UC2[Gérer les utilisateurs]
    Admin --> UC3[Créer une campagne]
    Admin --> UC4[Lancer / Pauser une campagne]
    Admin --> UC5[Gérer les templates email]
    Admin --> UC6[Gérer les groupes de cibles]
    Admin --> UC7[Gérer les landing pages]
    Admin --> UC8[Consulter les résultats]
    Admin --> UC9[Voir le dashboard]

    Operator --> UC1
    Operator --> UC3
    Operator --> UC4
    Operator --> UC5
    Operator --> UC6
    Operator --> UC7
    Operator --> UC8
    Operator --> UC9

    Viewer --> UC1
    Viewer --> UC8
    Viewer --> UC9

    Cible --> UC10[Recevoir un email de phishing]
    Cible --> UC11[Cliquer sur le lien]
    Cible --> UC12[Soumettre ses données]
    Cible --> UC13[Signaler l'email]
```

---

## 2. Diagramme de Classes

```mermaid
classDiagram
    class User {
        +String name
        +String email
        +String password
        +String role
        +Boolean isActive
        +Date lastLogin
        +matchPassword(password) Boolean
    }

    class Campaign {
        +String name
        +String description
        +String status
        +Date launchDate
        +Date endDate
        +String smtpProfile
        +getStats() Object
    }

    class EmailTemplate {
        +String name
        +String subject
        +String fromName
        +String fromEmail
        +String htmlContent
        +String category
    }

    class TargetGroup {
        +String name
        +String description
        +Target[] targets
    }

    class Target {
        +String email
        +String firstName
        +String lastName
        +String department
        +String position
    }

    class LandingPage {
        +String name
        +String htmlContent
        +String redirectUrl
        +Boolean captureCredentials
        +Boolean capturePasswords
    }

    class CampaignResult {
        +String targetEmail
        +String targetName
        +String department
        +String riskLevel
        +Event[] events
    }

    class Event {
        +String type
        +Date timestamp
        +String ipAddress
        +String userAgent
    }

    User "1" --> "0..*" Campaign : crée
    User "1" --> "0..*" EmailTemplate : crée
    User "1" --> "0..*" TargetGroup : crée
    User "1" --> "0..*" LandingPage : crée
    Campaign "1" --> "1" EmailTemplate : utilise
    Campaign "1" --> "1" TargetGroup : cible
    Campaign "1" --> "1" LandingPage : redirige
    Campaign "1" --> "0..*" CampaignResult : contient
    TargetGroup "1" --> "1..*" Target : contient
    CampaignResult "1" --> "0..*" Event : enregistre
```

---

## 3. Diagramme de Séquence - Authentification

```mermaid
sequenceDiagram
    actor Utilisateur
    participant Frontend
    participant Backend
    participant MongoDB

    Utilisateur->>Frontend: Saisit email + mot de passe
    Frontend->>Backend: POST /api/auth/login
    Backend->>MongoDB: Cherche l'utilisateur par email
    MongoDB-->>Backend: Retourne l'utilisateur
    Backend->>Backend: Vérifie le mot de passe (bcrypt)
    Backend->>Backend: Génère le token JWT
    Backend-->>Frontend: { token, user }
    Frontend->>Frontend: Stocke le token (localStorage)
    Frontend-->>Utilisateur: Redirige vers /dashboard
```

---

## 4. Diagramme de Séquence - Lancement d'une Campagne

```mermaid
sequenceDiagram
    actor Opérateur
    participant Frontend
    participant Backend
    participant MongoDB

    Opérateur->>Frontend: Clique sur "Lancer la campagne"
    Frontend->>Backend: POST /api/campaigns/:id/launch
    Backend->>Backend: Vérifie JWT + rôle
    Backend->>MongoDB: Récupère la campagne + template + groupe + landing page
    MongoDB-->>Backend: Données complètes
    Backend->>Backend: Génère les liens de tracking uniques
    Backend->>Backend: Simule l'envoi des emails
    Backend->>MongoDB: Met à jour status = "active"
    Backend->>MongoDB: Enregistre événement "email_sent" pour chaque cible
    Backend-->>Frontend: { success, campaign }
    Frontend-->>Opérateur: Affiche statut "Active"
```

---

## 5. Diagramme de Séquence - Tracking d'un Événement

```mermaid
sequenceDiagram
    actor Cible
    participant LandingPage
    participant Backend
    participant MongoDB

    Cible->>LandingPage: Clique sur le lien dans l'email
    LandingPage->>Backend: POST /api/campaigns/event { type: "link_clicked" }
    Backend->>MongoDB: Enregistre l'événement avec IP + userAgent
    MongoDB-->>Backend: OK
    Backend-->>LandingPage: OK
    LandingPage-->>Cible: Affiche la page de phishing

    Cible->>LandingPage: Soumet ses identifiants
    LandingPage->>Backend: POST /api/campaigns/event { type: "data_submitted" }
    Backend->>MongoDB: Enregistre l'événement + met à jour riskLevel = "high"
    Backend-->>LandingPage: OK
    LandingPage-->>Cible: Redirige vers redirectUrl
```

---

## 6. Diagramme de Déploiement

```mermaid
graph TB
    subgraph Client
        Browser[Navigateur Web]
    end

    subgraph Serveur
        subgraph Frontend
            Vite[Vite Dev Server\nPort 5173]
            React[Application React]
        end

        subgraph Backend
            Express[Express.js\nPort 5000]
            Auth[Middleware JWT]
            Controllers[Controllers]
        end

        subgraph Base_de_données
            MongoDB[(MongoDB\nPort 27017)]
        end
    end

    Browser -->|HTTP :5173| Vite
    Vite --> React
    React -->|REST API HTTP :5000| Express
    Express --> Auth
    Auth --> Controllers
    Controllers -->|Mongoose| MongoDB
```

---

## 7. Diagramme d'Activité - Création d'une Campagne

```mermaid
flowchart TD
    A([Début]) --> B[Remplir le nom et description]
    B --> C[Sélectionner un template email]
    C --> D{Template disponible ?}
    D -->|Non| E[Créer un nouveau template]
    E --> C
    D -->|Oui| F[Sélectionner un groupe de cibles]
    F --> G{Groupe disponible ?}
    G -->|Non| H[Créer un nouveau groupe]
    H --> F
    G -->|Oui| I[Sélectionner une landing page]
    I --> J{Landing page disponible ?}
    J -->|Non| K[Créer une nouvelle landing page]
    K --> I
    J -->|Oui| L[Enregistrer en brouillon]
    L --> M{Lancer maintenant ?}
    M -->|Non| N([Fin - Statut: Draft])
    M -->|Oui| O[Lancer la campagne]
    O --> P[Envoi des emails aux cibles]
    P --> Q([Fin - Statut: Active])
```

---

## 8. Matrice des Droits (RBAC)

| Fonctionnalité | Admin | Opérateur | Observateur |
|----------------|-------|-----------|-------------|
| Voir dashboard | ✅ | ✅ | ✅ |
| Voir campagnes | ✅ | ✅ | ✅ |
| Créer campagne | ✅ | ✅ | ❌ |
| Lancer/Pauser campagne | ✅ | ✅ | ❌ |
| Supprimer campagne | ✅ | ❌ | ❌ |
| Gérer templates | ✅ | ✅ | ❌ |
| Gérer groupes | ✅ | ✅ | ❌ |
| Gérer landing pages | ✅ | ✅ | ❌ |
| Gérer utilisateurs | ✅ | ❌ | ❌ |
| Voir résultats | ✅ | ✅ | ✅ |
