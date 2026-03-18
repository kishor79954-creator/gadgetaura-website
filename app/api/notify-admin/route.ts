import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Fallback key prevents Next.js from crashing during the Vercel build phase
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_fallback_key');

export async function POST(req: Request) {
  try {
    const { orderId, customerName, customerEmail, totalAmount, items } = await req.json();

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail || !process.env.RESEND_API_KEY) {
       console.error("Email API keys not configured in env");
       // we don't return 500 here immediately in case they only want whatsapp, but for now we expect them
    }

    // 1. Prepare Email Promise
    const subject = `🚨 New Order Received! (ID: ${orderId})`;
    let itemsListHtml = '';
    if (items && Array.isArray(items)) {
        itemsListHtml = items.map((item: any) => `<li>${item.quantity}x ${item.product_name} - ₹${item.price}</li>`).join('');
    }

    let emailPromise: any = Promise.resolve();
    if (process.env.RESEND_API_KEY) {
      emailPromise = resend.emails.send({
        from: 'Acme <onboarding@resend.dev>', // Verified domain is required for production
        to: adminEmail || 'fallback@example.com',
        subject: subject,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #333;">New Order Alert 🛒</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Customer Name:</strong> ${customerName}</p>
            <p><strong>Customer Email:</strong> ${customerEmail}</p>
            <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
            ${itemsListHtml ? `<h3>Order Items:</h3><ul>${itemsListHtml}</ul>` : ''}
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
              Log in to your dashboard to view full details.
            </p>
          </div>
        `,
      });
    } else {
      console.warn("Email notification skipped: Missing RESEND_API_KEY environment variable.");
    }

    // 2. Prepare WhatsApp Promise (using Twilio as the easiest Developer implementation)
    // To activate this, the user needs to add these 3 variables to .env.local
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'
    const adminWhatsAppNumber = process.env.ADMIN_WHATSAPP_NUMBER; // e.g., 'whatsapp:+919876543210'

    let whatsappPromise = Promise.resolve(); // Resolves instantly if not configured
    
    if (twilioSid && twilioAuthToken && twilioWhatsAppNumber && adminWhatsAppNumber) {
        const whatsappMessage = `🚨 *New Order Alert*\n\n*Order ID:* ${orderId}\n*Customer:* ${customerName}\n*Amount:* ₹${totalAmount}\n\nCheck your dashboard for details.`;
        
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        
        whatsappPromise = fetch(twilioUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64')
            },
            body: new URLSearchParams({
                'To': adminWhatsAppNumber,
                'From': twilioWhatsAppNumber,
                'Body': whatsappMessage
            })
        }).then(res => res.json());
    } else {
        console.warn("WhatsApp notification skipped: Missing Twilio environment variables.");
    }

    // 3. Execute both notifications concurrently
    const [emailResult, whatsappResult] = await Promise.allSettled([emailPromise, whatsappPromise]);

    // Check if email failed
    if (emailResult.status === 'rejected' || (emailResult.status === 'fulfilled' && emailResult.value.error)) {
        console.error("Resend Email Error:", emailResult);
    }

    return NextResponse.json({ 
        success: true, 
        emailStatus: emailResult.status,
        whatsappStatus: whatsappResult.status 
    }, { status: 200 });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
