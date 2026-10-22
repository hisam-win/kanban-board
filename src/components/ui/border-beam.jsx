import { motion } from 'framer-motion'
import { cn } from '../../lib/utils.js'

export function BorderBeam({
  className,
  size = 95,
  delay = 0,
  duration = 6,
  colorFrom = '#ffcf5e',
  colorTo = '#f59e0b',
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1.5,
  particleCount = 56,
  particleSize = 3,
}) {
  // Golden-angle spiral = even deterministic scatter (no hydration mismatch)
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

  const particles = Array.from({ length: particleCount }, (_, index) => {
    const t = particleCount <= 1 ? 0 : index / particleCount
    // ~14% sparkles, ~29% glows, rest fine dust (matches reference ratio)
    const type = index % 7 === 0 ? 'sparkle' : index % 3 === 0 ? 'glow' : 'dust'

    // Trail clusters behind the head: 0% (at head) -> ~ tail
    const trailLength = 14
    const jitter = ((index * 37) % 10) / 10 - 0.5
    const rawOffset = initialOffset - t * trailLength + jitter * 0.9
    // offsetDistance < 0% is invalid CSS and piles particles into a white blob —
    // clamp to [0, 100] so the trail compresses instead of breaking
    const offset = Math.min(100, Math.max(0, rawOffset))

    const angle = index * GOLDEN_ANGLE
    const radius =
      type === 'sparkle'
        ? 9 + ((index * 13) % 14)
        : type === 'glow'
          ? 8 + ((index * 29) % 24)
          : 4 + ((index * 17) % 28)
    const xBase = Math.cos(angle) * radius
    const yBase = Math.sin(angle) * radius - 4 // slight upward float
    const x = [0, xBase * 0.4, xBase, xBase * 1.35, xBase * 0.5]
    const y = [0, yBase * 0.4, yBase, yBase * 1.35, yBase * 0.5]

    const sizeValue =
      type === 'sparkle'
        ? 13 + ((index * 7) % 11)
        : type === 'glow'
          ? 5.5 + ((index * 5) % 5)
          : Math.max(1.5, particleSize * (0.7 + ((index * 11) % 10) / 10))

    return {
      key: `pixie-${type}-${index}`,
      type,
      offset,
      opacity:
        type === 'sparkle'
          ? [0, 0.2, 1, 0.85, 0]
          : type === 'glow'
            ? [0, 0.55, 0.3, 0.7, 0]
            : [0, 0.85, 0.4, 0.95, 0],
      scale:
        type === 'sparkle'
          ? [0, 0.4, 1.2, 0.6, 0]
          : type === 'glow'
            ? [0.35, 0.9, 1.4, 1, 0.25]
            : [0.25, 1, 0.6, 1.3, 0.15],
      rotate: type === 'sparkle' ? [0, 45, 90, 135, 180] : [0, 0, 0, 0, 0],
      x,
      y,
      delay: index * 0.11 + (type === 'sparkle' ? 0.35 : 0),
      size: sizeValue,
      durationScale: type === 'dust' ? 0.62 + t * 0.25 : type === 'glow' ? 0.72 : 0.85,
    }
  })
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-beam-width) border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] mask-intersect [mask-clip:padding-box,border-box]"
      style={{
        '--border-beam-width': `${borderWidth}px`,
      }}
    >
      <motion.div
        className={cn('absolute aspect-square overflow-visible', className)}
        style={{
          width: size,
          height: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          background: `linear-gradient(to left, #fff3c4 0%, ${colorFrom} 30%, ${colorTo} 60%, transparent 100%)`,
          filter: 'blur(1px)',
          opacity: 1,
          boxShadow: `0 0 14px 2px ${colorTo}, 0 0 34px 8px ${colorTo}88`,
          borderRadius: 9999,
          ...style,
        }}
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration,
          delay: -delay,
          ...transition,
        }}
      />

      {particles.map((p) => {
        const { key, type, offset, opacity, scale, rotate, x, y } = p
        const particleDelay = p.delay
        const particleSizeValue = p.size
        const durationScale = p.durationScale
        if (type === 'sparkle') {
          return (
            <motion.div
              key={key}
              className="absolute left-1/2 top-1/2"
              style={{
                width: particleSizeValue,
                height: particleSizeValue,
                offsetPath: `rect(0 auto auto 0 round ${size}px)`,
                transform: 'translate(-50%, -50%)',
                opacity: 1,
                filter: `drop-shadow(0 0 5px ${colorTo}) drop-shadow(0 0 12px ${colorTo}aa)`,
              }}
              initial={{ offsetDistance: `${offset}%`, opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
              animate={{
                offsetDistance: reverse ? [`${100 - offset}%`, `${-offset}%`] : [`${offset}%`, `${100 + offset}%`],
                opacity, scale, x, y, rotate,
              }}
              transition={{ repeat: Infinity, ease: 'easeInOut', duration: duration * durationScale, delay: -(delay + particleDelay), times: [0, 0.28, 0.5, 0.74, 1] }}
            >
              <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none">
                <path
                  d="M12 1C12.8 7.5 14.4 9.7 21.5 11.2C22.3 11.4 22.3 12.6 21.5 12.8C14.4 14.3 12.8 16.5 12 23C11.6 23.8 10.4 23.8 10 23C9.2 16.5 7.6 14.3 0.5 12.8C-0.3 12.6 -0.3 11.4 0.5 11.2C7.6 9.7 9.2 7.5 10 1C10.4 0.2 11.6 0.2 12 1Z"
                  fill="#ffc93c"
                  stroke="#f59e0b"
                  strokeWidth="0.8"
                />
                <path d="M12 6C12.4 9.2 13.1 10.2 17 11C13.1 11.8 12.4 12.8 12 16C11.6 12.8 10.9 11.8 7 11C10.9 10.2 11.6 9.2 12 6Z" fill="#fff7d6" />
              </svg>
            </motion.div>
          )
        }
        const isGlow = type === 'glow'
        return (
          <motion.div
            key={key}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: particleSizeValue,
              height: particleSizeValue,
              offsetPath: `rect(0 auto auto 0 round ${size}px)`,
              background: isGlow
                ? `radial-gradient(circle, #fff3c4 0%, ${colorFrom} 35%, ${colorTo} 65%, transparent 100%)`
                : `radial-gradient(circle, #fff3c4 0%, ${colorFrom} 40%, ${colorTo} 72%, transparent 100%)`,
              boxShadow: `0 0 10px 1px ${colorTo}, 0 0 20px 3px ${colorTo}88`,
              transform: 'translate(-50%, -50%)',
              filter: isGlow ? 'blur(0.7px)' : 'blur(0px)',
            }}
          initial={{
            offsetDistance: `${offset}%`,
            opacity: 0,
            scale: 0.25,
            x: 0,
            y: 0,
          }}
          animate={{
            offsetDistance: reverse
              ? [`${100 - offset}%`, `${-offset}%`]
              : [`${offset}%`, `${100 + offset}%`],
            opacity,
            scale,
            x,
            y,
          }}
          transition={{
            repeat: Infinity,
            ease: 'easeInOut',
            duration: duration * durationScale,
            delay: -(delay + particleDelay),
            times: [0, 0.22, 0.48, 0.76, 1],
          }}
        />
        )
      })}
    </div>
  )
}
