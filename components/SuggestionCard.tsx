import { Lightbulb } from "lucide-react"

interface SuggestionCardProps {
  suggestion: string
  index?: number
}

export function SuggestionCard({ suggestion, index = 0 }: SuggestionCardProps) {
  const impacts = ["High Impact", "High Impact", "Medium Impact", "Medium Impact"]
  const impact = impacts[index] || "Medium Impact"
  const impactColor = impact === "High Impact" ? "#10B981" : "#F59E0B"

  return (
    <div className="flex gap-3 p-3 rounded-lg border border-[#1E2535] bg-[#0F1219] hover:border-[#2A3548] transition-all duration-200 hover:translate-y-[-1px]" style={{ borderLeftColor: "#3B82F6", borderLeftWidth: "3px" }}>
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-7 h-7 rounded-md bg-[#1E3A5F] flex items-center justify-center">
          <Lightbulb size={14} className="text-[#3B82F6]" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#F1F5F9] leading-relaxed">{suggestion}</p>
        <span
          className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{
            color: impactColor,
            backgroundColor: `${impactColor}18`,
          }}
        >
          {impact}
        </span>
      </div>
    </div>
  )
}
