-- Add text_color column to hero_contents for customization of hero text color
ALTER TABLE hero_contents ADD COLUMN IF NOT EXISTS text_color text DEFAULT '#1A1A1A';

-- Update existing records to have default values if needed
UPDATE hero_contents SET text_color = '#1A1A1A' WHERE text_color IS NULL;
