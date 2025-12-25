"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 500)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 opacity-10"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <div className="absolute top-1/4 left-0 w-96 h-48 bg-foreground rounded-full blur-[100px]" />
          </motion.div>

          <motion.div
            className="absolute inset-0 opacity-5"
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <div className="absolute top-1/2 right-0 w-[500px] h-64 bg-foreground rounded-full blur-[120px]" />
          </motion.div>

          <motion.div
            className="absolute inset-0 opacity-8"
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <div className="absolute bottom-1/3 left-1/3 w-80 h-56 bg-foreground rounded-full blur-[100px]" />
          </motion.div>

          {/* NOW Text */}
          <div className="relative z-10">
            <motion.div
              className="flex items-center justify-center text-[120px] sm:text-[180px] md:text-[240px] font-bold tracking-tighter"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {["N", "O", "W"].map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-block text-foreground"
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    textShadow: "0 0 40px rgba(0,0,0,0.1)",
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>

            <motion.div
              className="h-1 bg-foreground"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            />

            <motion.p
              className="mt-6 text-center text-lg sm:text-xl text-muted-foreground font-medium tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              Segurança Eletrônica Conectada
            </motion.p>
          </div>

          {/* Loading dots */}
          <div className="absolute bottom-24 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-foreground"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
