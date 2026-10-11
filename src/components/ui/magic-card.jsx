import { useCallback, useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from 'framer-motion'

import { cn } from '../../lib/utils.js'

/**
 * Replacement for Magic UI's `next-themes` dependency: derives dark mode
 * from this app's own vibe classes on <html> (.dark and .vaporwave are
 * the dark palettes). Watches for class changes so the orb blend mode
 * follows vibe switches live.
 */
function useVibeIsDark() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return true
    const classes = document.documentElement.classList
    return classes.contains('dark') || classes.contains('vaporwave')
  })

  useEffect(() => {
    const root = document.documentElement
    const update = () => {
      setIsDark(
        root.classList.contains('dark') || root.classList.contains('vaporwave'),
      )
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return isDark
}

export function MagicCard(props) {
  const {
    children,
    className,
    gradientSize = 200,
    gradientColor = '#262626',
    gradientOpacity = 0.8,
    gradientFrom = '#9E7AFF',
    gradientTo = '#FE8BBB',
    mode = 'gradient',
  } = props

  const glowFrom = mode === 'orb' ? (props.glowFrom ?? '#ee4f27') : '#ee4f27'
  const glowTo = mode === 'orb' ? (props.glowTo ?? '#6b21ef') : '#6b21ef'
  const glowAngle = mode === 'orb' ? (props.glowAngle ?? 90) : 90
  const glowSize = mode === 'orb' ? (props.glowSize ?? 420) : 420
  const glowBlur = mode === 'orb' ? (props.glowBlur ?? 60) : 60
  const glowOpacity = mode === 'orb' ? (props.glowOpacity ?? 0.9) : 0.9
  const isDarkTheme = useVibeIsDark()

  const mouseX = useMotionValue(-gradientSize)
  const mouseY = useMotionValue(-gradientSize)

  const orbX = useSpring(mouseX, { stiffness: 250, damping: 30, mass: 0.6 })
  const orbY = useSpring(mouseY, { stiffness: 250, damping: 30, mass: 0.6 })
  const orbVisible = useSpring(0, { stiffness: 300, damping: 35 })

  const modeRef = useRef(mode)
  const glowOpacityRef = useRef(glowOpacity)
  const gradientSizeRef = useRef(gradientSize)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    glowOpacityRef.current = glowOpacity
  }, [glowOpacity])

  useEffect(() => {
    gradientSizeRef.current = gradientSize
  }, [gradientSize])

  const reset = useCallback(
    (reason = 'leave') => {
      const currentMode = modeRef.current

      if (currentMode === 'orb') {
        if (reason === 'enter') orbVisible.set(glowOpacityRef.current)
        else orbVisible.set(0)
        return
      }

      const off = -gradientSizeRef.current
      mouseX.set(off)
      mouseY.set(off)
    },
    [mouseX, mouseY, orbVisible],
  )

  const handlePointerMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    },
    [mouseX, mouseY],
  )

  useEffect(() => {
    reset('init')
  }, [reset])

  useEffect(() => {
    const handleGlobalPointerOut = (e) => {
      if (!e.relatedTarget) reset('global')
    }
    const handleBlur = () => reset('global')
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') reset('global')
    }

    window.addEventListener('pointerout', handleGlobalPointerOut)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('pointerout', handleGlobalPointerOut)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [reset])

  // Adapted to this app's tokens: the padding-box layer paints the card
  // surface (--color-card) instead of upstream's --color-background.
  const containerBackground = useMotionTemplate`
    linear-gradient(var(--color-card) 0 0) padding-box,
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientFrom},
      ${gradientTo},
      var(--color-border) 100%
    ) border-box
  `

  const spotlightBackground = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientColor},
      transparent 100%
    )
  `

  return (
    <motion.div
      className={cn(
        'group relative isolate overflow-hidden rounded-[inherit] border border-transparent',
        className,
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => reset('leave')}
      onPointerEnter={() => reset('enter')}
      style={{
        background: containerBackground,
      }}
    >
      <div className="absolute inset-px z-20 rounded-[inherit] bg-card" />

      {mode === 'gradient' && (
        <motion.div
          className="pointer-events-none absolute inset-px z-30 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: spotlightBackground,
            opacity: gradientOpacity,
          }}
        />
      )}

      {mode === 'orb' && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute z-30"
          style={{
            width: glowSize,
            height: glowSize,
            x: orbX,
            y: orbY,
            translateX: '-50%',
            translateY: '-50%',
            borderRadius: 9999,
            filter: `blur(${glowBlur}px)`,
            opacity: orbVisible,
            background: `linear-gradient(${glowAngle}deg, ${glowFrom}, ${glowTo})`,

            mixBlendMode: isDarkTheme ? 'screen' : 'multiply',
            willChange: 'transform, opacity',
          }}
        />
      )}
      <div className="relative z-40">{children}</div>
    </motion.div>
  )
}
