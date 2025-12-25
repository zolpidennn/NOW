-- Add slug column to service_categories table
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Update existing categories with slugs based on common names
UPDATE service_categories SET slug = 'cftv' WHERE name ILIKE '%cftv%' OR name ILIKE '%câmera%';
UPDATE service_categories SET slug = 'alarmes' WHERE name ILIKE '%alarme%';
UPDATE service_categories SET slug = 'automacao' WHERE name ILIKE '%automação%' OR name ILIKE '%automatização%' OR name ILIKE '%automacao%';
UPDATE service_categories SET slug = 'acesso' WHERE name ILIKE '%acesso%';
UPDATE service_categories SET slug = 'cerca' WHERE name ILIKE '%cerca%';
UPDATE service_categories SET slug = 'interfone' WHERE name ILIKE '%interfone%';

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);
