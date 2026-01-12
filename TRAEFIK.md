# Déploiement avec Traefik / Dokploy

Ce guide explique comment déployer l'application avec Traefik comme reverse proxy sur Dokploy.

## Configuration

### 1. Variables d'environnement

Créez un fichier `.env` avec vos domaines personnalisés:

```env
# Database
DB_PASSWORD=votre_mot_de_passe_securise

# Backend
SECRET_KEY=votre_cle_secrete_jwt
ADMIN_PASSWORD=votre_mot_de_passe_admin

# Domaines Traefik (personnalisez selon vos DNS)
DOMAIN=cards.jeece.fr
API_DOMAIN=api-cards.jeece.fr

# API URL pour le build du frontend
VITE_API_URL=https://api-cards.jeece.fr
```

### 2. DNS

Configurez vos enregistrements DNS pour pointer vers votre serveur:

```
A    cards.jeece.fr      → IP_SERVEUR
A    api-cards.jeece.fr  → IP_SERVEUR
```

### 3. Déploiement

#### Option A: Avec ports locaux (dev + Traefik)

Gardez les ports exposés pour accès direct + Traefik:
```bash
docker compose up -d
```

Accessible via:
- Frontend: `http://localhost:3333` OU `https://cards.jeece.fr`
- Backend: `http://localhost:5555` OU `https://api-cards.jeece.fr`

#### Option B: Production uniquement via Traefik

Commentez les sections `ports:` dans docker-compose.yml:
```yaml
backend:
  # ports:
  #   - "5555:5000"

frontend:
  # ports:
  #   - "3333:80"
```

Accessible uniquement via:
- Frontend: `https://cards.jeece.fr`
- Backend: `https://api-cards.jeece.fr`

## Fonctionnement

### Traefik Labels

**Backend (API):**
- Router: `business-cards-api`
- Domaine: `${API_DOMAIN}` (ex: api-cards.jeece.fr)
- Port interne: `5000`
- HTTPS avec Let's Encrypt

**Frontend:**
- Router: `business-cards`
- Domaine: `${DOMAIN}` (ex: cards.jeece.fr)
- Port interne: `80`
- HTTPS avec Let's Encrypt

### Réseau

Deux réseaux sont utilisés:
- `app_network`: Communication interne entre containers
- `dokploy-network`: Réseau externe pour Traefik (doit exister)

### SSL/TLS

Les certificats SSL sont générés automatiquement par Traefik via Let's Encrypt.

## Vérification

### Vérifier que Traefik détecte les services

```bash
# Voir les logs Traefik
docker logs traefik

# Vérifier les routes
curl https://cards.jeece.fr
curl https://api-cards.jeece.fr/api/cards
```

### Tester l'API

```bash
# Test endpoint public
curl https://api-cards.jeece.fr/api/cards/CARD_ID

# Test endpoint protégé (nécessite token)
curl -H "Authorization: Bearer TOKEN" https://api-cards.jeece.fr/api/cards
```

## Troubleshooting

### Erreur "network dokploy-network not found"

Le réseau Traefik doit exister. Sur Dokploy, il est créé automatiquement.

En local pour tester:
```bash
docker network create dokploy-network
```

### Certificat SSL non généré

Vérifiez:
1. Les DNS pointent vers votre serveur
2. Les ports 80 et 443 sont ouverts
3. Le certresolver `letsencrypt` existe dans Traefik
4. Les logs Traefik pour voir les erreurs

### Frontend ne peut pas joindre l'API

Le `VITE_API_URL` doit être configuré **avant le build**:
```bash
# Rebuild le frontend avec la bonne URL
VITE_API_URL=https://api-cards.jeece.fr docker compose build frontend
docker compose up -d frontend
```

## Architecture

```
Internet
   ↓
Traefik (ports 80/443)
   ├─→ cards.jeece.fr → Frontend (Nginx:80)
   └─→ api-cards.jeece.fr → Backend (Flask:5000)
        ↓
   PostgreSQL (interne, non exposé)
```

## Sécurité

- ✅ HTTPS forcé via Traefik
- ✅ Base de données non exposée publiquement
- ✅ JWT pour authentification API
- ✅ CORS configuré
- ✅ Secrets dans variables d'environnement
- ✅ Certificats SSL auto-renouvelés

## Monitoring

Traefik Dashboard (si activé):
```
https://traefik.votredomaine.fr
```

Logs des services:
```bash
docker compose logs -f backend
docker compose logs -f frontend
```
