"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { AppShell } from "@/components/AppShell"
import { ScoreRing } from "@/components/ScoreRing"
import { SuggestionCard } from "@/components/SuggestionCard"
import { TrendingUp, TrendingDown, Clock, Zap } from "lucide-react"

interface DemoData {
  fragmentationScore: number
  deepWorkHours: number
  meetingHours: number
  meetingDebtHours: number
  peakHour: number
  peakDay: number
  fragmentationTrend: { week: string; score: number }[]
  deepWorkTrend: { week: string; hours: number }[]
  suggestions: string[]
}

const weeklyBreakdown = [
  { day: "Mon", deep: 4.5, meetings: 2.5, overhead: 2 },
  { day: "Tue", deep: 3.5, meetings: 2, overhead: 2 },
  { day: "Wed", deep: 2.5, meetings: 3.5, overhead: 2 },
  { day: "Thu", deep: 4, meetings: 2, overhead: 2 },
  { day: "Fri", deep: 4, meetings: 1, overhead: 2 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#161B26] border border-[#2A3548] rounded-lg p-3 text-xs shadow-xl">
      <div className="text-[#94A3B8] mb-1.5">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#94A3B8] capitalize">{p.name}:</span>
          <span className="font-mono font-semibold text-[#F1F5F9]">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ReportPage() {
  const [data, setData] = useState<DemoData | null>(null)

  useEffect(() => {
    fetch("/api/demo-data")
      .then((r) => r.json())
      .then(setData)
  }, [])

  if (!data) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  const scoreDelta =
    data.fragmentationTrend[4]?.score - data.fragmentationTrend[3]?.score
  const deepDelta = data.deepWorkTrend[4]?.hours - data.deepWorkTrend[3]?.hours

  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Demo banner */}
        <div className="mb-5 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E3A5F]/40 border border-[#1E3A5F] text-xs text-[#3B82F6]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse flex-shrink-0" />
          Demo Mode — Connect integrations to see your real weekly report
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#F1F5F9]">Weekly Focus Report</h1>
            <p className="text-sm text-[#4B5563]">Feb 24 – Mar 1, 2026</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A3548] text-xs text-[#94A3B8]">
            <Zap size={11} />
            Week 9 of 2026
          </div>
        </div>

        {/* Score summary row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="flex items-center justify-center p-4 rounded-xl border border-[#1E2535] bg-[#0F1219]">
            <ScoreRing score={data.fragmentationScore} size={100} label="Fragmentation" />
          </div>

          <div className="p-4 rounded-xl border border-[#1E2535] bg-[#0F1219]">
            <div className="text-[10px] text-[#4B5563] uppercase tracking-wider mb-1">Deep Work</div>
            <div className="text-3xl font-mono font-bold text-[#3B82F6]">{data.deepWorkHours}h</div>
            <div className={`flex items-center gap-1 mt-1.5 text-xs ${deepDelta >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
              {deepDelta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {deepDelta >= 0 ? "+" : ""}{deepDelta.toFixed(1)}h vs last week
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#1E2535] bg-[#0F1219]">
            <div className="text-[10px] text-[#4B5563] uppercase tracking-wider mb-1">Meetings</div>
            <div className="text-3xl font-mono font-bold text-[#F59E0B]">{data.meetingHours}h</div>
            <div className="text-xs text-[#4B5563] mt-1.5">Across 17 events this week</div>
          </div>

          <div className="p-4 rounded-xl border border-[#1E2535] bg-[#0F1219]">
            <div className="text-[10px] text-[#4B5563] uppercase tracking-wider mb-1">Meeting Debt</div>
            <div className="text-3xl font-mono font-bold text-[#EF4444]">{data.meetingDebtHours}h</div>
            <div className="text-xs text-[#4B5563] mt-1.5">Lost to context switching</div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Fragmentation trend */}
          <div className="rounded-xl border border-[#1E2535] bg-[#0F1219] p-5">
            <h2 className="font-semibold text-[#F1F5F9] mb-1">Fragmentation Trend</h2>
            <p className="text-xs text-[#4B5563] mb-4">Lower is better</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={data.fragmentationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
                <XAxis dataKey="week" tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                <ReferenceLine y={50} stroke="#2A3548" strokeDasharray="4 4" label={{ value: "Good", fill: "#4B5563", fontSize: 9, position: "right" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={{ fill: "#F97316", r: 3 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Daily breakdown */}
          <div className="rounded-xl border border-[#1E2535] bg-[#0F1219] p-5">
            <h2 className="font-semibold text-[#F1F5F9] mb-1">Daily Time Breakdown</h2>
            <p className="text-xs text-[#4B5563] mb-4">Hours per day</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="deep" fill="#3B82F6" name="deep" radius={[2, 2, 0, 0]} stackId="a" />
                <Bar dataKey="meetings" fill="#F59E0B" name="meetings" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="overhead" fill="#1E2535" name="overhead" radius={[2, 2, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deep work trend */}
        <div className="rounded-xl border border-[#1E2535] bg-[#0F1219] p-5 mb-6">
          <h2 className="font-semibold text-[#F1F5F9] mb-1">Deep Work Hours</h2>
          <p className="text-xs text-[#4B5563] mb-4">5-week trend</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={data.deepWorkTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
              <XAxis dataKey="week" tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Peak window callout */}
        <div className="p-4 rounded-xl border border-[#06B6D4]/30 bg-[#06B6D4]/5 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-[#06B6D4]" />
          </div>
          <div>
            <div className="font-semibold text-[#F1F5F9] text-sm">Your Peak Coding Window</div>
            <div className="text-[#06B6D4] font-mono text-lg font-bold">10am – 12pm · Wednesdays</div>
            <div className="text-xs text-[#94A3B8] mt-0.5">Based on 847 commits across 23 repos over 90 days</div>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <h2 className="font-semibold text-[#F1F5F9] mb-3">Personalized Recommendations</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.suggestions.map((s, i) => (
              <SuggestionCard key={i} suggestion={s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
