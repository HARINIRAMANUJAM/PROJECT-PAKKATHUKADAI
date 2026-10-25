
-- Pakkathu Kadai: feature columns
-- Run once in Supabase SQL Editor.

ALTER TABLE public."Orders"
ADD COLUMN IF NOT EXISTS delivery_method text
CHECK (
  delivery_method IS NULL
  OR delivery_method IN ('Pickup', 'Delivery')
);

ALTER TABLE public."Products"
ADD COLUMN IF NOT EXISTS expiry_date date;

CREATE INDEX IF NOT EXISTS idx_products_expiry_date
ON public."Products" (expiry_date)
WHERE expiry_date IS NOT NULL;
