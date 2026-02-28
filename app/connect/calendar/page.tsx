"use client"

import { signIn } from "next-auth/react"
import { Calendar, Shield, Clock, ChevronDown } from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { useState } from "react"

const faqs = [
  {
    q: "What calendar data do you access?",
    a: "Only event start and end times. We never read event titles, attendees, descriptions, video links, or any other details.",
  },
  {
    q: "Which calendars do you analyze?",
    a: "Only your primary Google Calendar. We don't access shared or secondary calendars unless you add them in settings.",
  },
  {
    q: "How is fragmentation calculated?",
    a: "We look at how many isolated meetings break potential 2-hour focus blocks. Each interruption adds to your fragmentation score (0–100).",
  },
  {
    q: "Can I disconnect?",
    a: "Yes, anytime from Settings. All calendar analysis data is deleted immediately.",
  },
]

export default function ConnectCalendarPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-xl mx-auto">
        <div className="text-center mb-8 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0F1219] border border-[#2A3548] mb-5">
            <Calendar size={32} className="text-[#3B82F6]" />
          </div>

          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">Connect Google Calendar</h1>
          <p className="text-[#94A3B8] text-sm leading-relaxed max-w-sm mx-auto">
            We&apos;ll analyze your meeting patterns to calculate your Fragmentation Score™
            and Meeting Debt — what&apos;s really eating your deep work time.
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
              <Clock size={14} className="text-[#94A3B8] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-[#F1F5F9] font-medium">calendar.readonly</div>
                <div className="text-xs text-[#4B5563]">Read event start/end times from your primary calendar</div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy note */}
        <div className="p-3 rounded-lg bg-[#0A1F1A] border border-[#10B981]/20 mb-6 flex items-start gap-2">
          <Shield size={13} className="text-[#10B981] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#94A3B8]">
            We never read event titles, attendees, or descriptions. Only timestamps (when events start and end) are used to compute your fragmentation score.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition-all duration-200 hover:translate-y-[-1px] mb-6 text-sm"
        >
          <Calendar size={18} />
          Connect with Google Calendar
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
