import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names, resolving Tailwind conflicts
 * (shadcn-style `cn` helper for Magic UI components).
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
