import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'

const MAX_TILT_DEG = 12
const MAX_THROW_TILT_DEG = 22
const SCALE = 1.04
const FLY_SCALE = 1.08

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const lerp = (current: number, target: number, alpha: number) =>
  current + (target - current) * alpha

type DragPoint = {
  x: number
  y: number
  time: number
}

type Vec2 = { x: number; y: number }

type UseDragPhysicsOptions = {
  free?: boolean
  friction?: number
  bounce?: number
  throwThreshold?: number
  throwPower?: number
  /** Resting scale. Defaults to 1.04 (card pop). Pass 1 for modals/dialogs. */
  baseScale?: number
  /** Scale while dragging / flying. Defaults to 1.08. Pass 1.02 for modals. */
  flyScale?: number
  /** Element size used for viewport bounce bounds. Defaults to 280 x 140. */
  cardW?: number
  cardH?: number
}

type PointerLike = {
  clientX: number
  clientY: number
  pointerId?: number
  currentTarget?: {
    setPointerCapture?: (id: number) => void
    releasePointerCapture?: (id: number) => void
  }
}

const CARD_W = 280
const CARD_H = 140

export function useDragPhysics(options: UseDragPhysicsOptions = {}) {
  const {
    free = false,
    friction = 0.965,
    bounce = 0.72,
    throwThreshold = 450,
    throwPower = 1,
    baseScale = SCALE,
    flyScale = FLY_SCALE,
    cardW = CARD_W,
    cardH = CARD_H,
  } = options

  const activeRef = useRef(false)
  const lastPointRef = useRef<DragPoint | null>(null)
  const dragStartRef = useRef<DragPoint | null>(null)
  const originOffsetRef = useRef<Vec2>({ x: 0, y: 0 })
  const velocityRef = useRef<Vec2>({ x: 0, y: 0 })
  const offsetRef = useRef<Vec2>({ x: 0, y: 0 })
  const rotationRef = useRef(0)
  const targetRotationRef = useRef(0)
  const scaleRef = useRef(baseScale)
  const targetScaleRef = useRef(baseScale)
  const flyingRef = useRef(false)
  const flyRafRef = useRef<number | null>(null)
  const tiltRafRef = useRef<number | null>(null)
  const lastFlyTimeRef = useRef(0)

  const [style, setStyle] = useState<CSSProperties>({
    transform: `translate3d(0px, 0px, 0) rotate(0deg) scale(${baseScale})`,
    willChange: 'transform',
    transformOrigin: 'center center',
  })
  const [offset, setOffset] = useState<Vec2>({ x: 0, y: 0 })
  const [velocity, setVelocity] = useState<Vec2>({ x: 0, y: 0 })
  const [isFlying, setIsFlying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const render = useCallback(() => {
    const o = offsetRef.current
    const r = rotationRef.current
    const s = scaleRef.current
    setOffset({ ...o })
    setStyle({
      transform: `translate3d(${o.x.toFixed(1)}px, ${o.y.toFixed(1)}px, 0) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(3)})`,
      willChange: 'transform',
      transformOrigin: 'center center',
    })
  }, [])

  // --- tilt loop (smooth rotation + scale) ---
  const updateTilt = useCallback(() => {
    rotationRef.current = lerp(rotationRef.current, targetRotationRef.current, 0.18)
    scaleRef.current = lerp(scaleRef.current, targetScaleRef.current, 0.18)

    if (
      !activeRef.current &&
      !flyingRef.current &&
      Math.abs(rotationRef.current) < 0.08
    ) {
      rotationRef.current = 0
    }

    render()

    const needsAnimation =
      activeRef.current ||
      flyingRef.current ||
      Math.abs(targetRotationRef.current) > 0.05 ||
      Math.abs(rotationRef.current) > 0.05 ||
      Math.abs(targetScaleRef.current - scaleRef.current) > 0.001

    if (needsAnimation) {
      tiltRafRef.current = requestAnimationFrame(updateTilt)
      return
    }
    tiltRafRef.current = null
  }, [render])

  const scheduleTilt = useCallback(() => {
    if (tiltRafRef.current === null) {
      tiltRafRef.current = requestAnimationFrame(updateTilt)
    }
  }, [updateTilt])

  const stopFly = useCallback(() => {
    flyingRef.current = false
    setIsFlying(false)
    if (flyRafRef.current !== null) {
      cancelAnimationFrame(flyRafRef.current)
      flyRafRef.current = null
    }
  }, [])

  // --- fling loop: integrate velocity, friction, viewport bounce ---
  const flyStep = useCallback(() => {
    const now = performance.now()
    const dt = Math.min(50, Math.max(8, now - lastFlyTimeRef.current)) / 1000
    lastFlyTimeRef.current = now

    const decay = Math.pow(friction, dt * 60)
    velocityRef.current.x *= decay
    velocityRef.current.y *= decay

    let nx = offsetRef.current.x + velocityRef.current.x * dt
    let ny = offsetRef.current.y + velocityRef.current.y * dt

    const pad = 12
    const minX = -window.innerWidth / 2 + cardW / 2 + pad
    const maxX = window.innerWidth / 2 - cardW / 2 - pad
    const minY = -window.innerHeight / 2 + cardH / 2 + pad
    const maxY = window.innerHeight / 2 - cardH / 2 - pad

    if (nx < minX) {
      nx = minX
      velocityRef.current.x = Math.abs(velocityRef.current.x) * bounce
    } else if (nx > maxX) {
      nx = maxX
      velocityRef.current.x = -Math.abs(velocityRef.current.x) * bounce
    }
    if (ny < minY) {
      ny = minY
      velocityRef.current.y = Math.abs(velocityRef.current.y) * bounce
    } else if (ny > maxY) {
      ny = maxY
      velocityRef.current.y = -Math.abs(velocityRef.current.y) * bounce
    }

    offsetRef.current = { x: nx, y: ny }
    setVelocity({ ...velocityRef.current })

    const tiltMax = free ? MAX_THROW_TILT_DEG : MAX_TILT_DEG
    targetRotationRef.current = clamp(
      (velocityRef.current.x / 1400) * tiltMax,
      -tiltMax,
      tiltMax,
    )
    scheduleTilt()
    render()

    const speed = Math.hypot(velocityRef.current.x, velocityRef.current.y)
    if (speed < 40) {
      stopFly()
      targetRotationRef.current = 0
      targetScaleRef.current = baseScale
      scheduleTilt()
      return
    }
    flyRafRef.current = requestAnimationFrame(flyStep)
  }, [baseScale, bounce, friction, free, render, scheduleTilt, stopFly])

  const startFly = useCallback(() => {
    stopFly()
    flyingRef.current = true
    setIsFlying(true)
    targetScaleRef.current = flyScale
    lastFlyTimeRef.current = performance.now()
    scheduleTilt()
    flyRafRef.current = requestAnimationFrame(flyStep)
  }, [flyScale, flyStep, scheduleTilt, stopFly])

  const stopPhysics = useCallback(() => {
    activeRef.current = false
    setIsDragging(false)
    lastPointRef.current = null
    dragStartRef.current = null
    targetRotationRef.current = 0
    targetScaleRef.current = baseScale
    setVelocity({ ...velocityRef.current })
    scheduleTilt()
  }, [baseScale, scheduleTilt])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement> | PointerLike) => {
      stopFly()
      activeRef.current = true
      setIsDragging(true)
      const now = performance.now()
      const pt = { x: event.clientX, y: event.clientY, time: now }
      lastPointRef.current = pt
      dragStartRef.current = pt
      originOffsetRef.current = { ...offsetRef.current }
      velocityRef.current = { x: 0, y: 0 }
      setVelocity({ x: 0, y: 0 })
      targetRotationRef.current = 0
      targetScaleRef.current = flyScale
      const pid =
        (event as ReactPointerEvent<HTMLElement>).pointerId ??
        (event as PointerLike).pointerId
      const target =
        (event as ReactPointerEvent<HTMLElement>).currentTarget ??
        (event as PointerLike).currentTarget
      if (pid !== undefined) {
        try {
          target?.setPointerCapture?.(pid)
        } catch {
          /* pointer already released */
        }
      }
      scheduleTilt()
    },
    [flyScale, scheduleTilt, stopFly],
  )

  const onPointerMove = useCallback(
    (event: { clientX: number; clientY: number }) => {
      if (!activeRef.current || !lastPointRef.current) return

      const now = performance.now()
      const last = lastPointRef.current
      const dt = Math.max(16, now - last.time)
      const ivx = ((event.clientX - last.x) / dt) * 1000
      const ivy = ((event.clientY - last.y) / dt) * 1000

      // Smooth velocity so throws feel stable, not jittery.
      velocityRef.current = {
        x: velocityRef.current.x * 0.75 + ivx * 0.25,
        y: velocityRef.current.y * 0.75 + ivy * 0.25,
      }
      setVelocity({ ...velocityRef.current })

      const tiltMax = free ? MAX_THROW_TILT_DEG : MAX_TILT_DEG
      targetRotationRef.current = clamp(
        (velocityRef.current.x / 1000) * tiltMax,
        -tiltMax,
        tiltMax,
      )

      if (free && dragStartRef.current) {
        offsetRef.current = {
          x: originOffsetRef.current.x + (event.clientX - dragStartRef.current.x),
          y: originOffsetRef.current.y + (event.clientY - dragStartRef.current.y),
        }
      }

      lastPointRef.current = { x: event.clientX, y: event.clientY, time: now }
      scheduleTilt()
      render()
    },
    [free, render, scheduleTilt],
  )

  const onPointerUp = useCallback(
    (event?: {
      pointerId?: number
      currentTarget?: { releasePointerCapture?: (id: number) => void }
    }) => {
      const pid = event?.pointerId
      if (pid !== undefined) {
        try {
          event?.currentTarget?.releasePointerCapture?.(pid)
        } catch {
          /* already released */
        }
      }
      const speed = Math.hypot(velocityRef.current.x, velocityRef.current.y)
      const wasFree = free
      stopPhysics()

      // Throw! Keep flying with momentum + bounce.
      if (wasFree && speed > throwThreshold) {
        velocityRef.current = {
          x: velocityRef.current.x * throwPower,
          y: velocityRef.current.y * throwPower,
        }
        startFly()
      } else if (!wasFree && speed > throwThreshold) {
        targetRotationRef.current = clamp(
          targetRotationRef.current * 1.4,
          -MAX_TILT_DEG,
          MAX_TILT_DEG,
        )
        scheduleTilt()
      }
    },
    [free, scheduleTilt, startFly, stopPhysics, throwPower, throwThreshold],
  )

  const throwWithVelocity = useCallback(
    (vx: number, vy: number) => {
      velocityRef.current = { x: vx * throwPower, y: vy * throwPower }
      setVelocity({ ...velocityRef.current })
      if (Math.hypot(vx, vy) > throwThreshold) startFly()
    },
    [startFly, throwPower, throwThreshold],
  )

  useEffect(() => {
    return () => {
      if (tiltRafRef.current !== null) cancelAnimationFrame(tiltRafRef.current)
      if (flyRafRef.current !== null) cancelAnimationFrame(flyRafRef.current)
    }
  }, [])

  // Reset position / velocity / tilt — handy for dialogs that should
  // re-center every time they open.
  const reset = useCallback(() => {
    stopFly()
    activeRef.current = false
    setIsDragging(false)
    lastPointRef.current = null
    dragStartRef.current = null
    originOffsetRef.current = { x: 0, y: 0 }
    velocityRef.current = { x: 0, y: 0 }
    offsetRef.current = { x: 0, y: 0 }
    rotationRef.current = 0
    targetRotationRef.current = 0
    scaleRef.current = baseScale
    targetScaleRef.current = baseScale
    setVelocity({ x: 0, y: 0 })
    render()
    scheduleTilt()
  }, [baseScale, render, scheduleTilt, stopFly])

  // JSX-friendly spread: <div {...drag.dragHandlers} style={drag.style} />
  // Covers the cases where motion wrappers swallow pointer capture —
  // by forwarding raw clientX/clientY we also survive event pooling.
  const dragHandlers = {
    onPointerDown,
    onPointerMove: (event) =>
      onPointerMove({ clientX: event.clientX, clientY: event.clientY }),
    onPointerUp,
    onPointerCancel: () => onPointerUp(),
  }

  return {
    style,
    offset,
    velocity,
    speed: Math.hypot(velocity.x, velocity.y),
    isDragging,
    isFlying,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    throwWithVelocity,
    stopPhysics,
    reset,
    dragHandlers,
  }
}
