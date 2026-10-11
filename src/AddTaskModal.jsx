import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BlurFade } from './components/ui/blur-fade.jsx'
import { ShineBorder } from './components/ui/shine-border.jsx'
import { ShimmerButton } from './components/ui/shimmer-button.jsx'

function AddTaskModal({ columnTitle, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showTitleWarning, setShowTitleWarning] = useState(false)
  const titleInputRef = useRef(null)

  // Autofocus the title input only once when the modal opens. Keep this
  // separate from the keydown effect below: that effect re-runs on every
  // keystroke (title and description are in its deps), which would otherwise
  // yank focus back to the title field while the user is typing.
  useEffect(() => {
    titleInputRef.current?.focus()
  }, [])

  // Show a ⚠️ sticker if the title is left blank for more than 20s.
  // The timer resets on every title change; typing a title hides it.
  // Cleanup clears the pending timeout to avoid leaks / stale setState.
  useEffect(() => {
    if (title.trim()) {
      setShowTitleWarning(false)
      return
    }
    const timer = setTimeout(() => {
      setShowTitleWarning(true)
    }, 20000)
    return () => clearTimeout(timer)
  }, [title])

  useEffect(() => {
    function handleKeyDown(event) {
      // Handle Escape key to close the modal
      if (event.key === 'Escape') {
        onClose()
      }

      // Handle Enter key to submit the form (only if title is not empty)
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        const trimmedTitle = title.trim()
        if (trimmedTitle) {
          onAdd(trimmedTitle, description.trim())
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // CLEANUP FUNCTION: This return statement is critical for preventing memory leaks.
    // Without it, every time this useEffect runs (when onClose or onAdd changes),
    // a new event listener would be added to the document WITHOUT removing the old one.
    // This causes multiple listeners to accumulate in memory, each firing when the key is pressed.
    // Over time, this leads to performance degradation and potential memory leaks.
    // The cleanup function ensures that the old listener is removed before a new one is registered,
    // maintaining a 1:1 listener ratio regardless of how many times the effect runs.
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onAdd, title, description])

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    onAdd(trimmedTitle, description.trim())
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Add task to ${columnTitle}`}
        initial={{ opacity: 0, y: 32, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-2xl ring-1 ring-border/50"
        onClick={(event) => event.stopPropagation()}
      >
        <ShineBorder
          borderWidth={1.5}
          duration={10}
          shineColor={[
            'rgb(var(--color-primary))',
            'rgb(var(--color-secondary))',
            'rgb(var(--color-accent))',
          ]}
        />
        {/* Modal Header */}
        <div className="border-b border-border bg-surface/50 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <BlurFade delay={0.08} inView={true} direction="left" offset={8} className="inline-flex">
                  <h2 className="text-base font-semibold tracking-tight text-text">
                    New Task
                  </h2>
                </BlurFade>
                <BlurFade delay={0.14} inView={true} direction="up" offset={6} className="inline-flex">
                  <p className="text-xs text-text-muted">
                    {columnTitle}
                  </p>
                </BlurFade>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-muted transition-all hover:bg-background hover:text-text"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <BlurFade delay={0.18} inView={true} direction="left" offset={8} className="inline-flex">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Title <span className="text-error">*</span>
                </span>
              </BlurFade>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter task title..."
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text placeholder:text-text-muted transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <AnimatePresence>
                {showTitleWarning && !title.trim() && (
                  <motion.p
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    className="flex items-center gap-1.5 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs font-medium text-error"
                    role="alert"
                  >
                    <span aria-hidden="true" className="text-sm leading-none">
                      ⚠️
                    </span>
                    Hey! You left the title blank for 20s — please enter a task title.
                  </motion.p>
                )}
              </AnimatePresence>
            </label>

            <label className="flex flex-col gap-2">
              <BlurFade delay={0.22} inView={true} direction="right" offset={8} className="inline-flex">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Description
                </span>
              </BlurFade>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add details about this task..."
                rows={4}
                className="resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text placeholder:text-text-muted transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          {/* Modal Footer */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
            <AnimatePresence>
              {!title.trim() && (
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="flex items-center gap-1.5 text-xs text-text-muted"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <BlurFade delay={0.05} inView={true} direction="left" offset={6} className="inline-flex">
                    Title required
                  </BlurFade>
                </motion.p>
              )}
            </AnimatePresence>
            <div className="ml-auto flex gap-2">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-text-muted transition-all hover:bg-surface hover:text-text"
              >
                <BlurFade delay={0.14} inView={true} direction="up" offset={6} className="inline-flex">
                  Cancel
                </BlurFade>
              </motion.button>
              <ShimmerButton
                type="submit"
                disabled={!title.trim()}
                borderRadius="8px"
                shimmerColor="rgba(255, 255, 255, 0.7)"
                background="linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)))"
                className="px-5 py-2 text-sm font-bold shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <BlurFade delay={0.16} inView={true} direction="up" offset={6} className="relative z-10 inline-flex">
                  Add Task
                </BlurFade>
              </ShimmerButton>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default AddTaskModal
