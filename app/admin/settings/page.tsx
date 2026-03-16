"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Store, Lock, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useState } from "react"
import Link from "next/link"

export default function AdminSettings() {
  const router = useRouter()
  const [storeName, setStoreName] = useState("Gadgetura")
  const [supportEmail, setSupportEmail] = useState("support@gadgetura.com")
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleSave = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      alert("Settings saved successfully!")
    }, 800)
  }

  return (
    <div className="text-white p-8 lg:p-14 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
          <Link href="/" target="_blank">View Live Store</Link>
        </Button>
      </div>

      <div className="space-y-8">

        {/* Store Profile Section */}
        <section className="bg-[#111] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
              <Store className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Store Profile</h2>
          </div>

          <div className="grid gap-6 max-w-xl">
            <div className="grid gap-2">
              <Label htmlFor="storeName" className="text-gray-400">Store Name</Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="bg-black text-white border-white/10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supportEmail" className="text-gray-400">Support Email</Label>
              <Input
                id="supportEmail"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="bg-black text-white border-white/10"
              />
            </div>
            <Button onClick={handleSave} disabled={loading} className="w-fit bg-white text-black hover:bg-gray-200">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </section>

        {/* Security / Account Section */}
        <section className="bg-[#111] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="font-bold">Admin Password</p>
                <p className="text-xs text-gray-400">Last changed 3 months ago</p>
              </div>
              <Button variant="outline" className="border-white/10 hover:bg-white/10 text-white">Change</Button>
            </div>

            <Separator className="bg-white/10 my-4" />

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </section>

      </div>
    </div>
  )
}
