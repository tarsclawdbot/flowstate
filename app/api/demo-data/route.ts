import { NextResponse } from "next/server"

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
    peakDay: 3,
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
      "Your best coding window is 10am–12pm on Wednesdays. Block this as 'Deep Work — No Meetings'.",
      "You lost ~3.2 hours this week to context switching. Try consolidating standups to 9am.",
      "You have 5 meetings on Wednesdays. Moving 2 to Mondays would add ~4 hours of deep work.",
      "Your fragmentation score increased 15 points from last week. Tuesdays look best for deep blocks.",
    ],
  })
}
