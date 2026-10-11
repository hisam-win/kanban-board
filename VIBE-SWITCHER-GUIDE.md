# Vibe Switcher Implementation Guide

## Overview
Your Kanban board now supports four distinct theme vibes: **Light**, **Dark**, **Vaporwave**, and **Forest**. The theme system uses CSS variables and Tailwind's class strategy for seamless switching.

---

## Files Modified/Created

### 1. **tailwind.config.js**
- Added `darkMode: 'class'` to enable class-based theme switching
- Extended colors to use CSS variables:
  - `primary`, `secondary`, `accent` - Main brand colors
  - `background`, `surface`, `card` - Background layers
  - `text`, `text-muted` - Text colors
  - `border` - Border colors

### 2. **src/index.css**
- Defined CSS variables for all four vibes:
  - **Light**: Clean sky blues and oranges on white
  - **Dark**: Bright cyans and oranges on deep navy
  - **Vaporwave**: Neon pinks, purples, and cyans on dark purple
  - **Forest**: Rich greens and amber on soft beige

### 3. **src/hooks/useVibeTheme.js** (NEW)
- Custom React hook managing theme state
- Persists selected theme to localStorage
- Applies theme class to `document.documentElement`
- Exports:
  - `currentVibe`: Current theme name string
  - `cycleVibe()`: Cycles through themes in order
  - `setVibeByName(vibe)`: Sets specific theme

### 4. **Updated Components**
- **App.jsx**: Integrated hook, added theme switcher button
- **Column.jsx**: Uses theme color variables
- **TaskCard.jsx**: Uses theme color variables
- **AddTaskModal.jsx**: Uses theme color variables

---

## Usage Examples

### Basic Usage in App.jsx
```jsx
import { useVibeTheme } from './hooks/useVibeTheme.js'

function App() {
  const { currentVibe, cycleVibe, setVibeByName } = useVibeTheme()

  return (
    <div className="min-h-screen bg-background">
      <button onClick={cycleVibe}>
        Current: {currentVibe}
      </button>
    </div>
  )
}
```

### Using Color Variables in Components
```jsx
// Background colors
<div className="bg-background">       {/* Page background */}
<div className="bg-surface">          {/* Card surfaces */}
<div className="bg-card">             {/* Individual cards */}

// Text colors
<h1 className="text-text">            {/* Primary text */}
<p className="text-text-muted">       {/* Secondary text */}

// Brand colors
<button className="bg-primary">       {/* Main brand color */}
<div className="border-border">       {/* Borders */}
<span className="text-accent">        {/* Accent highlights */}

// Gradients
<div className="bg-gradient-to-br from-primary via-secondary to-accent">
```

### Setting a Specific Theme
```jsx
// Programmatically set a theme
setVibeByName('vaporwave')  // Valid: 'light', 'dark', 'vaporwave', 'forest'
```

---

## Theme Color Palettes

### Light (Default)
- Primary: Sky blue `#0ea5e9`
- Secondary: Cyan `#06b6d4`
- Accent: Orange `#f97316`
- Background: Off-white `#f8fafc`
- Text: Dark slate `#0f172a`

### Dark
- Primary: Bright sky `#38bdf8`
- Secondary: Cyan `#22d3ee`
- Accent: Light orange `#fb923c`
- Background: Deep navy `#0f172a`
- Text: Off-white `#f8fafc`

### Vaporwave
- Primary: Hot pink `#ec4899`
- Secondary: Purple `#a855f7`
- Accent: Cyan `#22d3ee`
- Background: Deep purple `#1a0b2e`
- Text: Pale pink `#f5d0fe`

### Forest
- Primary: Emerald `#10b981`
- Secondary: Green `#059669`
- Accent: Amber `#d97706`
- Background: Pale mint `#f0fdf4`
- Text: Deep forest `#064e3b`

---

## Adding New Vibes

To add a new theme:

1. **Update `src/index.css`**:
```css
.cyberpunk {
  --color-primary: #00ff9f;
  --color-secondary: #00d4ff;
  --color-accent: #ff006e;
  --color-background: #0a0e27;
  --color-surface: #1a1f3a;
  --color-text: #e0fbfc;
  --color-text-muted: #a7c5d9;
  --color-card: #252d4a;
  --color-border: #3d4968;
}
```

2. **Update `src/hooks/useVibeTheme.js`**:
```js
const VIBES = ['light', 'dark', 'vaporwave', 'forest', 'cyberpunk']
```

That's it! The hook will automatically include the new theme in the cycle.

---

## How It Works

1. **CSS Variables**: Each theme class (`.light`, `.dark`, etc.) defines its own set of CSS variables
2. **Tailwind Integration**: Tailwind's extended colors reference these CSS variables
3. **Class Application**: The hook applies the theme class to `<html>` element
4. **Cascade**: All child elements inherit the theme through CSS variable cascade
5. **Persistence**: Selected theme is saved to localStorage as `vibe-kanban:theme`

---

## Transitions

All components include `transition-colors duration-300` for smooth theme switching without jarring color changes.

---

## Browser Support

Works in all modern browsers that support:
- CSS Custom Properties (CSS Variables)
- localStorage
- ES6+ JavaScript

---

## Troubleshooting

**Theme not applying?**
- Check browser console for errors
- Verify the theme class is on `<html>` element
- Clear localStorage and refresh

**Colors look wrong?**
- Make sure you're using the theme color names (`bg-background`) not hardcoded Tailwind colors (`bg-blue-500`)
- Check that CSS variables are defined in `index.css`

**Theme doesn't persist?**
- Check if localStorage is enabled in browser
- Look for storage quota errors in console
