-- Add Razorpay payment tracking columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Create security definer function to update order payment status securely
-- This allows the server (using anon key) to update the order status post verification.
CREATE OR REPLACE FUNCTION update_order_payment(_order_id UUID, _rzp_order_id TEXT, _rzp_payment_id TEXT, _rzp_signature TEXT, _status TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.orders
  SET 
    razorpay_order_id = _rzp_order_id,
    razorpay_payment_id = _rzp_payment_id,
    razorpay_signature = _rzp_signature,
    status = _status,
    updated_at = now()
  WHERE id = _order_id;
END;
$$;
