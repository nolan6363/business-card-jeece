-- Digital Business Cards Database Schema
-- Initial database setup for PostgreSQL

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    photo_path VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
    id SERIAL PRIMARY KEY,
    card_id VARCHAR(36) NOT NULL,
    scanned_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_agent VARCHAR(500),
    device_type VARCHAR(50),
    CONSTRAINT scans_card_id_fkey FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scans_card_id ON scans(card_id);
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at);
CREATE INDEX IF NOT EXISTS idx_cards_is_active ON cards(is_active);

-- Optional: Add a phone index if needed for searching
-- CREATE INDEX IF NOT EXISTS idx_cards_phone ON cards(phone);

COMMENT ON TABLE cards IS 'Digital business cards';
COMMENT ON TABLE scans IS 'Card scan tracking for analytics';
COMMENT ON COLUMN cards.id IS 'UUID identifier for the card';
COMMENT ON COLUMN cards.phone IS 'Optional phone number';
COMMENT ON COLUMN scans.device_type IS 'iOS, Android, Desktop, or Unknown';
