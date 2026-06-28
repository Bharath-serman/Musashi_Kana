"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CinematicBackground() {
  const [particles, setParticles] = useState<{
    id: number;
    size: number;
    x: number;
    y: number;
    duration: number;
    delay: number;
    pathX: number[];
    pathY: number[];
    opacityPath: number[];
  }[]>([]);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const numParticles = 30;
    const newParticles = [];
    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        id: i,
        size: Math.random() * 6 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 15 + 10, // Slower for cinematic feel
        delay: Math.random() * 5,
        pathX: [0, (Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, 0],
        pathY: [0, (Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, 0],
        opacityPath: [0.2, Math.random() * 0.6 + 0.2, Math.random() * 0.4 + 0.1, 0.2]
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: 'transparent'
      }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'var(--blue)', 
            boxShadow: '0 0 10px var(--blue)',
            left: `${p.x}%`,
            top: `${p.y}%`,
            willChange: "transform, opacity"
          }}
          animate={{
            x: p.pathX,
            y: p.pathY,
            opacity: p.opacityPath,
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

