"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

type ConfettiProps = {
  show: boolean;
  intensity?: number;
};

const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
];

export function Confetti({ show, intensity = 50 }: ConfettiProps) {
  const [height, setHeight] = React.useState(1000);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setHeight(window.innerHeight);
      const handleResize = () => setHeight(window.innerHeight);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const confettiPieces = React.useMemo(
    () =>
      Array.from({ length: intensity }, (_, i) => ({
        id: i,
        color: colors[i % colors.length],
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        rotation: 360 * (Math.random() > 0.5 ? 1 : -1),
      })),
    [intensity]
  );

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {confettiPieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute h-2 w-2 rounded-sm"
              style={{
                backgroundColor: piece.color,
                left: `${piece.left}%`,
                top: "-10px",
              }}
              initial={{
                y: 0,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: height + 100,
                rotate: piece.rotation,
                opacity: [1, 1, 0],
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
