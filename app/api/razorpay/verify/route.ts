import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      supabase_order_id,
      payment_method // "UPI" or "COD"
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !supabase_order_id) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
        throw new Error("Razorpay secret not configured")
    }

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid Payment Signature' },
        { status: 400 }
      );
    }

    // Update the Supabase order status
    // Using our security definer RPC since standard updates require an admin role in RLS
    const newStatus = payment_method === 'COD' ? 'cod_advance_paid' : 'paid';

    const { error } = await supabase.rpc('update_order_payment', {
      _order_id: supabase_order_id,
      _rzp_order_id: razorpay_order_id,
      _rzp_payment_id: razorpay_payment_id,
      _rzp_signature: razorpay_signature,
      _status: newStatus
    });

    if (error) {
       console.error("Failed to update order status:", error);
       // We still return 200 because the payment was successful with Razorpay,
       // but we should probably log this critical error.
       throw error;
    }

    return NextResponse.json({ success: true, status: newStatus }, { status: 200 });
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { error: 'Payment verification failed', details: error.message },
      { status: 500 }
    );
  }
}
