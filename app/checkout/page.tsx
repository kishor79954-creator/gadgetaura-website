"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { ArrowLeft, ShieldCheck, CreditCard, Truck } from "lucide-react"

// ✅ Correct Imports
import { useCart } from "@/app/context/Cart-Context"
import { useAuth } from "@/app/context/AuthContext"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function CheckoutPage() {
  const { items, totalPrice } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const COD_ADVANCE = 99
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD">("UPI")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Contact State
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // Address State
  const [hno, setHno] = useState("")
  const [area, setArea] = useState("")
  const [landmark, setLandmark] = useState("")
  const [city, setCity] = useState("")
  const [stateName, setStateName] = useState("")
  const [pincode, setPincode] = useState("")

  // --- AUTH GUARD --- //
  useEffect(() => {
    if (user === null) {
      router.push("/auth?redirect=/checkout")
    }
  }, [user, router])

  // Calculations
  const payNow = paymentMethod === "UPI" ? totalPrice : COD_ADVANCE
  const payOnDelivery = paymentMethod === "COD" ? totalPrice - COD_ADVANCE : 0

  if (user === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">Loading checkout...</p>
        </div>
      </main>
    )
  }
  // ------------------ //

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) return alert("Cart is empty!")
    if (pincode.length !== 6) return alert("Pincode must be exactly 6 digits.")

    setIsSubmitting(true)

    try {
      // 1. Prepare Address Object
      const addressPayload = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        hno,
        area,
        landmark: landmark || null,
        city,
        state: stateName,
        pincode,
        formatted: `${hno}, ${area}, ${city}, ${stateName} - ${pincode}`,
      }

      // 2. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{
          user_id: user?.id || null, // ✅ LINK ORDER TO USER IF LOGGED IN
          customer_email: email,
          total_amount: totalPrice,
          status: "pending",
          payment_method: paymentMethod, // e.g. "UPI" or "COD"
          Address: addressPayload
        }])
        .select("id")
        .single()

      if (orderError) throw new Error("Order creation failed: " + orderError.message)

      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id || item.id, // Fallback for old carts
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
      if (itemsError) throw new Error("Items creation failed: " + itemsError.message)

      // 3. Init Razorpay Order on server
      const createRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: payNow,
          receipt: orderData.id,
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData.error || 'Failed to initialize payment');
      }

      // 4. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(payNow * 100), // convert INR to paise
        currency: "INR",
        name: "GadgetAura",
        description: paymentMethod === "COD" ? "Advance Payment for COD" : "Order Payment",
        order_id: createData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment on the server
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                supabase_order_id: orderData.id,
                payment_method: paymentMethod
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              // Now we dispatch Email Notification since payment is successful
              try {
                await fetch("/api/notify-admin", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                     orderId: orderData.id,
                     customerName: `${firstName} ${lastName}`,
                     customerEmail: email,
                     totalAmount: totalPrice,
                     items: orderItems,
                     paymentMethod: paymentMethod // pass payment info to email if needed
                  })
                });
              } catch (notifyErr) {
                console.error("Failed to notify admin, but order succeeded:", notifyErr);
              }

              // Success! Clear cart and redirect
              try {
                window.localStorage.removeItem("cart")
              } catch (e) {
                console.warn("localStorage is not available", e)
              }
              alert(`Order placed successfully! Order ID: ${orderData.id}`)
              
              router.push(`/orders`)
              setTimeout(() => window.location.reload(), 500)
            } else {
              alert("Payment verification failed. If money was deducted, please contact support.");
              router.push(`/orders`); // Send to orders page to see pending
            }
          } catch (err) {
            console.error(err);
            alert("An error occurred during payment verification.");
          } finally {
            setIsSubmitting(false) // Enable button again if they navigate back
          }
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        console.error("Payment Failed", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsSubmitting(false);
      });
      rzp1.open();

      // We do NOT set isSubmitting(false) here because the modal is open.
      // It will map to the handler or payment.failed event.

    } catch (err: any) {
      console.error(err)
      alert("Failed to place order: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <main className="pt-32 pb-24 px-4 md:px-6 min-h-screen text-foreground transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
        <Link href="/cart" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-12 font-serif">Secure Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* LEFT COLUMN: FORMS */}
          <div className="space-y-10">
            <section>
              <h2 className="font-bold mb-4 text-primary text-xl">Contact Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="First name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-card border-input h-12" />
                <Input placeholder="Last name" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-card border-input h-12" />
                <Input type="email" placeholder="Email" required className="col-span-2 bg-card border-input h-12" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input type="tel" placeholder="Mobile number" required className="col-span-2 bg-card border-input h-12" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </section>

            <section>
              <h2 className="font-bold mb-4 text-primary text-xl">Delivery Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="House / Flat / Building No." required className="col-span-2 bg-card border-input h-12" value={hno} onChange={(e) => setHno(e.target.value)} />
                <Input placeholder="Area / Locality" required className="col-span-2 bg-card border-input h-12" value={area} onChange={(e) => setArea(e.target.value)} />
                <Input placeholder="Landmark (Optional)" className="col-span-2 bg-card border-input h-12" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
                <Input placeholder="City" required value={city} onChange={(e) => setCity(e.target.value)} className="bg-card border-input h-12" />
                <Input placeholder="State" required value={stateName} onChange={(e) => setStateName(e.target.value)} className="bg-card border-input h-12" />
                <Input placeholder="Pincode" required maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value)} className="bg-card border-input h-12" />
              </div>
            </section>

            <section>
              <h2 className="font-bold mb-4 text-primary text-xl">Payment Method</h2>

              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`w-full p-5 rounded-xl border flex items-center gap-4 mb-4 transition-all ${paymentMethod === "UPI" ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                  }`}
              >
                <CreditCard className={`h-6 w-6 ${paymentMethod === "UPI" ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <p className="font-bold text-foreground">UPI / Online</p>
                  <p className="text-xs text-muted-foreground">Pay full amount now</p>
                </div>
                {paymentMethod === "UPI" && <ShieldCheck className="ml-auto text-green-600" />}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={`w-full p-5 rounded-xl border flex items-center gap-4 transition-all ${paymentMethod === "COD" ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                  }`}
              >
                <Truck className={`h-6 w-6 ${paymentMethod === "COD" ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <p className="font-bold text-foreground">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground">Pay ₹{COD_ADVANCE} advance to confirm</p>
                </div>
                {paymentMethod === "COD" && <ShieldCheck className="ml-auto text-green-600" />}
              </button>
            </section>
          </div>

          {/* RIGHT COLUMN: SUMMARY */}
          <div className="bg-card p-8 rounded-2xl border border-border h-fit sticky top-32 shadow-lg">
            <h2 className="font-bold mb-6 text-xl text-card-foreground">Order Summary</h2>

            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} <span className="text-xs text-muted-foreground/70">x{item.quantity}</span>
                  </span>
                  <span className="font-medium text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-bold text-foreground">₹{totalPrice.toLocaleString()}</span>
              </div>

              <div className="flex justify-between font-bold text-primary text-lg pt-2 border-t border-border">
                <span>Pay Now</span>
                <span>₹{payNow.toLocaleString()}</span>
              </div>

              {paymentMethod === "COD" && (
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Pay on Delivery</span>
                  <span>₹{payOnDelivery.toLocaleString()}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 py-7 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              {isSubmitting ? "Processing..." : paymentMethod === "UPI" ? "Pay & Place Order" : `Pay ₹${COD_ADVANCE} & Place Order`}
            </Button>

            <div className="mt-4 flex justify-center items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-3 h-3" /> Secure Checkout
            </div>
          </div>
        </form>
      </div>
    </main>
    </>
  )
}
