import { useEffect, useRef } from 'react'
import { useDragPhysics } from './hooks/useDragPhysics.ts'

function ThrowableCard({ task, onRelease, children }) {
  const {
    style,
    velocity,
    speed,
    isDragging,
    isFlying,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } = useDragPhysics({ free: true, throwPower: 190, throwFriction: 1.015 })

  const cardRef = useRef(null)

  const velocityRefSnapshot = useRef(velocity)
  velocityRefSnapshot.current = velocity

  // While dragging, track the pointer globally so fast flicks keep
  // velocity even if the cursor leaves the card.
  useEffect(() => {
    if (!isDragging) return undefined
    const handleMove = (event) => onPointerMove(event)
    const handleUp = (event) => {
      const dropClient = { x: event.clientX, y: event.clientY }
      const v = { ...velocityRefSnapshot.current }
      onPointerUp(event)
      onRelease?.({ task, velocity: v, dropClient })
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp, { once: true })
    window.addEventListener('pointercancel', handleUp, { once: true })
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging])

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      className={`touch-none select-none ${isDragging ? 'z-50 cursor-grabbing' : 'cursor-grab'} ${isFlying ? 'pointer-events-none z-50' : ''}`}
      style={{
        ...style,
        position: 'relative',
        filter:
          isDragging || isFlying
            ? 'drop-shadow(0 20px 30px rgba(59,130,246,.45))'
            : undefined,
      }}
      data-speed={Math.round(speed)}
    >
      {children}
      {(isDragging || isFlying) && speed > 450 && (
        <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white shadow">
          {Math.round(speed)} px/s
        </div>
      )}
    </div>
  )
}

export default ThrowableCard
