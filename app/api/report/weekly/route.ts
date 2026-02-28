import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [githubData, calendarData, settings] = await Promise.all([
    prisma.gitHubSyncData.findUnique({ where: { userId: session.user.id } }),
    prisma.calendarSyncData.findUnique({ where: { userId: session.user.id } }),
    prisma.userSettings.findUnique({ where: { userId: session.user.id } }),
  ])

  const targetDeepHours = settings?.targetDeepHours || 4
  const meetingHours = calendarData?.weeklyMeetingHours || 0
  const deepWorkHours = Math.max(0, 40 - meetingHours - 10)
  const fragmentationScore = calendarData?.fragmentationScore || 0
  const meetingDebtHours = calendarData?.meetingDebtHours || 0

  const suggestions: string[] = []
  const meetingsPerDay = calendarData
    ? JSON.parse(calendarData.meetingsPerDay)
    : {}
  const peakHour = githubData?.peakHour ?? 10
  const peakHourLabel =
    peakHour === 0
      ? "12am"
      : peakHour < 12
      ? `${peakHour}am`
      : peakHour === 12
      ? "12pm"
      : `${peakHour - 12}pm`

  if (fragmentationScore > 50) {
    suggestions.push(
      `Your fragmentation score is ${fragmentationScore}/100. Consolidate meetings to mornings to protect afternoon deep work.`
    )
  }
  if (meetingDebtHours > 2) {
    suggestions.push(
      `You lost ~${meetingDebtHours}h this week to context switching. Consider async standups to reclaim 2–3h.`
    )
  }
  if (githubData) {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]
    suggestions.push(
      `Your peak coding window is ${peakHourLabel} on ${dayNames[githubData.peakDay]}. Block this as "Deep Work — No Meetings".`
    )
  }
  if (deepWorkHours < targetDeepHours * 5) {
    suggestions.push(
      `You got ${deepWorkHours.toFixed(1)}h of deep work vs your ${targetDeepHours * 5}h goal. Reduce 1–2 recurring meetings.`
    )
  }

  return NextResponse.json({
    deepWorkHours,
    meetingHours,
    fragmentationScore,
    meetingDebtHours,
    suggestions,
    githubData: githubData
      ? {
          peakHour: githubData.peakHour,
          peakDay: githubData.peakDay,
          totalCommits: githubData.totalCommits,
          commitHeatmap: JSON.parse(githubData.commitHeatmap),
        }
      : null,
    calendarData: calendarData
      ? {
          meetingsPerDay: JSON.parse(calendarData.meetingsPerDay),
          fragmentationScore: calendarData.fragmentationScore,
          meetingDebtHours: calendarData.meetingDebtHours,
        }
      : null,
  })
}
