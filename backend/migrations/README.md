# Database Migrations

This folder contains SQL migration scripts for the database schema.

## How to Run Migrations

### Manual Migration
```bash
docker exec -i business_cards_db psql -U admin -d business_cards < backend/migrations/001_add_phone_column.sql
```

### Check Migration Status
```bash
docker exec business_cards_db psql -U admin -d business_cards -c "\d cards"
```

## Migration History

- **001_add_phone_column.sql**: Adds phone field to cards table (2026-01-12)
