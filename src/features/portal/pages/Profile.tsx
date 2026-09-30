import { motion } from "framer-motion";
import {
  BadgeCheck,
  Bell,
  Camera,
  Globe,
  KeyRound,
  Mail,
  MapPin,
  Monitor,
  Pencil,
  Phone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { PORTAL_USER } from "../data";
import { Modal, Panel, PanelHeader, Reveal, StatusPill, pushToast } from "../components";

function Toggle({ on, onFlip, label }: { on: boolean; onFlip: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onFlip}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-slate-300"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 32 }}
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${on ? "right-0.5" : "left-0.5"}`}
      />
    </button>
  );
}

const SESSIONS = [
  { device: "MacBook Pro · Sydney", browser: "Chrome · Current session", active: true },
  { device: "iPhone 16 · Sydney", browser: "Caprock app · 2h ago", active: false },
  { device: "Windows PC · Melbourne", browser: "Edge · 3 days ago", active: false },
];

export default function Profile() {
  const [twoFa, setTwoFa] = useState(true);
  const [alerts, setAlerts] = useState({ email: true, sms: true, push: false });
  const [currency, setCurrency] = useState("AUD");
  const [edit, setEdit] = useState(false);
  const [contact, setContact] = useState({ email: PORTAL_USER.email, phone: PORTAL_USER.phone, address: PORTAL_USER.address });
  const [draft, setDraft] = useState(contact);

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#003478] via-[#00509e] to-[#00a6c8] p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-2xl" />
          <div className="relative flex flex-wrap items-center gap-5">
            <div className="relative">
              <span className="grid h-20 w-20 place-items-center rounded-3xl bg-white/15 text-2xl font-black backdrop-blur">
                {PORTAL_USER.name.split(" ").map((w) => w[0]).join("")}
              </span>
              <button
                type="button"
                aria-label="Change profile photo"
                onClick={() => pushToast("Photo upload", "Choose a square image up to 5 MB.", "blue")}
                className="absolute -bottom-1.5 -right-1.5 grid h-8 w-8 place-items-center rounded-full bg-white text-[#003478] shadow transition hover:scale-105"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">{PORTAL_USER.type} account</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{PORTAL_USER.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-extrabold text-emerald-100 ring-1 ring-emerald-300/40">
                  <BadgeCheck className="h-3.5 w-3.5" /> Identity verified
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white/90">Client since {PORTAL_USER.memberSince}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setDraft(contact); setEdit(true); }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-[13px] font-extrabold text-[#003478] shadow transition hover:bg-blue-50"
            >
              <Pencil className="h-4 w-4" /> Edit contact
            </button>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-5 xl:grid-cols-2">
        <Reveal>
          <Panel className="h-full">
            <PanelHeader icon={<Mail className="h-5 w-5" />} title="Contact details" subtitle="Used for statements and alerts" tint="#2563eb" />
            <ul className="space-y-3 px-5 py-5 sm:px-6">
              {[
                { icon: Mail, label: "Email address", value: contact.email },
                { icon: Phone, label: "Mobile number", value: contact.phone },
                { icon: MapPin, label: "Residential address", value: contact.address },
                { icon: Globe, label: "Tax residency", value: "Australia · TFN verified" },
              ].map((row) => (
                <li key={row.label} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-[#003478] shadow-sm">
                    <row.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">{row.label}</span>
                    <span className="block truncate text-[13px] font-bold text-slate-800">{row.value}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>

        <Reveal delay={0.06}>
          <Panel className="h-full">
            <PanelHeader icon={<ShieldCheck className="h-5 w-5" />} title="Security & sessions" subtitle="Two-factor is keeping this account safe" tint="#059669" />
            <div className="space-y-3 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50/70 px-4 py-3 ring-1 ring-emerald-100">
                <span className="flex items-center gap-2.5">
                  <KeyRound className="h-4 w-4 text-emerald-700" />
                  <span>
                    <span className="block text-[13px] font-extrabold text-slate-800">Two-factor authentication</span>
                    <span className="block text-[11px] text-slate-500">Authenticator app · SMS fallback</span>
                  </span>
                </span>
                <Toggle on={twoFa} onFlip={() => { setTwoFa((v) => !v); pushToast(twoFa ? "2FA disabled" : "2FA enabled", undefined, twoFa ? "amber" : "emerald"); }} label="Two-factor authentication" />
              </div>
              {SESSIONS.map((s, i) => (
                <div key={s.device} className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3">
                  {i === 1 ? <Smartphone className="h-4 w-4 shrink-0 text-slate-400" /> : <Monitor className="h-4 w-4 shrink-0 text-slate-400" />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-slate-800">{s.device}</span>
                    <span className="block text-[11px] text-slate-500">{s.browser}</span>
                  </span>
                  {s.active ? (
                    <StatusPill status="Active" pulse />
                  ) : (
                    <button
                      type="button"
                      onClick={() => pushToast("Session revoked", s.device, "rose")}
                      className="text-xs font-extrabold text-rose-600 hover:underline"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => pushToast("Password reset sent", "Check your inbox for a secure link.", "blue")}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-[13px] font-extrabold text-slate-700 transition hover:border-[#003478] hover:text-[#003478]"
              >
                Change password
              </button>
            </div>
          </Panel>
        </Reveal>

        <Reveal>
          <Panel className="h-full">
            <PanelHeader icon={<Bell className="h-5 w-5" />} title="Notification preferences" subtitle="Choose how we reach you" tint="#7c3aed" />
            <div className="space-y-3 px-5 py-5 sm:px-6">
              {(
                [
                  ["email", "Email alerts", "Statements, approvals and documents"],
                  ["sms", "SMS alerts", "Security codes and large transfers"],
                  ["push", "Push notifications", "Market moves and mandate updates"],
                ] as const
              ).map(([key, label, detail]) => (
                <div key={key} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span>
                    <span className="block text-[13px] font-extrabold text-slate-800">{label}</span>
                    <span className="block text-[11px] text-slate-500">{detail}</span>
                  </span>
                  <Toggle on={alerts[key]} onFlip={() => setAlerts((a) => ({ ...a, [key]: !a[key] }))} label={label} />
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.06}>
          <Panel className="h-full">
            <PanelHeader icon={<Globe className="h-5 w-5" />} title="Display preferences" subtitle="Reporting currency and delivery" tint="#d97706" />
            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-bold text-slate-600">Default reporting currency</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["AUD", "USD", "EUR", "GBP", "SGD"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setCurrency(c); pushToast("Reporting currency", `Dashboard now shows ${c} equivalents.`, "blue"); }}
                      className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${currency === c ? "bg-[#003478] text-white shadow" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-[13px] leading-6 text-slate-600">
                <p><span className="font-extrabold text-slate-800">Statement delivery:</span> Email + portal archive</p>
                <p><span className="font-extrabold text-slate-800">Language:</span> English (AU)</p>
                <p><span className="font-extrabold text-slate-800">Adviser:</span> {PORTAL_USER.adviser} · {PORTAL_USER.adviserRole}</p>
              </div>
            </div>
          </Panel>
        </Reveal>
      </div>

      <Modal open={edit} onClose={() => setEdit(false)} title="Edit contact details" subtitle="Changes apply to statements and alerts">
        <div className="grid gap-3.5">
          {(["email", "phone", "address"] as const).map((field) => (
            <div key={field}>
              <label className="text-xs font-bold capitalize text-slate-600" htmlFor={`pc-${field}`}>{field}</label>
              <input
                id={`pc-${field}`}
                value={draft[field]}
                onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#003478] focus:ring-4 focus:ring-[#003478]/10"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setContact(draft);
              setEdit(false);
              pushToast("Contact updated", "Your new details are live.");
            }}
            className="mt-1 h-11 w-full rounded-xl bg-[#003478] text-sm font-extrabold text-white hover:bg-[#002b63]"
          >
            Save changes
          </button>
        </div>
      </Modal>
    </div>
  );
}
