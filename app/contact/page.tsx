"use client"

import { useState } from "react"
import { Mail, MapPin, Clock, MessageCircle, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        alert("Something went wrong. Please email us directly at customersupport@gadgetaura.in")
      }
    } catch {
      alert("Something went wrong. Please email us directly at customersupport@gadgetaura.in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-12 pb-24 px-4 md:px-6 text-foreground bg-background">
      {/* JSON-LD for Google — phone hidden from visual display */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "GadgetAura",
            url: "https://www.gadgetaura.in",
            email: "customersupport@gadgetaura.in",
            telephone: "+917995473593",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Hyderabad",
              addressRegion: "Telangana",
              addressCountry: "IN",
            },
            openingHours: "Mo-Sa 10:00-19:00",
          }),
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-primary text-xs uppercase tracking-[0.4em] mb-3 font-bold">We're Here to Help</p>
          <h1 className="text-5xl font-serif font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-base">
            Have a question about your order or our products? Send us a message and we'll get back to you within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* LEFT — Info Cards */}
          <div className="lg:col-span-2 space-y-6">

            <div className="bg-card border border-border rounded-2xl p-6 flex items-start gap-4 hover:border-primary/30 transition-colors">
              <div className="p-3 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-2">For orders, returns &amp; general queries</p>
                <a
                  href="mailto:customersupport@gadgetaura.in"
                  className="text-primary font-medium text-sm hover:underline break-all"
                >
                  customersupport@gadgetaura.in
                </a>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 flex items-start gap-4 hover:border-primary/30 transition-colors">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-500 flex-shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">WhatsApp Support</h3>
                <p className="text-sm text-muted-foreground mb-2">Quick responses on WhatsApp</p>
                <a
                  href="https://wa.me/917995473593"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors px-4 py-2 rounded-full"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 flex items-start gap-4 hover:border-primary/30 transition-colors">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Our Location</h3>
                <p className="text-sm text-muted-foreground">Hyderabad, Telangana, India</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 flex items-start gap-4 hover:border-primary/30 transition-colors">
              <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500 flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Support Hours</h3>
                <p className="text-sm text-muted-foreground">Monday – Saturday</p>
                <p className="text-sm font-medium text-foreground">10:00 AM – 7:00 PM IST</p>
              </div>
            </div>

          </div>

          {/* RIGHT — Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h2>
                  <p className="text-muted-foreground max-w-sm">
                    Thank you for reaching out. We'll get back to you at <strong>{formData.email}</strong> within 24 hours.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Send a Message</h2>
                  <p className="text-muted-foreground text-sm mb-8">Fill in the form below and we'll respond as soon as possible.</p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Your Name</Label>
                        <Input
                          id="contact-name"
                          placeholder="Rahul Sharma"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Email Address</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="rahul@example.com"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-subject">Subject</Label>
                      <Input
                        id="contact-subject"
                        placeholder="e.g. Order status, Return request..."
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-message">Message</Label>
                      <Textarea
                        id="contact-message"
                        placeholder="Describe your issue or question in detail..."
                        className="min-h-[160px] resize-none"
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 text-base font-semibold bg-primary text-black hover:bg-primary/90 transition-all"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-black/30 border-t-black rounded-full" />Sending...</span>
                      ) : (
                        <span className="flex items-center gap-2"><Send className="w-4 h-4" />Send Message</span>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
