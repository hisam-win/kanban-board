import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { AnimatePresence, motion } from 'framer-motion'
import SortableTaskCard from './SortableTaskCard.jsx'
import AddTaskModal from './AddTaskModal.jsx'
import { BlurFade } from './components/ui/blur-fade.jsx'
import { BorderBeam } from './components/ui/border-beam.jsx'

function Column({
  columnId,
  title,
  accent,
  beamFrom,
  beamTo,
  beamDelay = 0,
  tasks = [],
  onAddTask,
  onDeleteTask,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { setNodeRef, isOver } = useDroppable({ id: columnId })

  function handleAdd(title, description) {
    onAddTask(columnId, title, description)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="relative flex flex-col rounded-xl border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
    >
      <BorderBeam
        size={64}
        duration={9}
        delay={beamDelay}
        colorFrom={beamFrom}
        colorTo={beamTo}
        borderWidth={1.5}
      />
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface/50 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full bg-gradient-to-br ${accent} shadow-sm`}
          />
          <BlurFade delay={0.12 * (tasks.length + 1)} inView={true} direction="left" offset={8} className="inline-flex">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text">
              {title}
            </h2>
          </BlurFade>
        </div>
        <BlurFade delay={0.2} inView={true} direction="up" offset={8} className="inline-flex">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-background/80 text-xs font-bold tabular-nums text-text ring-1 ring-border">
            {tasks.length}
          </span>
        </BlurFade>
      </div>

      {/* Task List */}
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <motion.ul
          layout
          ref={setNodeRef}
          animate={
            isOver
              ? {
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  scale: 1.02
                }
              : {
                  backgroundColor: 'transparent',
                  scale: 1
                }
          }
          transition={{ duration: 0.2 }}
          className={`flex min-h-[280px] flex-col gap-3 p-4 ${
            isOver ? 'ring-2 ring-primary/50 ring-inset rounded-lg' : ''
          }`}
        >
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
              />
            ))}
          </AnimatePresence>
          {tasks.length === 0 && (
            <motion.li
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-background/30 p-6 text-center"
            >
              <svg className="h-12 w-12 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <BlurFade delay={0.18} inView={true} direction="up" offset={10} className="inline-flex">
                <p className="text-sm font-medium text-text-muted">
                  Drop tasks here
                </p>
              </BlurFade>
            </motion.li>
          )}
        </motion.ul>
      </SortableContext>

      {/* Add Task Button */}
      <div className="border-t border-border bg-surface/30 p-3">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="group flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background/50 px-4 py-2.5 text-sm font-semibold text-text-muted transition-all hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-sm active:scale-[0.98]"
        >
          <svg className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <BlurFade delay={0.14} inView={true} direction="up" offset={6} className="inline-flex">
            Add Task
          </BlurFade>
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <AddTaskModal
            columnTitle={title}
            onClose={() => setIsModalOpen(false)}
            onAdd={handleAdd}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Column
