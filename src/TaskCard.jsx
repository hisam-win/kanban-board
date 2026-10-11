import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { BlurFade } from './components/ui/blur-fade.jsx'
import { MagicCard } from './components/ui/magic-card.jsx'

const TaskCard = forwardRef(function TaskCard(
  { task, onDelete, style, dragHandleProps },
  ref,
) {
  const titleDirection = ['left', 'right', 'up', 'down'][task.id.charCodeAt(task.id.length - 1) % 4]
  const descriptionDirection = ['up', 'down', 'left', 'right'][task.id.charCodeAt(0) % 4]

  return (
    <motion.li
      ref={ref}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="list-none"
    >
      <MagicCard
        gradientSize={180}
        gradientColor="rgb(var(--color-primary) / 0.14)"
        gradientOpacity={0.9}
        gradientFrom="rgb(var(--color-primary) / 0.55)"
        gradientTo="rgb(var(--color-secondary) / 0.55)"
        className="group rounded-lg shadow-md transition-shadow hover:shadow-lg"
      >
      {/* Gradient accent bar */}
      <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-secondary to-accent`} />

      <div className="flex items-start gap-3 p-4 pl-5">
        <span
          {...dragHandleProps}
          aria-label="Drag task"
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-1 text-text-muted transition-all hover:bg-surface hover:text-text active:cursor-grabbing"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M7 2a2 2 0 10-.001 4.001A2 2 0 007 2zm6 0a2 2 0 10-.001 4.001A2 2 0 0013 2zM7 8a2 2 0 10-.001 4.001A2 2 0 007 8zm6 0a2 2 0 10-.001 4.001A2 2 0 0013 8zm-6 6a2 2 0 10-.001 4.001A2 2 0 007 14zm6 0a2 2 0 10-.001 4.001A2 2 0 0013 14z" />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <BlurFade delay={0.12 + (task.title.length % 5) * 0.06} inView={true} direction={titleDirection} offset={8} className="inline-block">
            <h3 className="text-base font-semibold leading-snug text-text pr-6">{task.title}</h3>
          </BlurFade>
          <BlurFade delay={0.18 + (task.description.length % 6) * 0.05} inView={true} direction={descriptionDirection} offset={10} className="inline-block w-full">
            <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{task.description}</p>
          </BlurFade>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={(event) => {
          event.stopPropagation()
          onDelete(task.id)
        }}
        onPointerDown={(event) => event.stopPropagation()}
        className="absolute top-3 right-3 rounded-md p-1.5 text-text-muted opacity-0 transition-all hover:bg-error/10 hover:text-error focus:opacity-100 group-hover:opacity-100"
        aria-label="Delete task"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Subtle bottom border for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      </MagicCard>
    </motion.li>
  )
})

export default TaskCard

