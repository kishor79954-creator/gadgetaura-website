-- Add columns for Scarcity and Social Proof features
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE;

-- Update some random products to be trending or have low stock for demonstration
UPDATE products SET is_trending = true WHERE id IN (1, 4, 7);
UPDATE products SET stock_count = 3 WHERE id IN (2, 5, 8);
UPDATE products SET stock_count = 0 WHERE id = 3;
