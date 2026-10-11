# Stitch MCP Design System Redesign

This Kanban board has been redesigned following the **Stitch MCP** design system principles - creating a production-ready UI with consistent design tokens, sharp aesthetics, and modern component patterns.

## 🎨 Design Philosophy

Inspired by [Stitch MCP](https://github.com/LuciferDono/stitch-pro-mcp), the redesign emphasizes:

- **Production Slate Foundation**: Deep navy/graphite bases (#0B0E14, #0F172A) with crisp off-white text
- **Electric Accents**: Sky cyan (#38BDF8) and warm orange (#F97316) for CTAs and status
- **Contemporary Product Sans**: Inter font with proper font-feature-settings
- **Asymmetric Product Surfaces**: Real product feel with compact scanability
- **Controlled Depth**: 8-16px radius, hairline borders, material shadows

## 🔧 What Changed

### 1. **Color System** (`index.css`)
- Added `--color-success`, `--color-warning`, `--color-error` tokens
- Updated dark theme with deeper navy (#0B0E14) background
- Refined vaporwave/forest palettes for better contrast
- Added subtle texture overlay utility class

### 2. **Header** ([App.jsx:233-267](src/App.jsx#L233-L267))
- Icon-based branding with gradient badge
- Live status indicator with animated pulse
- Compact metrics display
- Gradient CTA button for theme switching
- Subtle texture overlay for depth

### 3. **Column Component** ([Column.jsx](src/Column.jsx))
- Structured header with uppercase labels
- Badge-style task counter
- Visual drop feedback with ring indicator
- Empty state with icon and messaging
- Segmented layout (header/body/footer)

### 4. **Task Cards** ([TaskCard.jsx](src/TaskCard.jsx))
- Vertical gradient accent bar (left edge)
- Clean white/card background (no full gradient)
- Subtle hover lift animation
- Improved drag handle visibility
- Bottom gradient border for depth
- Contextual delete with hover reveal

### 5. **Add Task Modal** ([AddTaskModal.jsx](src/AddTaskModal.jsx))
- Structured header with icon badge
- Close button in header
- Uppercase field labels
- Improved form layout
- Better validation feedback
- Footer with action buttons

## 🎯 Key Design Principles Applied

### Typography
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
```

### Component Structure
- Headers with clear hierarchy
- Segmented sections (header/body/footer)
- Consistent spacing (4, 6, 8, 12, 16, 24px scale)
- Ring borders for focus states

### Interaction Design
- Subtle hover lifts (-2px to -3px)
- Scale animations (0.98-1.02)
- Spring physics for natural motion
- Contextual reveals (delete buttons)

## 🚀 Running the Project

```bash
cd vibe-kanban
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📦 Tech Stack

- **React 19** + **Vite 8**
- **Tailwind CSS 4** (design token system)
- **Framer Motion 13** (animations)
- **@dnd-kit** (drag & drop)
- **Inter** font family

## 🎭 Theme Vibes

The app supports 4 design vibes:
1. **Light** - Clean, bright workspace
2. **Dark** - Deep navy with electric accents
3. **Vaporwave** - Cyberpunk aesthetic
4. **Forest** - Natural serenity

## 📚 References

- [Stitch Pro MCP](https://github.com/LuciferDono/stitch-pro-mcp)
- [Stitch MCP Server](https://github.com/mattferry/stitch-mcp-server)
- [Design to Code with Stitch](https://codelabs.developers.google.com/design-to-code-with-antigravity-stitch)
- [Creating Design Systems with Stitch](https://annissimo.com/creating-a-design-system-with-google-stitch-mcp)

---

**Design System Version**: 1.0.0  
**Last Updated**: October 2026
