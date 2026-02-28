"use client"

interface ScoreRingProps {
  score: number
  size?: number
  label?: string
}

export function ScoreRing({ score, size = 120, label = "Fragmentation" }: ScoreRingProps) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score <= 25
      ? "#10B981"
      : score <= 50
      ? "#F59E0B"
      : score <= 75
      ? "#F97316"
      : "#EF4444"

  const statusLabel =
    score <= 25 ? "Excellent" : score <= 50 ? "Good" : score <= 75 ? "Concerning" : "Critical"

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1E2535"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.2s ease-out, stroke 0.3s ease",
              filter: `drop-shadow(0 0 6px ${color}60)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono font-bold leading-none"
            style={{ fontSize: size * 0.28, color }}
          >
            {score}
          </span>
          <span className="text-[#94A3B8] text-xs mt-0.5">/100</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-[#F1F5F9]">{label}</div>
        <div className="text-xs mt-0.5" style={{ color }}>
          {statusLabel}
        </div>
      </div>
    </div>
  )
}
