import { cn } from '../../lib/utils.js'

export function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) {
  return (
    <span
      style={{
        '--shiny-width': `${shimmerWidth}px`,
      }}
      className={cn(
        // Theme-aware base color so the caption follows every vibe.
        'mx-auto max-w-md text-text-muted',

        // Shine effect
        'animate-shiny-text bg-size-[var(--shiny-width)_100%] bg-clip-text bg-position-[0_0] bg-no-repeat [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]',

        // Shine gradient — derived from the theme text color so the sweep
        // stays legible in light, dark, vaporwave and forest alike.
        'bg-linear-to-r from-transparent via-text/80 via-50% to-transparent',

        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
