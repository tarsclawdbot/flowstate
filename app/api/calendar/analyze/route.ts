import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { google } from "googleapis"
import { NextResponse } from "next/server"

interface CalEvent {
  start: Date
  end: Date
}

function calculateFragmentationScore(events: CalEvent[]): number {
  const byDay: Record<string, CalEvent[]> = {}
  for (const event of events) {
    const day = event.start.toISOString().split("T")[0]
    if (!byDay[day]) byDay[day] = []
    byDay[day].push(event)
  }

  let totalFragmentation = 0
  let dayCount = 0

  for (const dayEvents of Object.values(byDay)) {
    const sorted = dayEvents.sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    )
    let isolatedMeetings = 0
    let brokenFlowBlocks = 0

    for (let i = 0; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const next = sorted[i + 1]
      const curr = sorted[i]

      const gapBefore = prev
        ? (curr.start.getTime() - prev.end.getTime()) / 60000
        : 120
      const gapAfter = next
        ? (next.start.getTime() - curr.end.getTime()) / 60000
        : 120

      if (gapBefore > 90 && gapAfter > 90) isolatedMeetings++
      if (gapBefore > 120 && gapAfter > 120) brokenFlowBlocks++
    }

    totalFragmentation += isolatedMeetings * 1.5 + brokenFlowBlocks * 2
    dayCount++
  }

  if (dayCount === 0) return 0
  const weeklyAvg = totalFragmentation / dayCount
  return Math.min(100, Math.round(weeklyAvg * 8))
}

function calculateMeetingDebt(events: CalEvent[]): number {
  const byDay: Record<string, CalEvent[]> = {}
  for (const event of events) {
    const day = event.start.toISOString().split("T")[0]
    if (!byDay[day]) byDay[day] = []
    byDay[day].push(event)
  }

  let debtMinutes = 0
  for (const dayEvents of Object.values(byDay)) {
    const sorted = dayEvents.sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    )
    for (let i = 0; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const next = sorted[i + 1]
      if (prev && next) {
        const gapBefore =
          (sorted[i].start.getTime() - prev.end.getTime()) / 60000
        const gapAfter =
          (next.start.getTime() - sorted[i].end.getTime()) / 60000
        if (gapBefore + gapAfter > 120) {
          debtMinutes += 23
        }
      }
    }
  }
  return Math.round((debtMinutes / 60) * 10) / 10
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" },
  })

  if (!account?.access_token) {
    return NextResponse.json(
      { error: "Google Calendar not connected" },
      { status: 400 }
    )
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token ?? undefined,
  })

  const calendar = google.calendar({ version: "v3", auth: oauth2Client })

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  let rawEvents: any[] = []
  try {
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: weekStart.toISOString(),
      timeMax: weekEnd.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    })
    rawEvents = response.data.items || []
  } catch {
    return NextResponse.json({ error: "Calendar API error" }, { status: 500 })
  }

  const events: CalEvent[] = rawEvents
    .filter((e) => e.start?.dateTime)
    .map((e) => ({
      start: new Date(e.start.dateTime),
      end: new Date(e.end?.dateTime || e.start.dateTime),
    }))

  let meetingMinutes = 0
  const meetingsPerDay: Record<string, number> = {
    sun: 0, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0,
  }
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

  for (const event of events) {
    meetingMinutes +=
      (event.end.getTime() - event.start.getTime()) / 60000
    meetingsPerDay[days[event.start.getDay()]]++
  }

  const weeklyMeetingHours = Math.round((meetingMinutes / 60) * 10) / 10
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
      lastSyncedAt: new Date(),
    },
  })

  return NextResponse.json({
    success: true,
    weeklyMeetingHours,
    fragmentationScore,
    meetingDebtHours,
  })
}
