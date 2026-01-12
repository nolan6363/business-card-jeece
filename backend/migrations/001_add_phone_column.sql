-- Migration: Add phone column to cards table
-- Date: 2026-01-12
-- Description: Adds optional phone field to business cards

ALTER TABLE cards ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Optional: Add an index if you plan to search by phone
-- CREATE INDEX idx_cards_phone ON cards(phone);
