interface TrendData {
  value: number
  label: string
}

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  sublabel?: string
  trend?: TrendData
  accentColor?: string
}

export function MetricCard({
  label,
  value,
  unit,
  sublabel,
  trend,
  accentColor = "#3B82F6",
}: MetricCardProps) {
  const trendPositive = trend && trend.value > 0
  const trendNegative = trend && trend.value < 0

  return (
    <div
      className="relative rounded-xl border border-[#1E2535] bg-[#0F1219] p-4 overflow-hidden transition-all duration-200 hover:border-[#2A3548] hover:translate-y-[-1px]"
      style={{ borderLeftColor: accentColor, borderLeftWidth: "3px" }}
    >
      <div className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="flex items-end gap-1">
        <span className="font-mono text-3xl font-bold text-[#F1F5F9] leading-none">
          {value}
        </span>
        {unit && (
          <span className="text-[#94A3B8] text-sm mb-0.5">{unit}</span>
        )}
      </div>
      {sublabel && (
        <div className="text-xs text-[#4B5563] mt-1">{sublabel}</div>
      )}
      {trend && (
        <div
          className={`flex items-center gap-1 mt-2 text-xs font-medium ${
            trendPositive
              ? "text-[#EF4444]"
              : trendNegative
              ? "text-[#10B981]"
              : "text-[#94A3B8]"
          }`}
        >
          <span>{trendPositive ? "↑" : trendNegative ? "↓" : "→"}</span>
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </div>
  )
}
