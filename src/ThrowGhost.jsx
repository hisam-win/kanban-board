import { useEffect, useRef, useState } from 'react'

/**
 * Ghost that flies from the drop point along the release velocity,
 * bounces off viewport edges with friction, then settles into the
 * column under its landing point.
 */
export default function ThrowGhost({ ghost, onLand }) {
  const [pos, setPos] = useState(() => ghost?.dropClient ?? { x: 0, y: 0 })
  const rafRef = useRef(null)

  useEffect(() => {
    if (!ghost) return undefined
    let p = { ...ghost.dropClient }
    let v = { ...ghost.velocity }
    let last = performance.now()

    const step = (now) => {
      const dt = Math.min(50, Math.max(8, now - last)) / 1000
      last = now
      const decay = Math.pow(0.96, dt * 60)
      v.x *= decay
      v.y *= decay
      p.x += v.x * dt
      p.y += v.y * dt
      const pad = 24
      if (p.x < pad) { p.x = pad; v.x = Math.abs(v.x) * 0.7 }
      if (p.x > window.innerWidth - pad) { p.x = window.innerWidth - pad; v.x = -Math.abs(v.x) * 0.7 }
      if (p.y < pad) { p.y = pad; v.y = Math.abs(v.y) * 0.7 }
      if (p.y > window.innerHeight - pad) { p.y = window.innerHeight - pad; v.y = -Math.abs(v.y) * 0.7 }
      setPos({ ...p })
      const speed = Math.hypot(v.x, v.y)
      if (speed < 80) {
        const el = document.elementFromPoint(p.x, p.y)
        const colEl = el?.closest?.('[data-column-id]')
        onLand({ taskId: ghost.task.id, columnId: colEl?.dataset?.columnId ?? null, point: { ...p } })
        return
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [ghost, onLand])

  if (!ghost) return null
  const tilt = Math.max(-22, Math.min(22, (ghost.velocity.x / 1400) * 22))
  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{
        transform: `translate3d(${pos.x - 140}px, ${pos.y - 60}px, 0) rotate(${tilt}deg) scale(1.08)`,
        width: 280,
      }}
    >
      <div className="rounded-lg bg-card p-4 shadow-2xl ring-2 ring-primary">
        <div className="text-base font-semibold text-text">{ghost.task.title}</div>
        <div className="mt-1 text-sm text-text-muted">{ghost.task.description}</div>
      </div>
    </div>
  )
}
