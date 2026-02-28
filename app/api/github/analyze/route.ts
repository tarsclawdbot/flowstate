import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Octokit } from "@octokit/rest"
import { NextResponse } from "next/server"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
  })

  if (!account?.access_token) {
    return NextResponse.json({ error: "GitHub not connected" }, { status: 400 })
  }

  const octokit = new Octokit({ auth: account.access_token })

  // 7 days x 24 hours heatmap
  const heatmap: number[][] = Array(7)
    .fill(null)
    .map(() => Array(24).fill(0))
  let totalCommits = 0
  let reposAnalyzed = 0

  try {
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: "pushed",
      per_page: 30,
      type: "owner",
    })

    const since = new Date(
      Date.now() - 90 * 24 * 60 * 60 * 1000
    ).toISOString()

    for (const repo of repos.slice(0, 20)) {
      try {
        const { data: commits } = await octokit.repos.listCommits({
          owner: repo.owner.login,
          repo: repo.name,
          since,
          per_page: 100,
        })

        reposAnalyzed++
        for (const commit of commits) {
          const date = new Date(commit.commit.author?.date || "")
          const day = date.getDay()
          const hour = date.getHours()
          heatmap[day][hour]++
          totalCommits++
        }
      } catch {
        // Skip repos we can't access
      }
    }
  } catch {
    return NextResponse.json({ error: "GitHub API error" }, { status: 500 })
  }

  // Find peak
  let peakHour = 0,
    peakDay = 0,
    peakVal = 0
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (heatmap[d][h] > peakVal) {
        peakVal = heatmap[d][h]
        peakHour = h
        peakDay = d
      }
    }
  }

  // Normalize to 0-100
  const normalizedHeatmap = heatmap.map((row) =>
    row.map((val) => (peakVal > 0 ? Math.round((val / peakVal) * 100) : 0))
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
      lastSyncedAt: new Date(),
    },
  })

  return NextResponse.json({
    success: true,
    totalCommits,
    reposAnalyzed,
    peakHour,
    peakDay,
  })
}
