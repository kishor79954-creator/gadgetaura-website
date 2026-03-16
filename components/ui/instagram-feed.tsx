"use client"

import { useEffect } from "react"

export function InstagramFeed() {
  useEffect(() => {
    // Load Instagram embed script safely
    if (!(window as any).instgrm) {
      const script = document.createElement("script")
      script.src = "https://www.instagram.com/embed.js"
      script.async = true
      document.body.appendChild(script)
    } else {
      ;(window as any).instgrm.Embeds.process()
    }
  }, [])

  return (
    <section className="bg-black py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* SECTION TITLE */}
        <h2 className="text-center text-yellow-500 text-xs uppercase tracking-[0.4em] mb-4 font-bold">
          Follow Us on Instagram
        </h2>

        <h3 className="text-center text-4xl md:text-5xl font-bold text-white mb-12">
          @_gadgetaura_
        </h3>

        {/* INSTAGRAM EMBED */}
        <div className="flex justify-center">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink="https://www.instagram.com/reel/DUNv0-Gj64Z/"
            data-instgrm-version="14"
            style={{
              background: "#000",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.1)",
              maxWidth: "420px",
              width: "100%",
            }}
          ></blockquote>
        </div>

      </div>
    </section>
  )
}
