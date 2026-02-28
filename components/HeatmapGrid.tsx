"use client"

interface HeatmapGridProps {
  data: number[][]  // [7 days][24 hours], values 0-100
  peakDay?: number
  peakHour?: number
  compact?: boolean
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOURS_FULL = Array.from({ length: 24 }, (_, i) => i)
const HOURS_COMPACT = Array.from({ length: 16 }, (_, i) => i + 6) // 6am-10pm

function getCellColor(value: number): string {
  if (value === 0) return "#1E2535"
  const alpha = 0.15 + (value / 100) * 0.85
  return `rgba(6, 182, 212, ${alpha})`
}

export function HeatmapGrid({ data, peakDay, peakHour, compact = false }: HeatmapGridProps) {
  const hours = compact ? HOURS_COMPACT : HOURS_FULL
  const cellSize = compact ? "w-3 h-3 sm:w-4 sm:h-4" : "w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[320px]">
        {/* Hour labels */}
        <div className="flex mb-1 ml-8">
          {hours.map((h, i) => (
            <div
              key={h}
              className="flex-1 text-center"
              style={{ minWidth: compact ? "14px" : "12px" }}
            >
              {(h === 0 || h === 6 || h === 12 || h === 18) && (
                <span className="text-[9px] text-[#4B5563]">
                  {h === 0 ? "12a" : h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {DAYS.map((day, dayIdx) => (
          <div key={day} className="flex items-center mb-0.5 gap-0.5">
            <span className="text-[10px] text-[#4B5563] w-7 text-right pr-1 flex-shrink-0">
              {day}
            </span>
            <div className="flex gap-0.5">
              {hours.map((hourIdx) => {
                const value = data[dayIdx]?.[hourIdx] ?? 0
                const isPeak = dayIdx === peakDay && hourIdx === peakHour
                return (
                  <div
                    key={hourIdx}
                    className={`${cellSize} rounded-[2px] flex-shrink-0 ${isPeak ? "heatmap-peak" : ""}`}
                    style={{
                      backgroundColor: getCellColor(value),
                      boxShadow: isPeak ? "0 0 8px rgba(6, 182, 212, 0.8)" : undefined,
                    }}
                    title={`${day} ${hourIdx}:00 — ${value}% activity`}
                  />
                )
              })}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-2 mt-2 ml-8">
          <span className="text-[10px] text-[#4B5563]">Less</span>
          {[0, 25, 50, 75, 100].map((v) => (
            <div
              key={v}
              className="w-3 h-3 rounded-[2px]"
              style={{ backgroundColor: getCellColor(v) }}
            />
          ))}
          <span className="text-[10px] text-[#4B5563]">More</span>
        </div>
      </div>
    </div>
  )
}
