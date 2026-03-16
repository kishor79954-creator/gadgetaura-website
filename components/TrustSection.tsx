"use client"

import React, { useEffect, useState } from "react"

const products = [
  { id: 1, img: "/products/product1.png", color: "rgba(59, 130, 246, 0.5)" }, 
  { id: 2, img: "/products/product2.png", color: "rgba(234, 179, 8, 0.5)" },  
  { id: 3, img: "/products/product3.png", color: "rgba(236, 72, 153, 0.5)" }, 
  { id: 4, img: "/products/product4.png", color: "rgba(34, 197, 94, 0.5)" },  
  { id: 5, img: "/products/product5.png", color: "rgba(168, 85, 247, 0.5)" }, 
  { id: 6, img: "/products/product6.png", color: "rgba(239, 68, 68, 0.5)" },  
  { id: 7, img: "/products/product7.png", color: "rgba(59, 130, 246, 0.5)" }, 
  { id: 8, img: "/products/product8.png", color: "rgba(234, 179, 8, 0.5)" },  
]

export default function TrustSection() {
  const [sparkles, setSparkles] = useState<{ id: number; top: string; left: string; delay: string; duration: string; size: string }[]>([]);

  useEffect(() => {
    const newSparkles = Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${2 + Math.random() * 4}s`,
      size: Math.random() > 0.4 ? 'w-1 h-1' : 'w-0.5 h-0.5' 
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <section 
        className="relative w-full h-[800px] overflow-hidden bg-[#050505]" // Removed flex from here to avoid centering issues with absolute children
    >
      
      {/* 
         LAYER 1: BACKGROUND CONTAINER (Sparkles + Ambient)
         This is absolute and covers the entire section 100% x 100%.
      */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          
          {/* Ambient Purple Glow (Centered Background) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-violet-950/20 rounded-full blur-[120px]" />

          {/* Sparkles */}
          {sparkles.map((star) => (
              <div 
                key={star.id}
                className={`absolute bg-white rounded-full animate-twinkle ${star.size}`}
                style={{ 
                    top: star.top, 
                    left: star.left, 
                    animationDelay: star.delay,
                    animationDuration: star.duration,
                    boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)' 
                }}
              />
          ))}
      </div>

      {/* 
         LAYER 2: CONTENT CONTAINER (Logo + Products)
         This container uses Flexbox to center the actual content, 
         independent of the background layer.
      */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          
          {/* CENTRAL LOGO AREA */}
          <div className="relative flex items-center justify-center">
             {/* Purple Pulse */}
             <div className="absolute inset-0 bg-purple-600/30 blur-[70px] rounded-full animate-pulse-slow" />
             {/* Core Highlight */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-violet-400/10 blur-[40px] rounded-full" />
             {/* Logo */}
             <div className="relative w-44 h-44 md:w-72 md:h-72 flex items-center justify-center">
                <img 
                    src="/logo.png" 
                    alt="GadgetAura" 
                    className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                />
             </div>
          </div>

          {/* ORBIT CONTAINER */}
          <div 
            className="absolute top-1/2 left-1/2 rounded-full pointer-events-none" 
            style={{
                width: 'min(90vw, 600px)',
                height: 'min(90vw, 600px)',
                transform: 'translate(-50%, -50%)',
                animation: 'spin 40s linear infinite'
            }}
          >
            <style jsx>{`
                @keyframes spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                @keyframes counter-spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(-360deg); }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    50% { opacity: 1; transform: scale(1.5); box-shadow: 0 0 8px rgba(255, 255, 255, 1); }
                }
                .animate-twinkle {
                    animation-name: twinkle;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                }
            `}</style>
            
            {products.map((item, i) => {
              const angle = (i * 360) / products.length;

              return (
                <div
                    key={item.id}
                    className="absolute top-0 left-1/2 h-full w-0"
                    style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: 'bottom center',
                        height: '50%',
                        bottom: '50%'
                    }}
                >
                    <div 
                        className="absolute top-0 left-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-neutral-900/90 border border-white/5 shadow-2xl overflow-visible backdrop-blur-md"
                        style={{
                             transform: `translate(-50%, -50%)`, 
                             animation: 'counter-spin 40s linear infinite',
                             boxShadow: `0 0 35px ${item.color}`
                        }}
                    >
                        <div className="w-full h-full flex items-center justify-center relative z-10">
                             <img 
                                src={item.img} 
                                alt={`P${item.id}`} 
                                className="w-full h-full object-cover p-2 rounded-full transform transition-transform hover:scale-110 duration-300"
                            />
                        </div>
                    </div>
                </div>
              )
            })}
          </div>

      </div>
    </section>
  )
}
