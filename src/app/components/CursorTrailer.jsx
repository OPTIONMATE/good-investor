"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CursorTrailer() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const smoothX = useSpring(x, { stiffness: 150, damping: 20, mass: 0.6 });
  const smoothY = useSpring(y, { stiffness: 150, damping: 20, mass: 0.6 });

  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState([]);
  const particleId = useRef(0);
  const hoverCheckRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);

      // Throttle hover check (~10fps)
      const now = performance.now();
      if (now - hoverCheckRef.current > 100) {
        hoverCheckRef.current = now;

        const el = document.elementFromPoint(e.clientX, e.clientY);
        const interactive =
          el?.closest("button, a, [role='button']") ||
          (el && window.getComputedStyle(el)?.cursor === "pointer");

        setIsHovering(Boolean(interactive));
      }

      // More particles
      if (Math.random() > 0.75) {
        const id = particleId.current++;

        setParticles((p) => [...p, { id, x: e.clientX, y: e.clientY }]);

        setTimeout(() => {
          setParticles((p) => p.filter((pt) => pt.id !== id));
        }, 500);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="pointer-events-none fixed z-50 rounded-full bg-[#A78BFA]"
        style={{
          x: smoothX,
          y: smoothY,
          width: isHovering ? 36 : 14,
          height: isHovering ? 36 : 14,
          marginLeft: isHovering ? -18 : -6,
          marginTop: isHovering ? -18 : -6,
          opacity: isHovering ? 0.35 : 0.85,
        }}
      />

      {/* Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="pointer-events-none fixed z-40 w-2 h-2 rounded-full bg-[#A78BFA]"
          initial={{ x: p.x - 4, y: p.y - 4, opacity: 0.7, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </>
  );
}
