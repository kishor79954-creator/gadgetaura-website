export default function ShippingPolicy() {
    return (
        <main className="min-h-screen pt-32 pb-24 px-4 md:px-6 text-foreground bg-background">
            <div className="max-w-3xl mx-auto prose prose-invert">
                <h1 className="text-4xl font-serif font-bold text-primary mb-8">Shipping Policy</h1>

                <h2>Order Processing Times</h2>
                <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days.</p>

                <h2>Shipping Rates & Delivery Estimates</h2>
                <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
                <ul>
                    <li><strong>Standard Shipping:</strong> Free for all orders. Delivery takes 3-5 business days.</li>
                    <li><strong>Express Shipping:</strong> Available at checkout. Delivery takes 1-2 business days.</li>
                </ul>

                <h2>Shipment Confirmation & Order Tracking</h2>
                <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>

                <h2>Customs, Duties and Taxes</h2>
                <p>Gadgetaura is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).</p>

                <h2>Damages</h2>
                <p>Gadgetaura is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim.</p>

                <p className="mt-8 text-sm text-muted-foreground">Last updated: February 2026</p>
            </div>
        </main>
    )
}
