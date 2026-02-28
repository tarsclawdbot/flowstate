"use client"

import { useEffect, useState } from "react"
import { ScoreRing } from "@/components/ScoreRing"
import { HeatmapGrid } from "@/components/HeatmapGrid"
import { MetricCard } from "@/components/MetricCard"
import { SuggestionCard } from "@/components/SuggestionCard"
import { AppShell } from "@/components/AppShell"
import { RefreshCw, Github, Calendar } from "lucide-react"

interface DemoData {
  fragmentationScore: number
  deepWorkHours: number
  meetingHours: number
  meetingDebtHours: number
  peakHour: number
  peakDay: number
  totalCommits: number
  reposAnalyzed: number
  commitHeatmap: number[][]
  suggestions: string[]
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function formatHour(h: number) {
  if (h === 0) return "12am"
  if (h < 12) return `${h}am`
  if (h === 12) return "12pm"
  return `${h - 12}pm`
}

export default function DashboardPage() {
  const [data, setData] = useState<DemoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetch("/api/demo-data")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 1500)
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  if (!data) return null

  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Demo banner */}
        <div className="mb-5 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E3A5F]/40 border border-[#1E3A5F] text-xs text-[#3B82F6]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse flex-shrink-0" />
          Demo Mode — Connect GitHub to see your real data
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#F1F5F9]">Dashboard</h1>
            <p className="text-sm text-[#4B5563]">Week of Feb 24 – Mar 1, 2026</p>
          </div>
          <button
            onClick={handleSync}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2A3548] text-xs text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#3B82F6] transition-all"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            Sync
          </button>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="col-span-2 lg:col-span-1 flex items-center justify-center p-4 rounded-xl border border-[#1E2535] bg-[#0F1219]">
            <ScoreRing score={data.fragmentationScore} size={110} />
          </div>
          <MetricCard
            label="Deep Work"
            value={data.deepWorkHours}
            unit="hrs"
            sublabel="This week"
            trend={{ value: -8, label: "vs last week" }}
            accentColor="#3B82F6"
          />
          <MetricCard
            label="Meetings"
            value={data.meetingHours}
            unit="hrs"
            sublabel="This week"
            trend={{ value: 15, label: "vs last week" }}
            accentColor="#F59E0B"
          />
          <MetricCard
            label="Meeting Debt"
            value={data.meetingDebtHours}
            unit="hrs"
            sublabel="Lost to context switching"
            trend={{ value: 5, label: "vs last week" }}
            accentColor="#EF4444"
          />
        </div>

        {/* Heatmap */}
        <div className="rounded-xl border border-[#1E2535] bg-[#0F1219] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[#F1F5F9]">Flow Windows</h2>
              <p className="text-xs text-[#4B5563] mt-0.5">90 days of GitHub commit activity</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#4B5563]">Peak window</div>
              <div className="text-sm font-semibold text-[#06B6D4]">
                {formatHour(data.peakHour)} · {DAYS[data.peakDay]}
              </div>
            </div>
          </div>
          <HeatmapGrid
            data={data.commitHeatmap}
            peakDay={data.peakDay}
            peakHour={data.peakHour}
            compact
          />
          <div className="mt-3 flex items-center gap-3 text-xs text-[#4B5563]">
            <span>{data.totalCommits} commits analyzed</span>
            <span>·</span>
            <span>{data.reposAnalyzed} repos</span>
            <span>·</span>
            <span>Last 90 days</span>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mb-6">
          <h2 className="font-semibold text-[#F1F5F9] mb-3">This Week&apos;s Recommendations</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.suggestions.map((s, i) => (
              <SuggestionCard key={i} suggestion={s} index={i} />
            ))}
          </div>
        </div>

        {/* Connect prompts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl border border-dashed border-[#2A3548] flex items-center gap-3 hover:border-[#3B82F6] transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-[#161B26] flex items-center justify-center flex-shrink-0">
              <Github size={18} className="text-[#94A3B8]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#F1F5F9]">Connect GitHub</div>
              <div className="text-xs text-[#4B5563]">See your real commit patterns</div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-dashed border-[#2A3548] flex items-center gap-3 hover:border-[#3B82F6] transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-[#161B26] flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-[#94A3B8]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#F1F5F9]">Connect Google Calendar</div>
              <div className="text-xs text-[#4B5563]">Calculate your fragmentation score</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
