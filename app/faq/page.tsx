import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQPage() {
    return (
        <main className="min-h-screen pt-32 pb-24 px-4 md:px-6 text-foreground bg-background">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-serif font-bold text-primary mb-4 text-center">Frequently Asked Questions</h1>
                <p className="text-muted-foreground text-center mb-12">Answers to common questions about our products, shipping, and policies.</p>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>How long does shipping take?</AccordionTrigger>
                        <AccordionContent>
                            Standard shipping takes 3-5 business days. Express shipping is available at checkout for 1-2 business day delivery.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                        <AccordionTrigger>Do you offer an international warranty?</AccordionTrigger>
                        <AccordionContent>
                            Yes, all our electronics and premium watches come with a standard 1-year international manufacturer's warranty covering manufacturing defects.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                        <AccordionTrigger>Can I change my order after placing it?</AccordionTrigger>
                        <AccordionContent>
                            We process orders quickly, but if you contact our support team within 2 hours of placing your order, we will do our best to accommodate any changes.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4">
                        <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                        <AccordionContent>
                            We accept all major credit cards (Visa, MasterCard, Amex), PayPal, Apple Pay, and Google Pay.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5">
                        <AccordionTrigger>How do I return an item?</AccordionTrigger>
                        <AccordionContent>
                            Please refer to our Refund Policy for detailed instructions. You can initiate a return within 7 days of receiving your item by contacting customersupport@gadgetaura.in.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </main>
    )
}
