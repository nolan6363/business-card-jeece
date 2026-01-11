#!/bin/bash

# Digital Business Cards Database Backup Script
# This script backs up the PostgreSQL database and keeps the last 30 days of backups

# Configuration
CONTAINER_NAME="business_cards_db"
DB_NAME="business_cards"
DB_USER="admin"
BACKUP_DIR="./backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${DATE}.sql"
RETENTION_DAYS=30

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting database backup...${NC}"

# Check if container is running
if ! docker ps | grep -q "${CONTAINER_NAME}"; then
    echo -e "${RED}Error: Container ${CONTAINER_NAME} is not running!${NC}"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Perform backup
if docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" > "${BACKUP_FILE}"; then
    echo -e "${GREEN}Backup successful: ${BACKUP_FILE}${NC}"

    # Compress backup
    gzip "${BACKUP_FILE}"
    echo -e "${GREEN}Backup compressed: ${BACKUP_FILE}.gz${NC}"

    # Calculate backup size
    SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo -e "${GREEN}Backup size: ${SIZE}${NC}"
else
    echo -e "${RED}Backup failed!${NC}"
    exit 1
fi

# Remove old backups (older than RETENTION_DAYS)
echo -e "${YELLOW}Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
find "${BACKUP_DIR}" -name "backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
echo -e "${GREEN}Cleanup complete${NC}"

# List recent backups
echo -e "${YELLOW}Recent backups:${NC}"
ls -lh "${BACKUP_DIR}"/backup_*.sql.gz | tail -5

echo -e "${GREEN}Backup process completed successfully!${NC}"
