# Mission Control — PRD v2

## Vision
Our command center for managing all projects and agent teams. Fork of [crshdn/mission-control](https://github.com/crshdn/mission-control) (240 ⭐), customized for our multi-project workflow.

## What We're Forking
crshdn/mission-control provides:
- Workspace management (multiple projects)
- Kanban board with drag & drop (Planning → Inbox → Assigned → In Progress → Testing → Review → Done)
- AI-guided task planning (Q&A before dispatching)
- Agent management sidebar
- Activity log / live feed
- SQLite persistence
- OpenClaw Gateway WebSocket integration
- Next.js 14, Tailwind v3, Zustand state management

## What We're Changing

### Phase 1: Mobile-First Responsive (Priority)
The existing app is desktop-only. We need it usable on Franc's phone.

**Changes:**
- Responsive layout that works on mobile screens
- Collapsible sidebar (hamburger menu on mobile)
- Touch-friendly task cards and drag interactions
- Readable typography at mobile sizes
- Kanban → vertical stack on mobile (one column at a time with swipe/tabs)

### Phase 2: Cleanup & Polish
- Remove SSE Debug Panel
- Remove Playwright dependency
- Dark mode as default (match our aesthetic)
- Update branding (Nix ⚡ logo, our color palette — orange primary)
- Clean up unused code

### Phase 3: Our Customizations
- **Quick status bar** — model, uptime, connection status (small, non-intrusive)
- **Workspace templates** — pre-configured workspace types we use often
- **Agent profiles** — following Kevin Simback's framework:
  - Level system (L1 Observer → L4 Autonomous)
  - SOUL.md viewer per agent
  - Performance tracking

## What We're NOT Adding
- ❌ Chat interface (Gateway + Telegram handles this)
- ❌ Memory browser (Obsidian handles this)
- ❌ Weather widget
- ❌ Calendar integration in UI
- ❌ Google Maps

## Tech Decisions
- Keep Next.js 14 (stable, don't upgrade for no reason)
- Keep Tailwind v3 (same — working is better than latest)
- Keep SQLite (simple, local, no setup)
- Keep Zustand (lightweight state)

## Design Principles
- Mobile-first responsive
- Dark mode default
- Clean, minimal — no visual clutter
- Fast — no unnecessary loading states
- Touch-friendly on phone

## Setup
```bash
# Fork + clone
git clone https://github.com/SpicyCarrot25/mission-control.git
cd mission-control
npm install

# Configure
cp .env.example .env.local
# Add gateway URL + token

# Run
npm run dev
```

## Success Criteria
- [ ] Works on Franc's phone (responsive)
- [ ] Can create workspaces for different projects
- [ ] Can create and move tasks through Kanban
- [ ] Connects to our OpenClaw Gateway
- [ ] Agents can be assigned and tracked
- [ ] Looks good — Steve Jobs standard

## Development Process
1. Fork repo to SpicyCarrot25
2. PRD approval (this doc) ← **WE ARE HERE**
3. Phase 1: Mobile responsive — Codex builds, Nix reviews
4. Phase 2: Cleanup — Codex builds, Nix reviews
5. Phase 3: Customizations — PRD each feature, approve, then build
6. Each phase: Franc reviews in browser/phone before next phase

---

*Waiting for approval before any code is written.*
