# Backend - Digital Business Cards API

Flask backend avec PostgreSQL pour gérer les cartes de visite digitales.

## Structure

```
backend/
├── app/
│   ├── __init__.py      # Configuration Flask et initialisation
│   ├── config.py        # Configuration (DB, uploads, JWT)
│   ├── models.py        # Modèles SQLAlchemy (Card, Scan)
│   ├── routes.py        # Routes API
│   └── utils.py         # Fonctions utilitaires (vCard, images)
├── migrations/          # Migrations SQL
│   ├── 001_add_phone_column.sql
│   └── README.md
├── uploads/             # Photos téléchargées
├── init_db.sql         # Schema initial de la base de données
├── Dockerfile          # Image Docker optimisée (1 worker, 60MB RAM)
├── requirements.txt    # Dépendances Python
└── run.py             # Point d'entrée de l'application
```

## Base de données

### Initialisation automatique

Le schéma est créé automatiquement au premier démarrage via `init_db.sql` monté dans le container PostgreSQL.

### Schema

**Table `cards`:**
- `id` (VARCHAR 36) - UUID unique
- `first_name`, `last_name`, `email`, `company`, `position` (requis)
- `phone`, `website`, `photo_path` (optionnels)
- `is_active` (BOOLEAN) - Carte active ou désactivée
- `created_at` (TIMESTAMP)

**Table `scans`:**
- `id` (SERIAL)
- `card_id` (FK vers cards)
- `scanned_at` (TIMESTAMP)
- `user_agent`, `device_type` - Pour analytics

### Migrations

Voir `migrations/README.md` pour exécuter les migrations.

## API Endpoints

### Publics
- `GET /api/cards/<id>` - Obtenir une carte
- `POST /api/cards/<id>/scan` - Enregistrer un scan
- `GET /api/cards/<id>/vcard` - Télécharger le vCard
- `GET /api/photos/<filename>` - Servir les photos

### Protégés (JWT requis)
- `POST /api/login` - Authentification
- `GET /api/cards` - Lister toutes les cartes
- `POST /api/cards` - Créer une carte
- `PUT /api/cards/<id>` - Modifier une carte
- `DELETE /api/cards/<id>` - Supprimer une carte
- `GET /api/stats` - Statistiques globales
- `GET /api/cards/<id>/stats` - Stats d'une carte

## Configuration

Variables d'environnement (`.env`):
```env
DATABASE_URL=postgresql://admin:password@postgres:5432/business_cards
SECRET_KEY=your_secret_key
ADMIN_PASSWORD=your_admin_password
```

## Optimisations

- **1 worker Gunicorn** avec gevent pour low memory (60MB RAM)
- **Preload** disabled pour hot-reload en dev
- **Max requests 1000** pour recycler les workers
- Images redimensionnées automatiquement à 400x400px
- Compression gzip sur les photos

## Développement local

```bash
# Installer les dépendances
pip install -r requirements.txt

# Lancer en mode dev
python run.py

# Avec Docker
docker-compose up backend
```

## Production

L'application utilise Gunicorn avec gevent pour la production:
```bash
gunicorn --bind 0.0.0.0:5000 --workers 1 --worker-class gevent run:app
```
