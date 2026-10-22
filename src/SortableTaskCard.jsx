import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import TaskCard from './TaskCard.jsx'

function SortableTaskCard({ task, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : undefined,
  }

  const dragHandleProps = {
    ...attributes,
    ...listeners,
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{
        opacity: isDragging ? 0.4 : 1,
        y: 0,
        scale: isDragging ? 1.04 : 1,
        boxShadow: isDragging
          ? '0 20px 40px -12px rgba(59, 130, 246, 0.55)'
          : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={isDragging ? undefined : { y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
    >
      <TaskCard
        task={task}
        ref={setNodeRef}
        style={style}
        onDelete={onDelete}
        dragHandleProps={dragHandleProps}
      />
    </motion.div>
  )
}

export default SortableTaskCard
