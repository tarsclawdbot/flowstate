import Link from "next/link"
import { CheckCircle, X, Zap, ArrowLeft } from "lucide-react"

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    desc: "Get started, no credit card",
    features: [
      "GitHub commit analysis",
      "Flow Windows heatmap (7×24)",
      "Fragmentation Score",
      "1 week of history",
    ],
    missing: [
      "Google Calendar integration",
      "Meeting Debt tracking",
      "Weekly Focus Reports",
      "Smart calendar suggestions",
      "90-day history",
    ],
    cta: "Start Free",
    ctaHref: "/connect/github",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/month",
    desc: "For serious engineers",
    features: [
      "Everything in Free",
      "Google Calendar integration",
      "Meeting Debt calculator",
      "90 days of history",
      "Weekly Focus Reports",
      "Smart suggestions",
      "Fragmentation trend",
    ],
    missing: [],
    cta: "Start 14-day Free Trial",
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
      "Admin controls",
      "Priority support",
      "SSO / SAML",
    ],
    missing: [],
    cta: "Contact Sales",
    ctaHref: "mailto:hello@flowstate.dev",
    highlight: false,
  },
]

const faqs = [
  {
    q: "Is the free plan really free?",
    a: "Yes. GitHub analysis and the heatmap are free forever. No credit card required.",
  },
  {
    q: "What happens when my trial ends?",
    a: "You're automatically downgraded to the Free plan. Your data is preserved, you just lose Pro features.",
  },
  {
    q: "Can I change plans?",
    a: "Yes, upgrade or downgrade anytime. Billing is prorated.",
  },
  {
    q: "Is there an annual discount?",
    a: "Yes, 20% off for annual billing. Contact us for team annual pricing.",
  },
]

export default function PricingPage() {
  return (
    <div className="bg-[#0A0C10] text-[#F1F5F9] min-h-screen">
      <nav className="border-b border-[#1E2535] bg-[#0A0C10]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#1E3A5F] flex items-center justify-center">
              <Zap size={12} className="text-[#3B82F6]" />
            </div>
            <span className="font-bold text-sm tracking-tight">FlowState</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors">
            <ArrowLeft size={14} />
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-[#94A3B8] text-lg">
            Start free. Pay when it saves you more time than it costs.
          </p>
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                tier.highlight
                  ? "border-[#3B82F6] bg-[#0F1B30]"
                  : "border-[#1E2535] bg-[#0F1219]"
              }`}
              style={
                tier.highlight
                  ? { boxShadow: "0 0 30px rgba(59, 130, 246, 0.12)" }
                  : undefined
              }
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-[#3B82F6] text-white text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-2">
                  {tier.name}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-mono font-bold">{tier.price}</span>
                  <span className="text-[#94A3B8] text-sm mb-1.5">{tier.period}</span>
                </div>
                <div className="text-xs text-[#4B5563]">{tier.desc}</div>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                    <CheckCircle size={13} className="text-[#10B981] mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
                {tier.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#4B5563] line-through">
                    <X size={13} className="mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={tier.ctaHref}
                className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all duration-200 hover:translate-y-[-1px] ${
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

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Common questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-[#1E2535] p-5">
                <div className="font-medium text-[#F1F5F9] mb-2">{faq.q}</div>
                <div className="text-sm text-[#94A3B8] leading-relaxed">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
