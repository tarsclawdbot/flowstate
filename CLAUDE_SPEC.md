# FlowState — Claude Code Spec (Backend + Logic)

Build a complete Next.js 15 application called **FlowState** — a developer-focused calendar intelligence tool that analyzes GitHub commit history and Google Calendar data to optimize deep work time.

## CRITICAL REQUIREMENTS
- Use `--dangerously-skip-permissions` is already set, so proceed without confirmations
- Build EVERYTHING listed here completely
- The app must work with mock/demo data even when OAuth is not connected
- Every page must render without errors

---

## Step 1: Project Bootstrap

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Install dependencies:
```bash
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client
npm install @octokit/rest googleapis
npm install recharts date-fns
npm install @types/node
```

---

## Step 2: Prisma Setup

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  githubLogin   String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  githubData    GitHubSyncData?
  calendarData  CalendarSyncData?
  weeklyReports WeeklyReport[]
  settings      UserSettings?
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model GitHubSyncData {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  commitHeatmap   String   // JSON: 7x24 grid
  peakHour        Int
  peakDay         Int
  totalCommits    Int
  reposAnalyzed   Int
  lastSyncedAt    DateTime @default(now())
}

model CalendarSyncData {
  id                  String   @id @default(cuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  weeklyMeetingHours  Float
  fragmentationScore  Int
  meetingDebtHours    Float
  meetingsPerDay      String   // JSON
  lastSyncedAt        DateTime @default(now())
}

model WeeklyReport {
  id                 String   @id @default(cuid())
  userId             String
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  weekStart          DateTime
  deepWorkHours      Float
  meetingHours       Float
  fragmentationScore Int
  meetingDebtHours   Float
  suggestions        String   // JSON array
  createdAt          DateTime @default(now())
}

model UserSettings {
  id              String  @id @default(cuid())
  userId          String  @unique
  user            User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  targetDeepHours Int     @default(4)
  timezone        String  @default("America/Chicago")
  emailReports    Boolean @default(true)
}
```

Run: `npx prisma generate && npx prisma db push`

---

## Step 3: NextAuth Configuration

Create `auth.ts` at project root:

```typescript
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: "read:user user:email repo" }
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
          access_type: "offline",
          prompt: "consent"
        }
      }
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    }
  }
})
```

Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

Create `lib/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client"
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

---

## Step 4: GitHub Analysis API

Create `app/api/github/analyze/route.ts`:

```typescript
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Octokit } from "@octokit/rest"
import { NextResponse } from "next/server"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Get the GitHub access token from the Account table
  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "github" }
  })
  
  if (!account?.access_token) {
    return NextResponse.json({ error: "GitHub not connected" }, { status: 400 })
  }

  const octokit = new Octokit({ auth: account.access_token })

  // Initialize 7x24 heatmap (day 0=Sun, hour 0-23)
  const heatmap: number[][] = Array(7).fill(null).map(() => Array(24).fill(0))
  let totalCommits = 0
  let reposAnalyzed = 0

  try {
    // Get user's repos (up to 30 most recently pushed)
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: "pushed",
      per_page: 30,
      type: "owner"
    })

    // For each repo, get commits from the last 90 days
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

    for (const repo of repos.slice(0, 20)) {
      try {
        const { data: commits } = await octokit.repos.listCommits({
          owner: repo.owner.login,
          repo: repo.name,
          author: session.user.email || undefined,
          since,
          per_page: 100
        })

        reposAnalyzed++
        for (const commit of commits) {
          const date = new Date(commit.commit.author?.date || "")
          const day = date.getDay() // 0=Sun
          const hour = date.getHours()
          heatmap[day][hour]++
          totalCommits++
        }
      } catch {
        // Skip repos with access issues
      }
    }
  } catch (err) {
    return NextResponse.json({ error: "GitHub API error" }, { status: 500 })
  }

  // Find peak hour and day
  let peakHour = 0, peakDay = 0, peakVal = 0
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (heatmap[d][h] > peakVal) {
        peakVal = heatmap[d][h]
        peakHour = h
        peakDay = d
      }
    }
  }

  // Normalize heatmap to 0-100
  const normalizedHeatmap = heatmap.map(row =>
    row.map(val => peakVal > 0 ? Math.round((val / peakVal) * 100) : 0)
  )

  await prisma.gitHubSyncData.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      commitHeatmap: JSON.stringify(normalizedHeatmap),
      peakHour,
      peakDay,
      totalCommits,
      reposAnalyzed,
    },
    update: {
      commitHeatmap: JSON.stringify(normalizedHeatmap),
      peakHour,
      peakDay,
      totalCommits,
      reposAnalyzed,
      lastSyncedAt: new Date()
    }
  })

  return NextResponse.json({ success: true, totalCommits, reposAnalyzed, peakHour, peakDay })
}
```

---

## Step 5: Calendar Analysis API

Create `app/api/calendar/analyze/route.ts`:

```typescript
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { google } from "googleapis"
import { NextResponse } from "next/server"

function calculateFragmentationScore(events: any[]): number {
  // Group events by day
  const byDay: Record<string, any[]> = {}
  for (const event of events) {
    if (!event.start?.dateTime) continue
    const day = event.start.dateTime.split("T")[0]
    if (!byDay[day]) byDay[day] = []
    byDay[day].push({
      start: new Date(event.start.dateTime),
      end: new Date(event.end?.dateTime || event.start.dateTime)
    })
  }

  let totalFragmentation = 0
  let dayCount = 0

  for (const day of Object.values(byDay)) {
    const sorted = day.sort((a, b) => a.start - b.start)
    let isolatedMeetings = 0
    let brokenFlowBlocks = 0

    for (let i = 0; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const next = sorted[i + 1]
      const curr = sorted[i]

      const gapBefore = prev ? (curr.start - prev.end) / 60000 : 120
      const gapAfter = next ? (next.start - curr.end) / 60000 : 120

      // Isolated = surrounded by large gaps (meeting is alone, breaks flow)
      if (gapBefore > 90 && gapAfter > 90) isolatedMeetings++
      // Breaks flow = breaks a potential 2h+ block
      if (gapBefore > 120 && gapAfter > 120) brokenFlowBlocks++
    }

    totalFragmentation += isolatedMeetings * 1.5 + brokenFlowBlocks * 2
    dayCount++
  }

  if (dayCount === 0) return 0
  const weeklyAvg = totalFragmentation / dayCount
  return Math.min(100, Math.round(weeklyAvg * 8))
}

function calculateMeetingDebt(events: any[]): number {
  const byDay: Record<string, any[]> = {}
  for (const event of events) {
    if (!event.start?.dateTime) continue
    const day = event.start.dateTime.split("T")[0]
    if (!byDay[day]) byDay[day] = []
    byDay[day].push({
      start: new Date(event.start.dateTime),
      end: new Date(event.end?.dateTime || event.start.dateTime)
    })
  }

  let debtMinutes = 0
  for (const day of Object.values(byDay)) {
    const sorted = day.sort((a, b) => a.start - b.start)
    for (let i = 0; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const next = sorted[i + 1]
      if (prev && next) {
        const gapBefore = (sorted[i].start - prev.end) / 60000
        const gapAfter = (next.start - sorted[i].end) / 60000
        // This meeting broke a potential 2h+ deep work block
        if (gapBefore + gapAfter > 120) {
          debtMinutes += 23
        }
      }
    }
  }
  return Math.round(debtMinutes / 60 * 10) / 10
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" }
  })

  if (!account?.access_token) {
    return NextResponse.json({ error: "Google Calendar not connected" }, { status: 400 })
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token
  })

  const calendar = google.calendar({ version: "v3", auth: oauth2Client })

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay()) // Sunday
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  let events: any[] = []
  try {
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: weekStart.toISOString(),
      timeMax: weekEnd.toISOString(),
      singleEvents: true,
      orderBy: "startTime"
    })
    events = response.data.items || []
  } catch {
    return NextResponse.json({ error: "Calendar API error" }, { status: 500 })
  }

  // Calculate meeting hours
  let meetingMinutes = 0
  const meetingsPerDay: Record<string, number> = { sun: 0, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0 }
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

  for (const event of events) {
    if (!event.start?.dateTime) continue
    const start = new Date(event.start.dateTime)
    const end = new Date(event.end?.dateTime || event.start.dateTime)
    meetingMinutes += (end.getTime() - start.getTime()) / 60000
    meetingsPerDay[days[start.getDay()]]++
  }

  const weeklyMeetingHours = Math.round(meetingMinutes / 60 * 10) / 10
  const fragmentationScore = calculateFragmentationScore(events)
  const meetingDebtHours = calculateMeetingDebt(events)

  await prisma.calendarSyncData.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      weeklyMeetingHours,
      fragmentationScore,
      meetingDebtHours,
      meetingsPerDay: JSON.stringify(meetingsPerDay),
    },
    update: {
      weeklyMeetingHours,
      fragmentationScore,
      meetingDebtHours,
      meetingsPerDay: JSON.stringify(meetingsPerDay),
      lastSyncedAt: new Date()
    }
  })

  return NextResponse.json({ success: true, weeklyMeetingHours, fragmentationScore, meetingDebtHours })
}
```

---

## Step 6: Weekly Report API

Create `app/api/report/weekly/route.ts`:

```typescript
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [githubData, calendarData, settings] = await Promise.all([
    prisma.gitHubSyncData.findUnique({ where: { userId: session.user.id } }),
    prisma.calendarSyncData.findUnique({ where: { userId: session.user.id } }),
    prisma.userSettings.findUnique({ where: { userId: session.user.id } })
  ])

  const targetDeepHours = settings?.targetDeepHours || 4
  const meetingHours = calendarData?.weeklyMeetingHours || 0
  // Assume 8hr workday × 5 days, deep work = total - meetings - overhead(2hr/day)
  const deepWorkHours = Math.max(0, 40 - meetingHours - 10)
  const fragmentationScore = calendarData?.fragmentationScore || 0
  const meetingDebtHours = calendarData?.meetingDebtHours || 0

  // Generate suggestions
  const suggestions: string[] = []
  const meetingsPerDay = calendarData ? JSON.parse(calendarData.meetingsPerDay) : {}
  const peakHour = githubData?.peakHour ?? 10
  const peakHourStr = `${peakHour}:00${peakHour < 12 ? "am" : "pm"}`.replace("12:00pm", "12:00pm").replace(/^(\d{1,2}):00am$/, "$1am").replace(/^(\d{1,2}):00pm$/, (_, h) => `${h > 12 ? h - 12 : h}pm`)

  if (fragmentationScore > 50) {
    suggestions.push(`Your fragmentation score is ${fragmentationScore}/100. Try consolidating meetings to mornings to protect afternoon deep work.`)
  }
  if (meetingDebtHours > 2) {
    suggestions.push(`You lost ~${meetingDebtHours} hours this week to context switching. Consider async standups on Tuesdays.`)
  }
  if (githubData) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    suggestions.push(`Your peak coding window is ${peakHourStr} on ${dayNames[githubData.peakDay]}. Block this time as "Deep Work — No Meetings".`)
  }
  if (deepWorkHours < targetDeepHours * 5) {
    suggestions.push(`You got ${deepWorkHours.toFixed(1)}h of deep work this week vs your ${targetDeepHours * 5}h goal. Reduce 1-2 recurring meetings to hit your target.`)
  }

  return NextResponse.json({
    deepWorkHours,
    meetingHours,
    fragmentationScore,
    meetingDebtHours,
    suggestions,
    githubData: githubData ? {
      peakHour: githubData.peakHour,
      peakDay: githubData.peakDay,
      totalCommits: githubData.totalCommits,
      commitHeatmap: JSON.parse(githubData.commitHeatmap)
    } : null,
    calendarData: calendarData ? {
      meetingsPerDay: JSON.parse(calendarData.meetingsPerDay),
      fragmentationScore: calendarData.fragmentationScore,
      meetingDebtHours: calendarData.meetingDebtHours
    } : null
  })
}
```

---

## Step 7: Demo Data API

Create `app/api/demo-data/route.ts`:

```typescript
import { NextResponse } from "next/server"

// Realistic mock data for a senior engineer
const demoHeatmap = [
  // Sun
  [0,0,0,0,0,0,0,0,5,10,15,8,5,3,10,12,8,5,3,2,1,0,0,0],
  // Mon
  [0,0,0,0,0,0,0,10,45,80,95,70,30,20,65,75,85,60,40,20,10,5,2,0],
  // Tue
  [0,0,0,0,0,0,0,8,40,75,90,65,25,15,70,80,75,55,35,15,8,3,1,0],
  // Wed
  [0,0,0,0,0,0,0,12,50,85,100,72,35,22,68,78,88,65,42,22,12,6,2,0],
  // Thu
  [0,0,0,0,0,0,0,9,42,78,92,68,28,18,72,82,78,58,38,18,9,4,1,0],
  // Fri
  [0,0,0,0,0,0,0,6,30,55,70,50,20,10,45,55,60,40,25,10,5,2,0,0],
  // Sat
  [0,0,0,0,0,0,0,0,8,15,20,12,8,5,12,15,10,8,5,3,1,0,0,0],
]

export async function GET() {
  return NextResponse.json({
    fragmentationScore: 67,
    deepWorkHours: 18.5,
    meetingHours: 11.0,
    meetingDebtHours: 3.2,
    peakHour: 10,
    peakDay: 3, // Wednesday
    totalCommits: 847,
    reposAnalyzed: 23,
    commitHeatmap: demoHeatmap,
    meetingsPerDay: { sun: 0, mon: 4, tue: 3, wed: 5, thu: 3, fri: 2, sat: 0 },
    fragmentationTrend: [
      { week: "4 wks ago", score: 52 },
      { week: "3 wks ago", score: 61 },
      { week: "2 wks ago", score: 58 },
      { week: "Last week", score: 73 },
      { week: "This week", score: 67 },
    ],
    deepWorkTrend: [
      { week: "4 wks ago", hours: 22 },
      { week: "3 wks ago", hours: 19 },
      { week: "2 wks ago", hours: 21 },
      { week: "Last week", hours: 16 },
      { week: "This week", hours: 18.5 },
    ],
    suggestions: [
      "Your best coding window is 10am on Wednesdays. Block this as 'Deep Work — No Meetings'.",
      "You lost ~3.2 hours this week to context switching. Try consolidating standups to 9am.",
      "You have 5 meetings on Wednesdays. Moving 2 to Mondays would add ~4 hours of deep work.",
      "Your fragmentation score increased 15 points from last week. Tuesdays look best for deep blocks."
    ]
  })
}
```

---

## Step 8: Settings API

Create `app/api/settings/route.ts`:

```typescript
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id }
  })

  return NextResponse.json(settings || {
    targetDeepHours: 4,
    timezone: "America/Chicago",
    emailReports: true
  })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...body },
    update: body
  })

  return NextResponse.json(settings)
}
```

---

## Step 9: Environment Variables

Create `.env.local`:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=flowstate-dev-secret-change-in-prod
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DATABASE_URL=file:./dev.db
```

Create `.env.example` (same as above but with placeholder values).

---

## Step 10: App Layout & Middleware

Create `middleware.ts`:
```typescript
export { auth as middleware } from "@/auth"
export const config = {
  matcher: ["/dashboard/:path*", "/report/:path*", "/settings/:path*", "/connect/:path*"]
}
```

Create `app/layout.tsx` with proper metadata, dark theme background (`bg-[#0F1117]`), and SessionProvider wrapper.

Create `app/providers.tsx`:
```typescript
"use client"
import { SessionProvider } from "next-auth/react"
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

---

## Step 11: Connect Pages (Minimal — Frontend will style these)

Create `app/connect/github/page.tsx` and `app/connect/calendar/page.tsx` as simple server components that:
1. Check if already connected via session/DB lookup
2. Show connection status
3. Provide sign-in button with appropriate provider
4. After connect, trigger the analyze API

---

## Step 12: Final Steps

1. Run `npx prisma db push` to create SQLite database
2. Verify all API routes compile without TypeScript errors
3. Ensure `npm run build` succeeds
4. Add a proper `next.config.ts` that allows Google/GitHub image domains

---

## IMPORTANT NOTES

- ALL pages must render without crashing even with no session/no data
- Use demo data as fallback on all display pages
- The app should look fully functional in demo mode (no auth required for `/` and for viewing with demo data)
- SQLite file should be in the project root or `/tmp` for easy portability
- Make sure `@/lib/auth` exports work for both server and client components
