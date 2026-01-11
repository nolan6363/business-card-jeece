# Digital Business Cards

Une application fullstack de gestion de cartes de visite digitales avec tracking des scans et analytics.

## Fonctionnalités

- Dashboard protégé par mot de passe pour gérer les cartes
- Création et édition de cartes de visite avec photo
- URL unique (UUID) pour chaque carte
- Affichage public élégant des cartes
- Téléchargement vCard (.vcf) pour ajout aux contacts
- Tracking des scans avec analytics détaillées
- Graphiques : scans par jour, par carte, par type d'appareil
- Architecture Docker complète
- Backup automatique de la base de données

## Stack Technique

- **Frontend**: React 18 + Vite + TailwindCSS + Recharts
- **Backend**: Flask + SQLAlchemy + PostgreSQL
- **Containerisation**: Docker + Docker Compose
- **Web Server**: Nginx (pour le frontend)
- **Database**: PostgreSQL 16

## Installation

### Prérequis

- Docker et Docker Compose installés
- Git

### Configuration

1. Cloner le repository
```bash
git clone <repository-url>
cd digital-business-cards
```

2. Créer le fichier `.env` à partir de `.env.example`
```bash
cp .env.example .env
```

3. Modifier les variables d'environnement dans `.env`
```bash
# Database Configuration
DB_PASSWORD=your_secure_db_password_here

# Backend Configuration
SECRET_KEY=your_secret_key_for_jwt_here
ADMIN_PASSWORD=your_dashboard_password_here

# API URL (for frontend)
VITE_API_URL=http://localhost:5000
```

**Important**: Changez tous les mots de passe et clés par des valeurs sécurisées en production!

### Démarrage

1. Construire et lancer les containers
```bash
docker-compose up -d --build
```

2. Vérifier que les containers sont en cours d'exécution
```bash
docker-compose ps
```

3. Accéder à l'application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Utilisation

### Accès au Dashboard

1. Ouvrir http://localhost:3000
2. Vous serez redirigé vers la page de login
3. Entrer le mot de passe configuré dans `.env` (variable `ADMIN_PASSWORD`)

### Créer une Carte de Visite

1. Cliquer sur "New Business Card"
2. Remplir les informations:
   - Prénom et nom
   - Email
   - Entreprise
   - Poste
   - Site web (optionnel)
   - Photo/logo (optionnel)
3. Cliquer sur "Create Card"

### Partager une Carte

1. Dans le dashboard, cliquer sur "Copy Link" sur la carte souhaitée
2. Le lien est copié dans le presse-papier
3. Ce lien peut être:
   - Partagé par email/SMS
   - Converti en QR code
   - Programmé sur un tag NFC

### Voir les Statistiques

1. Dans le dashboard, cliquer sur l'onglet "Statistics"
2. Vous verrez:
   - Nombre total de scans
   - Graphique des scans par jour (30 derniers jours)
   - Répartition des scans par carte
   - Répartition par type d'appareil (iOS/Android/Desktop)

## Backup de la Base de Données

### Backup Manuel

Exécuter le script de backup:
```bash
./backup.sh
```

Les backups sont stockés dans `./backups/` avec rotation automatique (30 jours).

### Backup Automatique (Cron)

Pour configurer un backup quotidien à 2h du matin:

1. Éditer le crontab
```bash
crontab -e
```

2. Ajouter cette ligne:
```
0 2 * * * cd /path/to/digital-business-cards && ./backup.sh >> ./backups/backup.log 2>&1
```

Remplacer `/path/to/digital-business-cards` par le chemin absolu du projet.

### Restauration d'un Backup

1. Arrêter le backend
```bash
docker-compose stop backend
```

2. Restaurer le backup
```bash
gunzip -c backups/backup_YYYY-MM-DD_HH-MM-SS.sql.gz | docker exec -i business_cards_db psql -U admin -d business_cards
```

3. Redémarrer le backend
```bash
docker-compose start backend
```

## Déploiement sur VPS

### Configuration pour Production

1. Modifier les variables d'environnement dans `.env`:
   - Utiliser des mots de passe forts
   - Configurer `VITE_API_URL` avec votre domaine/IP publique

2. Optionnel: Configurer un reverse proxy (nginx/traefik) pour HTTPS

### Avec Nginx Reverse Proxy

Exemple de configuration nginx pour HTTPS:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Architecture

### Structure des Fichiers

```
digital-business-cards/
├── backend/
│   ├── app/
│   │   ├── __init__.py       # Flask app initialization
│   │   ├── models.py         # Database models
│   │   ├── routes.py         # API endpoints
│   │   ├── utils.py          # Utility functions
│   │   └── config.py         # Configuration
│   ├── uploads/              # Photo storage
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile
│   └── run.py               # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Main app component
│   │   ├── api.js           # API client
│   │   └── main.jsx         # Entry point
│   ├── Dockerfile
│   ├── nginx.conf           # Nginx configuration
│   └── package.json
├── docker-compose.yml       # Docker orchestration
├── backup.sh                # Backup script
├── .env                     # Environment variables
└── README.md
```

### API Endpoints

#### Public
- `GET /api/cards/:id` - Voir une carte
- `POST /api/cards/:id/scan` - Enregistrer un scan
- `GET /api/cards/:id/vcard` - Télécharger vCard

#### Protected (nécessite authentification)
- `POST /api/auth/login` - Connexion
- `GET /api/cards` - Liste toutes les cartes
- `POST /api/cards` - Créer une carte
- `PUT /api/cards/:id` - Modifier une carte
- `DELETE /api/cards/:id` - Supprimer une carte
- `GET /api/stats` - Statistiques globales
- `GET /api/stats/:id` - Stats d'une carte

## Troubleshooting

### Les containers ne démarrent pas

1. Vérifier les logs:
```bash
docker-compose logs
```

2. Vérifier que les ports 3000 et 5000 ne sont pas utilisés:
```bash
lsof -i :3000
lsof -i :5000
```

### Erreur de connexion à la base de données

1. Vérifier que le container PostgreSQL est en cours d'exécution:
```bash
docker-compose ps postgres
```

2. Vérifier les logs de PostgreSQL:
```bash
docker-compose logs postgres
```

### Les photos ne s'affichent pas

1. Vérifier que le volume est monté correctement:
```bash
docker-compose exec backend ls -la uploads/
```

2. Vérifier les permissions du dossier `backend/uploads/`

### Erreur 401 dans le dashboard

Le token JWT a expiré (24h). Reconnectez-vous avec le mot de passe.

## Développement

### Lancer en mode développement

Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # ou `venv\Scripts\activate` sur Windows
pip install -r requirements.txt
python run.py
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

### Structure de la Base de Données

**Table `cards`:**
- id (UUID, PK)
- first_name, last_name
- email, company, position, website
- photo_path
- is_active
- created_at

**Table `scans`:**
- id (Integer, PK)
- card_id (FK → cards.id)
- scanned_at
- user_agent, device_type

## Licence

Ce projet est sous licence MIT.

## Support

Pour tout problème ou question, ouvrir une issue sur GitHub.
