import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import Column from './Column.jsx'
import { useVibeTheme } from './hooks/useVibeTheme.js'
import { AnimatedGradientText } from './components/ui/animated-gradient-text.jsx'
import { AnimatedGridPattern } from './components/ui/animated-grid-pattern.jsx'
import { AnimatedShinyText } from './components/ui/animated-shiny-text.jsx'
import { BlurFade } from './components/ui/blur-fade.jsx'
import { NumberTicker } from './components/ui/number-ticker.jsx'
import { ShineBorder } from './components/ui/shine-border.jsx'
import { ShimmerButton } from './components/ui/shimmer-button.jsx'

const initialColumns = [
  {
    id: 'todo',
    title: 'To Do',
    accent: 'from-amber-400 to-orange-500',
    beamFrom: '#fbbf24',
    beamTo: '#f97316',
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    accent: 'from-blue-400 to-indigo-500',
    beamFrom: '#60a5fa',
    beamTo: '#818cf8',
  },
  {
    id: 'done',
    title: 'Done',
    accent: 'from-emerald-400 to-teal-500',
    beamFrom: '#34d399',
    beamTo: '#2dd4bf',
  },
]

const initialTasks = [
  {
    id: 'task-1',
    title: 'Design board layout',
    description: 'Sketch the three-column Kanban grid.',
    columnId: 'todo',
  },
  {
    id: 'task-2',
    title: 'Set up Tailwind',
    description: 'Wire Tailwind into Vite via PostCSS.',
    columnId: 'todo',
  },
  {
    id: 'task-3',
    title: 'Style the header',
    description: 'Add title bar with border and shadow.',
    columnId: 'todo',
  },
  {
    id: 'task-4',
    title: 'Extract Column component',
    description: 'Pull repeated column markup into Column.jsx.',
    columnId: 'inprogress',
  },
  {
    id: 'task-5',
    title: 'Add board state',
    description: 'Hold columns and tasks in App state.',
    columnId: 'inprogress',
  },
  {
    id: 'task-6',
    title: 'Scaffold Vite project',
    description: 'Create the React + Vite app skeleton.',
    columnId: 'done',
  },
  {
    id: 'task-7',
    title: 'Set up oxlint',
    description: 'Enable react and oxc plugin rules.',
    columnId: 'done',
  },
]

const STORAGE_KEY = 'vibe-kanban:tasks'

function isValidStoredTask(task, columnIds) {
  return (
    task !== null &&
    typeof task === 'object' &&
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    columnIds.includes(task.columnId)
  )
}

function loadStoredTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialTasks
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return initialTasks
    const columnIds = initialColumns.map((column) => column.id)
    const validTasks = parsed.filter((task) =>
      isValidStoredTask(task, columnIds),
    )
    return validTasks.length > 0 ? validTasks : initialTasks
  } catch {
    // Corrupt or unavailable storage: keep the dummy tasks.
    return initialTasks
  }
}

function App() {
  const [columns] = useState(initialColumns)
  const [tasks, setTasks] = useState(loadStoredTasks)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationGif, setCelebrationGif] = useState('')
  const celebrationTimeoutRef = useRef(null)
  const celebrationGifs = useMemo(
    () => [
      'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
      'https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/giphy.gif',
      'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
      'https://media.giphy.com/media/3oz8xAFtqoOUUrsh7W/giphy.gif',
      'https://media.giphy.com/media/g5zvwUa9720pO/giphy.gif',
    ],
    [],
  )
  const { currentVibe, cycleVibe } = useVibeTheme()

  // Save tasks to localStorage whenever they change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // Storage full or unavailable: board still works in memory.
    }
  }, [tasks])

  // Delay the celebration so it does not appear instantly on a single task
  // update, and make sure it turns off as soon as the threshold is no longer met.
  useEffect(() => {
    const columnTaskCounts = columns.map(
      (column) => tasks.filter((task) => task.columnId === column.id).length,
    )
    const hasMoreThanFour = columnTaskCounts.some((count) => count > 4)

    if (celebrationTimeoutRef.current) {
      window.clearTimeout(celebrationTimeoutRef.current)
      celebrationTimeoutRef.current = null
    }

    if (!hasMoreThanFour) {
      setShowCelebration(false)
      return
    }

    celebrationTimeoutRef.current = window.setTimeout(() => {
      setShowCelebration(true)
    }, 300)

    return () => {
      if (celebrationTimeoutRef.current) {
        window.clearTimeout(celebrationTimeoutRef.current)
        celebrationTimeoutRef.current = null
      }
    }
  }, [tasks, columns])

  useEffect(() => {
    if (!showCelebration) {
      setCelebrationGif('')
      return
    }

    const nextGif =
      celebrationGifs[Math.floor(Math.random() * celebrationGifs.length)]
    setCelebrationGif(nextGif)
  }, [showCelebration, celebrationGifs])

  // Keep the celebration (and its GIF) on screen for only 4 seconds.
  useEffect(() => {
    if (!showCelebration) return undefined

    const hideTimeoutId = window.setTimeout(() => {
      setShowCelebration(false)
    }, 4000)

    return () => window.clearTimeout(hideTimeoutId)
  }, [showCelebration])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleAddTask(columnId, title, description) {
    const newTask = {
      id: crypto.randomUUID(),
      title,
      description,
      columnId,
    }
    setTasks((prevTasks) => [...prevTasks, newTask])
  }

  function handleDeleteTask(taskId) {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
  }

  /**
   * Move or reorder a task when a drag ends.
   *
   * Source: `active.id` is always the id of the dragged task card,
   * because only SortableTaskCard components are registered as draggables.
   *
   * Destination: `over.id` is either
   *   - a task id (dropped on top of another card) — the moved task takes
   *     that card's column, inserting before it when crossing columns or
   *     reordering within the same column via arrayMove, or
   *   - a column id (dropped on a column's list area, e.g. an empty
   *     column) — the task is appended after that column's last task.
   *
   * If the pointer is released outside any droppable (`over` is null) or
   * the ids are unknown, we return the previous state unchanged.
   */
  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId) return

    setTasks((prevTasks) => {
      const activeIndex = prevTasks.findIndex((task) => task.id === activeId)
      if (activeIndex === -1) return prevTasks
      const draggedTask = prevTasks[activeIndex]

      const overTaskIndex = prevTasks.findIndex((task) => task.id === overId)
      const targetColumnId =
        overTaskIndex === -1 ? overId : prevTasks[overTaskIndex].columnId
      const isKnownColumn = columns.some(
        (column) => column.id === targetColumnId,
      )
      if (!isKnownColumn) return prevTasks

      // Same column, dropped on a sibling card: plain reorder.
      if (overTaskIndex !== -1 && draggedTask.columnId === targetColumnId) {
        return arrayMove(prevTasks, activeIndex, overTaskIndex)
      }

      const updatedTask = { ...draggedTask, columnId: targetColumnId }
      const remainingTasks = prevTasks.filter(
        (task) => task.id !== activeId,
      )

      // Different column, dropped on a card: insert before that card.
      if (overTaskIndex !== -1) {
        const insertBeforeIndex = remainingTasks.findIndex(
          (task) => task.id === overId,
        )
        const nextTasks = [...remainingTasks]
        nextTasks.splice(insertBeforeIndex, 0, updatedTask)
        return nextTasks
      }

      // Dropped on the column list itself: append after its last task.
      let insertIndex = remainingTasks.length
      for (let index = remainingTasks.length - 1; index >= 0; index -= 1) {
        if (remainingTasks[index].columnId === targetColumnId) {
          insertIndex = index + 1
          break
        }
      }
      const nextTasks = [...remainingTasks]
      nextTasks.splice(insertIndex, 0, updatedTask)
      return nextTasks
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background transition-colors duration-300">
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.35}
        duration={3}
        className="text-primary/40 stroke-primary/15 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative overflow-hidden rounded-xl bg-card p-6 shadow-2xl ring-1 ring-border">
            <ShineBorder
              borderWidth={1.5}
              duration={8}
              shineColor={[
                'rgb(var(--color-primary))',
                'rgb(var(--color-secondary))',
              ]}
            />
            
            
            <BlurFade delay={0.15} inView={true} direction="up" offset={14} >
              <img
                className="h-64 w-64 rounded-lg object-cover"
                src={celebrationGif}
                imgAlt="Celebration"
              />
            </BlurFade>
          </div>
        </div>
      )}

      <header className="relative border-b border-border bg-surface/80 shadow-sm backdrop-blur-md transition-colors duration-300">
        <div className="texture-overlay absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <div>
                <BlurFade delay={1.25} inView={true} direction="left" offset={14}>
                  <h1 className="text-2xl font-bold tracking-tight">
                    <AnimatedGradientText
                      speed={1.2}
                      colorFrom="rgb(var(--color-primary))"
                      colorTo="rgb(var(--color-secondary))"
                    >
                      Vibe Kanban
                    </AnimatedGradientText>
                  </h1>
                </BlurFade>
                <BlurFade delay={2.2} inView={true} direction="right" offset={10}>
                  <AnimatedShinyText className="text-xs font-medium">
                    Drag • Drop • Auto-save
                  </AnimatedShinyText>
                </BlurFade>
              </div>
            </div>
 
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-background/50 px-3 py-1.5 text-xs font-medium text-text-muted ring-1 ring-border">
                <BlurFade
                  delay={0.5}
                  inView={true}
                  direction="up"
                  offset={8}
                  className="inline-flex items-center gap-2"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                  </span>
                  <NumberTicker
                    value={tasks.length}
                    className="text-xs font-bold text-text"
                  />
                  <span>tasks</span>
                </BlurFade>
              </div>
 
              <ShimmerButton
                onClick={cycleVibe}
                borderRadius="8px"
                shimmerColor="rgba(255, 255, 255, 0.7)"
                background="linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)))"
                className="px-4 py-2 text-sm font-semibold shadow-lg transition-shadow hover:shadow-xl"
                title="Switch theme"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <BlurFade
                    delay={0.1}
                    inView={true}
                    direction="left"
                    offset={6}
                    className="inline-flex"
                  >
                    <span className="capitalize">{currentVibe}</span>
                  </BlurFade>
                </span>
              </ShimmerButton>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
            {columns.map((column, index) => (
              <Column
                key={column.id}
                columnId={column.id}
                title={column.title}
                accent={column.accent}
                beamFrom={column.beamFrom}
                beamTo={column.beamTo}
                beamDelay={index * 1.5}
                tasks={tasks.filter((task) => task.columnId === column.id)}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>
        </DndContext>
      </main>
    </div>
  )
}

export default App
