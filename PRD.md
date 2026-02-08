# Mission Control — PRD v3

## Philosophy
37signals style. Ship simple, reinforce later. Don't build what we don't need yet. Structure allows growth but stays lean.

## Base
Fork of [crshdn/mission-control](https://github.com/crshdn/mission-control) (240 ⭐)

## Phase 2: What We're Building Now

### 2a. Clean Slate
- Remove all placeholder agents, tasks, workspaces
- One clean workspace: "General"
- Everything currently is "General" (setup phase)

### 2b. Design Overhaul
- Swap to shadcn/ui components (rounded, shadows, modern feel)
- Dark mode default
- Orange primary (#f97316)
- Nix ⚡ branding
- Clean typography (Inter, not monospace)

### 2c. Simplified Kanban
- 4 columns: Backlog → In Progress → Review → Done
- Color-coded project tags (simple labels, not rigid hierarchy)
  - "General" = default color
  - Future: "DR" = red, "Personal" = blue, etc.
  - Tags are just labels — no complex section system
- Fix mobile drag (currently broken)

### 2d. Task Structure
- Title + description
- Owner/assignee (Franc, Nix, agent name)
- Blockers (free text — what needs to happen first)
- Subtasks (simple checklist)
- Project tag (color-coded label)
- Phase (optional — for phased projects like Mission Control)

### 2e. Dashboard Landing
- Overview stats: total tasks, in progress, done, blocked
- Quick view before diving into Kanban
- Simple, not cluttered

## What We're NOT Building (yet)
- ❌ Multiple workspaces/sections
- ❌ Complex agent management
- ❌ Chat interface
- ❌ Memory browser
- ❌ AI planning Q&A flow (keep manual for now)

## Tech
- Next.js 14 + Tailwind v3 + shadcn/ui
- SQLite (keep it)
- Zustand state (keep it)

## Success Criteria
- [ ] Clean, no placeholders
- [ ] Works on phone (responsive + touch drag)
- [ ] shadcn/ui design (modern, polished)
- [ ] 4-column Kanban with color-coded tags
- [ ] Tasks have owners, blockers, subtasks
- [ ] Dashboard overview page
- [ ] Franc says "I like it"

---

*Ship it. Then reinforce.*
