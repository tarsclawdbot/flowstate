"use client"

import { useState } from "react"
import { AppShell } from "@/components/AppShell"
import { Github, Calendar, Save, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const [targetHours, setTargetHours] = useState(4)
  const [timezone, setTimezone] = useState("America/Chicago")
  const [emailReports, setEmailReports] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#F1F5F9]">Settings</h1>
          <p className="text-sm text-[#4B5563]">Manage your integrations and preferences</p>
        </div>

        {/* Integrations */}
        <div className="rounded-xl border border-[#1E2535] bg-[#0F1219] p-5 mb-4">
          <h2 className="text-sm font-semibold text-[#F1F5F9] mb-4">Integrations</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#161B26] border border-[#2A3548] flex items-center justify-center">
                  <Github size={15} className="text-[#F1F5F9]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#F1F5F9]">GitHub</div>
                  <div className="text-xs text-[#4B5563]">Not connected</div>
                </div>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] transition-colors">
                Connect
              </button>
            </div>

            <div className="border-t border-[#1E2535]" />

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#161B26] border border-[#2A3548] flex items-center justify-center">
                  <Calendar size={15} className="text-[#3B82F6]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#F1F5F9]">Google Calendar</div>
                  <div className="text-xs text-[#4B5563]">Not connected</div>
                </div>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] transition-colors">
                Connect
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-xl border border-[#1E2535] bg-[#0F1219] p-5 mb-4">
          <h2 className="text-sm font-semibold text-[#F1F5F9] mb-4">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1.5">
                Target deep work hours per day
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={targetHours}
                  onChange={(e) => setTargetHours(Number(e.target.value))}
                  className="flex-1 accent-[#3B82F6]"
                />
                <span className="font-mono text-sm text-[#F1F5F9] w-6">{targetHours}h</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#94A3B8] mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#161B26] border border-[#2A3548] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="America/Chicago">America/Chicago (CST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="America/Denver">America/Denver (MST)</option>
                <option value="UTC">UTC</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Berlin">Europe/Berlin</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#F1F5F9]">Weekly email reports</div>
                <div className="text-xs text-[#4B5563]">Sent every Friday at 5pm</div>
              </div>
              <button
                onClick={() => setEmailReports(!emailReports)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  emailReports ? "bg-[#3B82F6]" : "bg-[#2A3548]"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    emailReports ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
            saved
              ? "bg-[#10B981] text-white"
              : "bg-[#3B82F6] text-white hover:bg-[#2563EB]"
          }`}
        >
          <Save size={15} />
          {saved ? "Saved!" : "Save Changes"}
        </button>

        {/* Danger zone */}
        <div className="mt-6 rounded-xl border border-[#EF4444]/20 bg-[#1A0A0A] p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-[#EF4444]" />
            <span className="text-xs font-medium text-[#EF4444] uppercase tracking-wider">Danger Zone</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#F1F5F9]">Delete all data</div>
              <div className="text-xs text-[#4B5563]">Permanently removes all analysis data</div>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg border border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
