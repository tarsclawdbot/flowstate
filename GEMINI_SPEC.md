# FlowState — Gemini Frontend Spec

**READ THIS FIRST AND MANDATORY:**
Read and strictly follow the frontend design skill at `/home/aravhawk/.agents/skills/frontend-design/SKILL.md` before writing any code. This is mandatory. The skill enforces production-grade, distinctive UI — no generic AI slop. Follow it completely.

---

## Overview

Build the complete frontend for **FlowState** — a developer-focused calendar intelligence tool. The backend (API routes, auth, database) is already built by Claude Code. Your job: build all pages, components, and the design system.

**Core principle:** This is a premium developer tool. It should feel like Vercel's dashboard meets Linear meets Raycast — dark, precise, data-dense, and beautiful. NOT generic SaaS. NOT Bootstrap. NOT "AI tool aesthetic."

---

## Design Language

### Colors
```
Background:       #0A0C10  (near-black, deep space)
Surface:          #0F1219  (card backgrounds)
Surface Elevated: #161B26  (hover states, active)
Border:           #1E2535  (subtle dividers)
Border Bright:    #2A3548  (active borders)

Primary Blue:     #3B82F6  (electric blue — actions, CTAs)
Accent Cyan:      #06B6D4  (data highlights, charts)
Accent Purple:    #8B5CF6  (secondary data)
Success Green:    #10B981  (good scores, improvements)
Warning Amber:    #F59E0B  (moderate fragmentation)
Danger Red:       #EF4444  (high fragmentation, alerts)

Text Primary:     #F1F5F9  (white-ish, headings)
Text Secondary:   #94A3B8  (secondary info)
Text Muted:       #4B5563  (placeholders, disabled)
```

### Typography
- Font: `Inter` (Google Fonts) — system font fallback
- Headings: font-weight 700, tight letter-spacing
- Data numbers: `font-mono` for metrics, scores, counts
- Scale: 12/14/16/20/24/32/48px

### Elevation / Depth
- Cards: `border border-[#1E2535] bg-[#0F1219]`
- Active/hover: `bg-[#161B26] border-[#2A3548]`
- Glow effects on key metrics: `box-shadow: 0 0 20px rgba(59, 130, 246, 0.15)`

### Motion
- Smooth transitions: `transition-all duration-200`
- Hover lifts: `hover:translate-y-[-1px]`
- Number counters where impactful

---

## Responsive Strategy

- **Mobile-first at 390px** — all components must work perfectly at 390px width
- **Breakpoints:** sm(390px) → md(768px) → lg(1024px) → xl(1280px)
- Navigation: **Bottom tabs on mobile**, **sidebar on desktop**
- Charts: Stack vertically on mobile, grid on desktop

---

## Component Architecture

Build these shared components in `components/`:

### `ScoreRing` — Circular score visualization
- SVG circle with stroke-dasharray animation
- Color changes: green (0-25) → amber (26-50) → orange (51-75) → red (76-100)
- Large number in center (font-mono, 48px)
- Label below

### `HeatmapGrid` — 7×24 commit heatmap
- 7 rows (Sun-Sat), 24 columns (0-23h)
- Each cell: small square, opacity based on value (0-100)
- Color: cyan (#06B6D4) intensity
- Labels: day names on left, hour markers on bottom (0, 6, 12, 18)
- Mobile: compress to show 6am-10pm only (16 columns)
- Peak cell: subtle glow animation

### `MetricCard` — Stat display card
- Large number with unit
- Trend indicator (↑↓ with % change)
- Label + sublabel
- Optional color accent on left border

### `SuggestionCard` — AI suggestion display
- Icon on left (lightbulb)
- Title + description
- Estimated impact badge
- Subtle blue-left-border

### `NavSidebar` — Desktop navigation
- Logo top-left: "FlowState" with small lightning bolt icon
- Nav items: Dashboard, Report, Connect, Settings, Pricing
- Active state: blue accent, filled background
- User avatar + name at bottom
- Width: 240px collapsed → 64px icon-only

### `NavBottom` — Mobile navigation
- 5 tabs with icons + labels
- Active: blue + elevated
- Fixed bottom, blur backdrop

---

## Page 1: Landing Page (`app/page.tsx`)

**Goal:** Convert developers who land here. Immediate "this is for me" recognition.

### Hero Section
- Full-viewport height on desktop, 80vh on mobile
- Background: subtle grid pattern (CSS) + gradient radial from center (blue glow)
- Badge: `◆ Made for Engineers` — small pill, upper left
- H1: "Know When You **Actually** Code Best." — "Actually" in gradient cyan-to-blue
- Subheading: "FlowState connects your GitHub history to your calendar. No more guessing. Just your real peak hours, automatically protected."
- Two CTAs: 
  - Primary: "Connect GitHub — Free" (blue filled, GitHub icon)
  - Secondary: "See Demo Data" (ghost, arrow icon)
- Below hero: row of social proof numbers: "847 avg commits analyzed · 3.2h avg weekly debt recovered · 67 avg fragmentation score"

### Feature Highlights (3-column grid, stacked on mobile)
Each with icon, title, description:

1. **GitHub Intelligence** — "Analyzes 90 days of your commit history to find when you're actually in the zone. Not when your manager thinks you are."
2. **Fragmentation Score™** — "A single number (0-100) showing how broken up your week is. Track it weekly. Watch it drop."
3. **Meeting Debt** — "Based on interruption science: every isolated meeting costs 23 min of recovery time. We calculate your weekly tab."
4. **Flow Windows Heatmap** — "A 7×24 grid of your actual coding patterns. See your real rhythms — day of week, hour by hour."
5. **Smart Suggestions** — "Concrete, personalized recommendations. 'Move your Tuesday standup 30 minutes earlier. Gain 4 hours of deep work.'"
6. **Weekly Reports** — "Friday afternoon: a full breakdown of your week. Deep work hours, fragmentation trend, wins, and what to change."

### Demo Preview Section
- Dark card showing a mini-version of the dashboard
- Use mock/static data (hardcoded JSX)
- Label: "Live preview — your data looks like this"
- Subtle parallax or static image

### Pricing Section
Three tiers in cards:
- **Free:** GitHub analysis only, fragmentation score, 1 week history — $0/month
- **Pro:** Full calendar integration, meeting debt, weekly reports, suggestions — **$15/month** (highlighted, "Most Popular" badge)
- **Team:** All Pro features + team fragmentation dashboard, manager view — $12/user/month

### Footer
- Links: GitHub (tarsclawdbot), Privacy, Terms
- "Built with ⚡ for engineers who ship"

---

## Page 2: Dashboard (`app/dashboard/page.tsx`)

**This is the heart of the app.** Make it feel like mission control.

### Layout
- Desktop: sidebar nav (240px) + main content area
- Mobile: content + bottom nav

### Top Row: Key Metrics (2-col on mobile, 4-col on desktop)
1. **Fragmentation Score** — ScoreRing component, large, color-coded
2. **Deep Work Hours** — this week (e.g., "18.5h"), trend vs last week
3. **Meeting Hours** — this week (e.g., "11.0h")
4. **Meeting Debt** — "3.2h lost to context switching"

### Center: Flow Windows Heatmap
- Full-width card
- Title: "Your Flow Windows — 90 days of GitHub history"
- The HeatmapGrid component
- Below: "Peak window: 10am Wednesdays — your most productive hour across all repos"

### Right Column / Below Heatmap: Suggestions
- Title: "This Week's Recommendations"
- 3-4 SuggestionCards
- Each card: specific, actionable, with estimated impact

### Bottom: Quick Stats Row
- Repos analyzed, total commits analyzed, GitHub last synced, Calendar last synced
- "Sync Now" buttons for each

### Empty State (not connected)
- If GitHub not connected: show a stylized "Connect GitHub" prompt card
- If Calendar not connected: show Calendar connect prompt
- If neither: full onboarding prompt with steps

**Use demo data** (`/api/demo-data`) when user has no real data connected. Show a subtle "Demo Mode" banner.

---

## Page 3: Weekly Report (`app/report/page.tsx`)

**Full-page deep dive into the week.**

### Header
- "Weekly Focus Report" + date range (e.g., "Feb 24 – Mar 1, 2026")
- Export PDF button (placeholder, no implementation needed)
- Share button (placeholder)

### Score Summary Row
Big cards across the top:
- Fragmentation Score: 67/100 with status "Concerning"
- Deep Work: 18.5h with trend arrow
- Meeting Hours: 11.0h
- Meeting Debt: 3.2h lost

### Chart 1: Fragmentation Trend (Line Chart)
- Recharts LineChart
- X-axis: last 5 weeks
- Y-axis: fragmentation score (0-100)
- Reference line at 50 (the "Good" threshold)
- Color: transitions from green to red based on value
- Tooltip showing exact score

### Chart 2: Time Allocation (Bar Chart)
- Recharts BarChart
- X-axis: Mon-Fri
- Stacked bars: Deep Work (blue) + Meetings (amber) + Overhead (gray)
- Shows daily composition

### Chart 3: Hourly Activity Heatmap
- Full HeatmapGrid showing this week's calendar events overlaid on GitHub patterns
- Calendar meetings shown as red overlay on the GitHub cyan heatmap

### Suggestions Panel
- Full list of personalized suggestions
- Ordered by estimated impact
- Each expandable for more detail

### Historical Reports
- Simple table/list of past 8 weeks
- Score, deep work hours, biggest win

---

## Page 4: Connect GitHub (`app/connect/github/page.tsx`)

### If not connected:
- Large GitHub logo (SVG, not icon font)
- H2: "Connect GitHub"
- Description: "We'll analyze your last 90 days of commits. Read-only access only."
- Permissions shown: `repo` (read), `user:email` — with explanations
- Privacy note: "We never read your code. Only commit timestamps."
- Large CTA: "Connect with GitHub" → triggers NextAuth signIn("github")
- Below: FAQ accordion — "What data do you access?", "How often does it sync?", "Can I disconnect?"

### If connected:
- Success state with GitHub username, avatar
- Stats: repos analyzed, total commits, last synced
- "Re-sync Now" button
- "Disconnect" button (destructive, red)
- The commit heatmap preview

---

## Page 5: Connect Calendar (`app/connect/calendar/page.tsx`)

Same pattern as GitHub connect but for Google Calendar:
- Google Calendar logo
- Permissions: `calendar.readonly`
- Privacy: "We never read event details or attendees. Only start/end times."
- Shows fragmentation score preview after connecting

---

## Page 6: Settings (`app/settings/page.tsx`)

Clean settings layout:

**Integrations Section:**
- GitHub: connected/not with avatar + disconnect button
- Google Calendar: connected/not with disconnect button

**Preferences Section:**
- Target deep work hours per day: number input (1-8)
- Timezone: select dropdown
- Email reports: toggle

**Account Section:**
- User name, email
- Sign out button

---

## Page 7: Pricing (`app/pricing/page.tsx`)

Already designed in Landing but as a standalone page:
- Three-tier pricing cards
- Feature comparison table
- FAQ section

---

## Key Implementation Notes

### Mock Data Strategy
Import from `/api/demo-data` for all display components when real data is unavailable. Show a subtle "Demo Mode — Connect GitHub to see your real data" banner at the top.

### Chart Colors
- Deep work / positive: `#3B82F6` (blue)
- Meetings / neutral: `#F59E0B` (amber)  
- Debt / negative: `#EF4444` (red)
- GitHub commits / intensity: `#06B6D4` (cyan)
- Background series: `#1E2535` (dark)

### Loading States
- Use skeleton loaders (animated pulse) — NOT spinners
- Skeleton should match the shape of the actual content

### Error States
- Clean error cards with retry buttons
- Never show raw error messages

### Navigation Items
- Dashboard: grid icon
- Report: chart-bar icon
- Connect: plug/link icon
- Settings: cog icon
- Pricing: sparkles icon

Use Heroicons or Lucide React for icons.

---

## File Structure

```
app/
  page.tsx              (landing)
  dashboard/page.tsx
  report/page.tsx
  connect/
    github/page.tsx
    calendar/page.tsx
  settings/page.tsx
  pricing/page.tsx
  layout.tsx
  globals.css

components/
  ScoreRing.tsx
  HeatmapGrid.tsx
  MetricCard.tsx
  SuggestionCard.tsx
  NavSidebar.tsx
  NavBottom.tsx
  DemoModeBanner.tsx
  SkeletonCard.tsx
```

---

## FINAL REMINDER

Read `/home/aravhawk/.agents/skills/frontend-design/SKILL.md` FIRST. The design must be:
- ✅ Distinctive and specific to developer tools
- ✅ Dark, data-dense, premium
- ✅ Mobile-first, 390px viewport
- ✅ Non-generic — if it could be any SaaS tool, redesign it
- ❌ No gradients that look like a template
- ❌ No rounded-3xl cards with emoji as icons
- ❌ No light mode defaults
- ❌ No Bootstrap or default Tailwind prose
