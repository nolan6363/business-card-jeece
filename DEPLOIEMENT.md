# Guide de Déploiement sur VPS

## Important: SSL et Nom de Domaine

**⚠️ L'application Docker n'inclut PAS de gestion SSL/HTTPS automatique.**

Vous devez configurer un reverse proxy (nginx ou Traefik) avec Let's Encrypt pour gérer le SSL.

## Architecture de Déploiement Recommandée

```
Internet (HTTPS/443)
         ↓
    Nginx Reverse Proxy (avec SSL Let's Encrypt)
         ↓
    Frontend Container (port 3000)
    Backend Container (port 5000)
    PostgreSQL Container
```

## Étapes de Déploiement

### 1. Prérequis sur le VPS

```bash
# Installer Docker et Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer nginx
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# Cloner le projet
git clone <votre-repo> /opt/digital-business-cards
cd /opt/digital-business-cards
```

### 2. Configuration du Nom de Domaine

**Avant toute chose, configurez votre DNS:**

1. Chez votre registrar (OVH, Gandi, etc.), ajoutez un enregistrement A:
   ```
   Type: A
   Nom: @ (ou votre sous-domaine)
   Valeur: IP_DE_VOTRE_VPS
   TTL: 300
   ```

2. Attendez la propagation DNS (peut prendre jusqu'à 24h mais généralement 5-10 minutes)

3. Vérifiez avec: `dig votre-domaine.com`

### 3. Configuration de l'Application

#### Étape 1: Créer le fichier .env

```bash
cp .env.example .env
nano .env
```

**Modifiez les valeurs suivantes:**

```bash
# IMPORTANT: Utilisez des valeurs FORTES en production
DB_PASSWORD=VotreMotDePasseDBTresSecurise123!

SECRET_KEY=VotreCleSecretePourJWTTresLongue456!

ADMIN_PASSWORD=VotreMotDePasseDashboardSecurise789!

# IMPORTANT: Utilisez votre nom de domaine (avec https)
VITE_API_URL=https://votre-domaine.com
```

#### Étape 2: Modifier docker-compose.yml pour la production

Éditez `docker-compose.yml`:

```yaml
services:
  postgres:
    # ... (pas de changement)

  backend:
    # ...
    ports:
      - "127.0.0.1:5000:5000"  # ← IMPORTANT: n'écoute que localhost

  frontend:
    # ...
    ports:
      - "127.0.0.1:3000:80"  # ← IMPORTANT: n'écoute que localhost
```

**Pourquoi ?** Pour que seul nginx puisse accéder aux containers, pas internet directement.

### 4. Configuration Nginx avec SSL

#### Étape 1: Configuration nginx

Créez `/etc/nginx/sites-available/business-cards`:

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Permet à Certbot de valider le domaine
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirige tout le reste vers HTTPS (sera activé après SSL)
    # location / {
    #     return 301 https://$server_name$request_uri;
    # }
}

# Configuration HTTPS (sera activée après obtention du certificat)
# server {
#     listen 443 ssl http2;
#     server_name votre-domaine.com;
#
#     # Certificats SSL (Certbot les ajoutera automatiquement)
#     # ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
#     # ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
#
#     # Configuration SSL moderne
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#     ssl_prefer_server_ciphers on;
#
#     # Taille max upload (pour les photos)
#     client_max_body_size 5M;
#
#     # Frontend - toutes les routes sauf /api
#     location / {
#         proxy_pass http://127.0.0.1:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
#
#     # Backend API
#     location /api {
#         proxy_pass http://127.0.0.1:5000;
#         proxy_http_version 1.1;
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#     }
# }
```

Activez le site:

```bash
sudo ln -s /etc/nginx/sites-available/business-cards /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Étape 2: Obtenir le certificat SSL

```bash
sudo certbot --nginx -d votre-domaine.com
```

Certbot va:
1. Valider que vous possédez le domaine
2. Obtenir un certificat SSL gratuit
3. Modifier automatiquement votre configuration nginx
4. Configurer le renouvellement automatique

#### Étape 3: Décommenter la configuration HTTPS

Après l'obtention du certificat, éditez `/etc/nginx/sites-available/business-cards`:
- Décommentez le bloc `server` HTTPS
- Décommentez la redirection HTTP→HTTPS dans le premier bloc `server`

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Lancer l'Application

```bash
cd /opt/digital-business-cards

# Construire et lancer
docker compose up -d --build

# Vérifier les logs
docker compose logs -f

# Vérifier que tout fonctionne
docker compose ps
```

### 6. Configuration du Backup Automatique

```bash
# Rendre le script exécutable
chmod +x backup.sh

# Tester le backup manuel
./backup.sh

# Ajouter au cron (backup quotidien à 2h du matin)
crontab -e

# Ajouter cette ligne:
0 2 * * * cd /opt/digital-business-cards && ./backup.sh >> /var/log/backup-business-cards.log 2>&1
```

### 7. Configuration du Firewall

```bash
# Activer UFW
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable

# Les ports 3000 et 5000 ne doivent PAS être ouverts car nginx gère tout
```

## Mises à Jour

### Pour mettre à jour l'application:

```bash
cd /opt/digital-business-cards

# Récupérer les modifications
git pull

# Reconstruire et redémarrer
docker compose down
docker compose up -d --build

# Vérifier les logs
docker compose logs -f
```

## Surveillance et Maintenance

### Vérifier l'état des containers

```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
```

### Vérifier l'espace disque

```bash
df -h
du -sh /opt/digital-business-cards/backend/uploads
du -sh /opt/digital-business-cards/backups
```

### Nettoyer les anciennes images Docker

```bash
docker system prune -a
```

## Restauration d'un Backup

En cas de problème:

```bash
cd /opt/digital-business-cards

# Arrêter le backend
docker compose stop backend

# Restaurer la base de données
gunzip -c backups/backup_2024-01-15_02-00-00.sql.gz | \
    docker exec -i business_cards_db psql -U admin -d business_cards

# Redémarrer
docker compose start backend
```

## Renouvellement SSL (Automatique)

Certbot configure automatiquement un cron pour renouveler les certificats.

Vérifier:
```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

## Troubleshooting

### L'application n'est pas accessible

1. Vérifier nginx: `sudo nginx -t && sudo systemctl status nginx`
2. Vérifier les containers: `docker compose ps`
3. Vérifier les logs: `docker compose logs`
4. Vérifier le firewall: `sudo ufw status`

### Erreur 502 Bad Gateway

- Les containers ne sont pas démarrés: `docker compose up -d`
- Problème de proxy dans nginx: vérifier la config et les ports

### Certificat SSL ne se renouvelle pas

```bash
sudo certbot renew --dry-run
sudo systemctl restart certbot.timer
```

## Sécurité Supplémentaire (Optionnel)

### Fail2ban pour protéger SSH

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Limiter les tentatives de login

Ajoutez dans `/etc/nginx/sites-available/business-cards` (dans le bloc `location /api`):

```nginx
# Limite les requêtes vers l'API login
location /api/auth/login {
    limit_req zone=login burst=5 nodelay;
    proxy_pass http://127.0.0.1:5000;
    # ... autres directives proxy
}
```

Et ajoutez dans la section `http` de `/etc/nginx/nginx.conf`:

```nginx
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
```

## Résumé des URLs

- **Frontend public**: https://votre-domaine.com
- **Cartes de visite**: https://votre-domaine.com/card/{uuid}
- **Dashboard**: https://votre-domaine.com (puis login)
- **API**: https://votre-domaine.com/api

## Checklist de Déploiement

- [ ] Nom de domaine configuré (DNS pointant vers le VPS)
- [ ] `.env` créé avec des mots de passe forts
- [ ] `VITE_API_URL` configuré avec https://votre-domaine.com
- [ ] docker-compose.yml modifié (ports en 127.0.0.1)
- [ ] nginx installé et configuré
- [ ] Certificat SSL obtenu avec Certbot
- [ ] Firewall configuré (22, 80, 443 uniquement)
- [ ] Containers lancés et opérationnels
- [ ] Backup cron configuré
- [ ] Test complet: création de carte, affichage public, stats

## Support

En cas de problème:
1. Consultez les logs: `docker compose logs`
2. Vérifiez nginx: `sudo nginx -t`
3. Vérifiez le firewall: `sudo ufw status`
4. Vérifiez DNS: `dig votre-domaine.com`
