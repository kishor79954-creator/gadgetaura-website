-- Enable RLS for product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to product_categories
CREATE POLICY "Allow public read access to product_categories" ON public.product_categories
FOR SELECT USING (true);

-- Allow admin insert to product_categories (using JWT email claim)
CREATE POLICY "Allow admin insert to product_categories" ON public.product_categories
FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'email') = 'kishor79954@gmail.com'
);

-- Allow admin update to product_categories (using JWT email claim)
CREATE POLICY "Allow admin update to product_categories" ON public.product_categories
FOR UPDATE USING (
    (auth.jwt() ->> 'email') = 'kishor79954@gmail.com'
) WITH CHECK (
    (auth.jwt() ->> 'email') = 'kishor79954@gmail.com'
);

-- Allow admin delete to product_categories (using JWT email claim)
CREATE POLICY "Allow admin delete to product_categories" ON public.product_categories
FOR DELETE USING (
    (auth.jwt() ->> 'email') = 'kishor79954@gmail.com'
);
