"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Zap, Lock, Camera, Wifi } from "lucide-react"

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true)
  const [currentIcon, setCurrentIcon] = useState(0)

  const securityIcons = [Shield, Zap, Lock, Camera, Wifi]

  useEffect(() => {
    // Rotate through security icons
    const iconInterval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % securityIcons.length)
    }, 800)

    // Complete splash screen
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 600)
    }, 3500)

    return () => {
      clearInterval(iconInterval)
      clearTimeout(timer)
    }
  }, [onComplete])

  const CurrentIcon = securityIcons[currentIcon]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Floating geometric shapes */}
            <motion.div
              className="absolute top-20 left-20 w-32 h-32 border border-primary/20 rounded-full"
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                scale: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
              }}
            />
            <motion.div
              className="absolute bottom-32 right-16 w-24 h-24 border border-primary/30 rounded-lg rotate-45"
              animate={{
                rotate: [45, 135, 45],
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: { duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                scale: { duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/4 w-16 h-16 border border-primary/25 rounded-full"
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center space-y-12">
            {/* Logo/Icon Section */}
            <motion.div
              className="relative"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 border-2 border-primary/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                style={{ width: '120px', height: '120px', margin: '-10px' }}
              />

              {/* Inner glow */}
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />

              {/* Main icon container */}
              <motion.div
                className="relative w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIcon}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <CurrentIcon className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Brand Text */}
            <motion.div
              className="text-center space-y-3"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <motion.h1
                className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
                initial={{ letterSpacing: "0.5em", opacity: 0 }}
                animate={{ letterSpacing: "0em", opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                NOW
              </motion.h1>

              <motion.p
                className="text-sm md:text-base text-muted-foreground font-medium tracking-wide"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                SEGURANÇA PROFISSIONAL
              </motion.p>
            </motion.div>

            {/* Progress indicator */}
            <motion.div
              className="flex space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/40"
                  animate={{
                    scale: i === currentIcon % 5 ? [1, 1.3, 1] : 1,
                    backgroundColor: i === currentIcon % 5 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.4)",
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>

            {/* Tagline */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <p className="text-xs text-muted-foreground tracking-widest uppercase">
                Sua segurança, nosso compromisso
              </p>
            </motion.div>
          </div>

          {/* Subtle bottom fade */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
