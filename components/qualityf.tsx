"use client"

import React from "react"
// No icons needed if it auto-plays

export default function QualityFeature() {
  return (
    <section className="w-full bg-[#050505] py-20 flex flex-col items-center justify-center">
      
      {/* Header Text */}
      <div className="text-center mb-12 space-y-4">
        <h3 className="text-yellow-500 font-medium tracking-[0.2em] text-sm uppercase">
          Unrivaled Quality
        </h3>
        <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">
          Crafted for the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200">
            Next Generation
          </span>
        </h2>
      </div>

      {/* VIDEO CARD CONTAINER */}
      <div className="relative w-[90%] md:w-[80%] max-w-5xl aspect-video rounded-3xl overflow-hidden group border border-white/10 shadow-2xl">
        
        {/* 
            THE VIDEO TAG 
            - autoPlay: Starts automatically
            - loop: Plays forever
            - muted: Required for autoplay to work in most browsers
            - playsInline: Better behavior on mobile
        */}
        <video 
            className="w-full h-full object-cover"
            autoPlay 
            loop 
            muted 
            playsInline
            poster="/poster-image.jpg" // Optional: Image shown while video loads
        >
            <source src="/hero-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>

        {/* Optional: Dark Overlay to make text pop if you add any */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        
        {/* Optional: 'Quality' Badge in corner */}
        <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-white font-medium tracking-wide">4K PREVIEW</span>
        </div>

      </div>
    </section>
  )
}
