"use client"

import { signIn } from "next-auth/react"
import { Github, Shield, GitCommit, Clock, ChevronDown } from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { useState } from "react"

const faqs = [
  {
    q: "What data do you access?",
    a: "We read commit timestamps, repository names, and your username. We never read your code, file contents, commit messages, or diffs.",
  },
  {
    q: "How often does it sync?",
    a: "We analyze the last 90 days when you first connect, then sync weekly. You can trigger a manual sync anytime.",
  },
  {
    q: "Can I disconnect?",
    a: "Yes, anytime. Go to Settings and click Disconnect. All your GitHub data is deleted immediately.",
  },
  {
    q: "Do you store my code?",
    a: "Never. We only store aggregated statistics: the count of commits per hour-of-day and day-of-week. Nothing else.",
  },
]

export default function ConnectGitHubPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-xl mx-auto">
        <div className="text-center mb-8 pt-4">
          {/* GitHub logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0F1219] border border-[#2A3548] mb-5">
            <Github size={32} className="text-[#F1F5F9]" />
          </div>

          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">Connect GitHub</h1>
          <p className="text-[#94A3B8] text-sm leading-relaxed max-w-sm mx-auto">
            We&apos;ll analyze your last 90 days of commits to discover when you&apos;re
            actually in flow — not when your calendar says you should be.
          </p>
        </div>

        {/* Permissions */}
        <div className="rounded-xl border border-[#1E2535] bg-[#0F1219] p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-[#10B981]" />
            <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Read-only access</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <GitCommit size={14} className="text-[#94A3B8] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-[#F1F5F9] font-medium">repo (read)</div>
                <div className="text-xs text-[#4B5563]">List your repositories and read commit timestamps</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={14} className="text-[#94A3B8] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-[#F1F5F9] font-medium">user:email</div>
                <div className="text-xs text-[#4B5563]">Identify your commits across repos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy note */}
        <div className="p-3 rounded-lg bg-[#0A1F1A] border border-[#10B981]/20 mb-6 flex items-start gap-2">
          <Shield size={13} className="text-[#10B981] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#94A3B8]">
            We never read your code. Only commit timestamps (date + time) are used to build your flow heatmap. No code, no messages, no diffs.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#F1F5F9] text-[#0A0C10] font-semibold hover:bg-white transition-all duration-200 hover:translate-y-[-1px] mb-6 text-sm"
        >
          <Github size={18} />
          Connect with GitHub
        </button>

        {/* FAQ */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-[#4B5563] uppercase tracking-wider mb-3">FAQ</div>
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-lg border border-[#1E2535] overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-[#F1F5F9] hover:bg-[#161B26] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={14}
                  className={`text-[#4B5563] transition-transform flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 text-sm text-[#94A3B8] leading-relaxed border-t border-[#1E2535] pt-2">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
