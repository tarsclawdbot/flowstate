import Link from "next/link"
import { Github, ArrowRight, Zap, GitCommit, BarChart2, Clock, Lightbulb, TrendingUp, CheckCircle, X } from "lucide-react"

const DEMO_HEATMAP = [
  [0,0,0,0,0,0,0,0,5,10,15,8,5,3,10,12,8,5,3,2,1,0,0,0],
  [0,0,0,0,0,0,0,10,45,80,95,70,30,20,65,75,85,60,40,20,10,5,2,0],
  [0,0,0,0,0,0,0,8,40,75,90,65,25,15,70,80,75,55,35,15,8,3,1,0],
  [0,0,0,0,0,0,0,12,50,85,100,72,35,22,68,78,88,65,42,22,12,6,2,0],
  [0,0,0,0,0,0,0,9,42,78,92,68,28,18,72,82,78,58,38,18,9,4,1,0],
  [0,0,0,0,0,0,0,6,30,55,70,50,20,10,45,55,60,40,25,10,5,2,0,0],
  [0,0,0,0,0,0,0,0,8,15,20,12,8,5,12,15,10,8,5,3,1,0,0,0],
]

function MiniHeatmap() {
  const hours = Array.from({ length: 16 }, (_, i) => i + 6)
  const days = ["S","M","T","W","T","F","S"]
  return (
    <div className="flex flex-col gap-0.5">
      {DEMO_HEATMAP.map((row, d) => (
        <div key={d} className="flex gap-0.5 items-center">
          <span className="text-[8px] text-[#4B5563] w-3">{days[d]}</span>
          {hours.map((h) => {
            const v = row[h] || 0
            const alpha = v === 0 ? 0 : 0.15 + (v / 100) * 0.85
            const isPeak = d === 3 && h === 10
            return (
              <div
                key={h}
                className="w-2.5 h-2.5 rounded-[1px]"
                style={{
                  backgroundColor: v === 0 ? "#1E2535" : `rgba(6,182,212,${alpha})`,
                  boxShadow: isPeak ? "0 0 6px rgba(6,182,212,0.9)" : undefined,
                }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

const features = [
  {
    icon: GitCommit,
    title: "GitHub Intelligence",
    desc: "Analyzes 90 days of commit history to find when you're actually in the zone — not when your manager thinks you are.",
    color: "#3B82F6",
  },
  {
    icon: BarChart2,
    title: "Fragmentation Score™",
    desc: "A single 0–100 number showing how broken your week is. Track it weekly. Watch it drop.",
    color: "#06B6D4",
  },
  {
    icon: Clock,
    title: "Meeting Debt",
    desc: "Based on interruption science: every isolated meeting costs 23 min of recovery. We calculate your weekly tab.",
    color: "#8B5CF6",
  },
  {
    icon: TrendingUp,
    title: "Flow Windows Heatmap",
    desc: "A 7×24 grid of your actual coding patterns. See your real rhythms — day of week, hour by hour.",
    color: "#10B981",
  },
  {
    icon: Lightbulb,
    title: "Smart Suggestions",
    desc: "Concrete, personalized changes. 'Move your Tuesday standup 30 min earlier. Gain 4h of deep work.'",
    color: "#F59E0B",
  },
  {
    icon: Zap,
    title: "Weekly Reports",
    desc: "Friday afternoon: deep work hours, fragmentation trend, wins, and exactly what to change next week.",
    color: "#EF4444",
  },
]

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    desc: "For curious engineers",
    features: [
      "GitHub commit analysis",
      "Flow Windows heatmap",
      "Fragmentation Score",
      "1 week of history",
    ],
    missing: ["Calendar integration", "Meeting Debt tracking", "Weekly reports", "Smart suggestions"],
    cta: "Get Started Free",
    ctaHref: "/connect/github",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/month",
    desc: "For engineers who ship",
    features: [
      "Everything in Free",
      "Google Calendar integration",
      "Meeting Debt calculator",
      "90 days of history",
      "Weekly Focus Reports",
      "Smart suggestions",
    ],
    missing: [],
    cta: "Start Free Trial",
    ctaHref: "/connect/github",
    highlight: true,
  },
  {
    name: "Team",
    price: "$12",
    period: "/user/month",
    desc: "For engineering orgs",
    features: [
      "Everything in Pro",
      "Team fragmentation dashboard",
      "Manager overview (opt-in)",
      "Slack weekly digest",
      "Priority support",
    ],
    missing: [],
    cta: "Contact Sales",
    ctaHref: "mailto:hello@flowstate.dev",
    highlight: false,
  },
]

export default function LandingPage() {
  return (
    <div className="bg-[#0A0C10] text-[#F1F5F9] overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1E2535] bg-[#0A0C10]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#1E3A5F] flex items-center justify-center">
              <Zap size={12} className="text-[#3B82F6]" />
            </div>
            <span className="font-bold text-sm tracking-tight">FlowState</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-sm text-[#94A3B8] hover:text-[#F1F5F9] hidden sm:block transition-colors">
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="text-sm px-3 py-1.5 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-14 grid-pattern">
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(59,130,246,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#1E3A5F] bg-[#0F1219] text-xs text-[#3B82F6] font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
              Made for Engineers
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Know when you{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                actually
              </span>{" "}
              code best.
            </h1>

            <p className="text-lg sm:text-xl text-[#94A3B8] leading-relaxed max-w-xl mb-8">
              FlowState connects your GitHub history to your calendar. No more guessing.
              Your real peak hours, automatically discovered and defended.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link
                href="/connect/github"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition-all duration-200 hover:translate-y-[-1px] glow-blue"
              >
                <Github size={18} />
                Connect GitHub — Free
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#2A3548] text-[#94A3B8] font-medium hover:text-[#F1F5F9] hover:border-[#3B82F6] transition-all duration-200"
              >
                See Demo Data
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-[#4B5563]">
              <span><span className="text-[#94A3B8] font-mono font-semibold">847</span> avg commits analyzed</span>
              <span><span className="text-[#94A3B8] font-mono font-semibold">3.2h</span> avg weekly debt recovered</span>
              <span><span className="text-[#94A3B8] font-mono font-semibold">67</span> avg fragmentation score</span>
            </div>
          </div>

          {/* Demo card — floating right on desktop */}
          <div className="mt-12 lg:mt-0 lg:absolute lg:right-4 lg:top-1/2 lg:-translate-y-1/2 xl:right-0">
            <div className="rounded-2xl border border-[#1E2535] bg-[#0F1219] p-5 w-full max-w-xs shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-[#4B5563] uppercase tracking-wider">Fragmentation</div>
                  <div className="text-3xl font-mono font-bold text-[#F97316]">67<span className="text-base text-[#94A3B8] font-normal">/100</span></div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#4B5563]">Peak Window</div>
                  <div className="text-sm font-semibold text-[#06B6D4]">Wed 10am</div>
                  <div className="text-xs text-[#4B5563]">↑ 847 commits</div>
                </div>
              </div>
              <MiniHeatmap />
              <div className="mt-3 p-2.5 rounded-lg bg-[#161B26] border border-[#1E3A5F]">
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  💡 Your best window is <span className="text-[#3B82F6]">10am Wed</span>. You have a standup at 10:30. Moving it saves <span className="text-[#10B981]">~4h/week</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-32 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Everything you need to protect deep work
          </h2>
          <p className="text-[#94A3B8] text-lg max-w-xl mx-auto">
            Built specifically for engineers. Not a generic calendar tool with a "developer mode".
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="p-5 rounded-xl border border-[#1E2535] bg-[#0F1219] hover:border-[#2A3548] transition-all duration-200 hover:translate-y-[-2px]"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${feature.color}18` }}
                >
                  <Icon size={18} style={{ color: feature.color }} />
                </div>
                <h3 className="font-semibold text-[#F1F5F9] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-32 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-[#94A3B8] text-lg">No tricks. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                tier.highlight
                  ? "border-[#3B82F6] bg-[#0F1B30] glow-blue"
                  : "border-[#1E2535] bg-[#0F1219]"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-[#3B82F6] text-white text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-4">
                <div className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-1">{tier.name}</div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-mono font-bold text-[#F1F5F9]">{tier.price}</span>
                  <span className="text-[#94A3B8] text-sm mb-1">{tier.period}</span>
                </div>
                <div className="text-xs text-[#4B5563] mt-1">{tier.desc}</div>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                    <CheckCircle size={14} className="text-[#10B981] mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
                {tier.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#4B5563]">
                    <X size={14} className="mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.ctaHref}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-all duration-200 ${
                  tier.highlight
                    ? "bg-[#3B82F6] text-white hover:bg-[#2563EB]"
                    : "border border-[#2A3548] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#3B82F6]"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E2535] py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-[#3B82F6]" />
            <span className="text-sm text-[#4B5563]">Built with ⚡ for engineers who ship</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#4B5563]">
            <Link href="https://github.com/tarsclawdbot" className="hover:text-[#94A3B8] transition-colors">GitHub</Link>
            <Link href="/pricing" className="hover:text-[#94A3B8] transition-colors">Pricing</Link>
            <Link href="/dashboard" className="hover:text-[#94A3B8] transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
