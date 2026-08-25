import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  HelpCircle,
  Loader2,
  LockKeyhole,
  LogOut,
  Menu,
  Save,
  Send,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { Field, inputClass } from "./FormPrimitives";
import { OnboardingAssistant } from "./OnboardingAssistant";
import type { OnboardingController } from "../useOnboardingController";

interface OnboardingShellProps {
  controller: OnboardingController;
  children: ReactNode;
}

export function OnboardingShell({
  controller,
  children,
}: OnboardingShellProps) {
  const {
    loggedUserEmail,
    loggedUserName,
    loggedUserRole,
    loggedUserInitials,
    form,
    activeStepId,
    notice,
    successNotice,
    mobileNavOpen,
    setMobileNavOpen,
    notificationsOpen,
    setNotificationsOpen,
    notificationsSeen,
    setNotificationsSeen,
    userMenuOpen,
    setUserMenuOpen,
    documentPreview,
    setDocumentPreview,
    notificationsRef,
    userMenuRef,
    previewDialogRef,
    previewCloseButtonRef,
    showAdviserInvite,
    setShowAdviserInvite,
    adviserDraft,
    setAdviserDraft,
    adviserError,
    setAdviserError,
    adviserDialogRef,
    adviserNameInputRef,
    isInvitingAdviser,
    draftStatus,
    isSaving,
    isSubmitting,
    submitted,
    setAssistantOpen,
    visibleSteps,
    activeStepIndex,
    applicationHeaderTitle,
    completion,
    applicationSectionCount,
    completedSectionCount,
    progressPercent,
    handleLogout,
    goToStep,
    goBack,
    goNext,
    openAdviserInvite,
    inviteAdviser,
    revokeAdviserAccess,
    saveDraft,
  } = controller;

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950 selection:bg-[#dce7f2] selection:text-slate-950">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label="Toggle application navigation"
              aria-expanded={mobileNavOpen}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
            >
              {mobileNavOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
            <a
              href="/"
              className="flex shrink-0 items-center"
              aria-label="Caprock home"
            >
              <img
                src="/company-logo.svg"
                alt="Caprock"
                className="h-8 w-auto sm:h-9"
              />
            </a>
            <div className="hidden h-7 w-px bg-slate-200 sm:block" />
            <div className="hidden min-w-0 sm:block" aria-live="polite">
              <p className="truncate text-sm font-semibold tracking-[-0.01em] text-[#0f172a]">
                {applicationHeaderTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden items-center gap-2 pr-1 text-xs font-medium text-slate-500 2xl:flex">
              <ShieldCheck className="h-4 w-4 text-[#003478]" />
              Encrypted session
            </div>
            <button
              type="button"
              onClick={openAdviserInvite}
              aria-label={
                form.adviserAccess
                  ? "Manage adviser access"
                  : "Invite an adviser"
              }
              className="hidden h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-[#003478] lg:inline-flex"
            >
              {form.adviserAccess ? (
                <CheckCircle2 className="h-4 w-4 text-[#003478]" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              <span>
                {form.adviserAccess ? "Adviser invited" : "Invite adviser"}
              </span>
            </button>
            <button
              type="button"
              onClick={saveDraft}
              disabled={isSaving}
              aria-label={
                draftStatus === "saving"
                  ? "Saving draft"
                  : draftStatus === "saved"
                    ? "Draft saved"
                    : "Save draft"
              }
              aria-live="polite"
              className={`inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-300 sm:px-3.5 ${
                draftStatus === "saved"
                  ? "border-[#dce7f2] bg-[#dce7f2] text-[#0f172a]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-[#003478] disabled:opacity-60"
              }`}
            >
              {draftStatus === "saving" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : draftStatus === "saved" ? (
                <CheckCircle2 className="h-4 w-4 text-[#003478]" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden md:inline">
                {draftStatus === "saving"
                  ? "Saving…"
                  : draftStatus === "saved"
                    ? "Draft saved"
                    : "Save draft"}
              </span>
            </button>

            <div ref={notificationsRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  setNotificationsSeen(true);
                  setUserMenuOpen(false);
                }}
                aria-label="Open notifications"
                aria-haspopup="dialog"
                aria-expanded={notificationsOpen}
                className={`relative grid h-10 w-10 place-items-center rounded-xl border bg-white transition ${
                  notificationsOpen
                    ? "border-[rgba(0,52,120,0.22)] text-[#003478] ring-4 ring-[#003478]/5"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-[#003478]"
                }`}
              >
                <Bell className="h-4 w-4" />
                {!notificationsSeen ? (
                  <span
                    className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#003478] ring-2 ring-white"
                    aria-label="Unread notifications"
                  />
                ) : null}
              </button>
              {notificationsOpen ? (
                <div
                  role="dialog"
                  aria-label="Notifications"
                  className="fixed left-4 right-4 top-[72px] z-[80] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[22rem]"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Notifications
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Application activity and updates
                      </p>
                    </div>
                    <span className="rounded-full bg-[#dce7f2] px-2.5 py-1 text-[10px] font-bold text-[#003478]">
                      3 updates
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {[
                      {
                        title: "Document previews are ready",
                        message:
                          "Click any uploaded file to inspect it without leaving your application.",
                        icon: Eye,
                      },
                      {
                        title: "Your session is protected",
                        message:
                          "Application details and uploads remain encrypted throughout onboarding.",
                        icon: ShieldCheck,
                      },
                      {
                        title: "Draft saving is available",
                        message:
                          "Use Save draft at any time and continue when you are ready.",
                        icon: Save,
                      },
                    ].map(({ title, message, icon: Icon }) => (
                      <div key={title} className="flex gap-3 px-4 py-3.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            {title}
                          </p>
                          <p className="mt-1 text-[11px] leading-5 text-slate-500">
                            {message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setAssistantOpen(true)}
              aria-label="Open onboarding assistant"
              className="hidden h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-[#003478] sm:grid"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen((open) => !open);
                  setNotificationsOpen(false);
                }}
                aria-label="Open user menu"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                className={`flex h-10 items-center gap-2 rounded-xl border bg-white p-1.5 pr-2 transition ${
                  userMenuOpen
                    ? "border-[rgba(0,52,120,0.22)] ring-4 ring-[#003478]/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#003478] text-[10px] font-bold text-white">
                  {loggedUserInitials}
                </span>
                <span className="hidden min-w-0 text-left xl:block">
                  <span className="block max-w-28 truncate text-[11px] font-semibold leading-4 text-slate-900">
                    {loggedUserName}
                  </span>
                  <span className="block text-[9px] leading-3 text-slate-400">
                    {loggedUserRole}
                  </span>
                </span>
              </button>
              {userMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-12 z-[80] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_55px_rgba(15,23,42,0.14)]"
                >
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#003478] text-xs font-bold text-white">
                        {loggedUserInitials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {loggedUserName}
                        </p>
                        <p className="mt-0.5 text-[10px] font-medium text-[#003478]">
                          {loggedUserRole}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 truncate text-[10px] text-slate-400">
                      {loggedUserEmail}
                    </p>
                  </div>
                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium leading-5 text-slate-700 transition hover:bg-slate-50 hover:text-[#003478] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/15"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:text-[#003478]">
                        <LogOut className="h-4 w-4" />
                      </span>
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-[#003478] transition-[width] duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {mobileNavOpen ? (
        <div
          className="fixed inset-0 top-[68px] z-30 cursor-pointer bg-slate-950/20 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        >
          <nav
            className="h-full w-[min(88vw,360px)] cursor-default overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            aria-label="Application sections"
          >
            <p className="px-3 pb-3 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Application sections
            </p>
            <div className="space-y-1.5">
              {visibleSteps.map((step, index) => {
                const Icon = step.icon;
                const active = step.id === activeStepId;
                const done = completion[step.id];
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goToStep(step.id)}
                    aria-current={active ? "step" : undefined}
                    aria-label={`${step.label}${done ? ", completed" : active ? ", current section" : ""}`}
                    className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-300 ease-out motion-reduce:transition-none ${
                      active
                        ? "border-[#dce7f2] bg-[#dce7f2] text-[#0f172a] shadow-sm"
                        : done
                          ? "border-[#dce7f2] bg-[#f7fafd] text-[#0f172a] hover:bg-[#eef4f9]"
                          : "border-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all duration-300 ${
                        done
                          ? "bg-[#003478] text-white shadow-sm"
                          : active
                            ? "bg-white text-[#003478] shadow-sm"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {done ? (
                        <Check
                          className="h-4 w-4 [animation:caprock-complete-in_.32s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none"
                          strokeWidth={2.7}
                        />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">
                        {step.label}
                      </span>
                      <span
                        className={`mt-0.5 block truncate text-[11px] ${done ? "font-medium text-[#003478]" : "text-slate-500"}`}
                      >
                        {done ? "Section completed" : step.description}
                      </span>
                    </span>
                    {done ? (
                      <span className="rounded-full bg-[#dce7f2] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-[#0f172a]">
                        Completed
                      </span>
                    ) : active ? (
                      <span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-[#003478]">
                        Current
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">
                        {index + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      ) : null}

      <main className="mx-auto grid max-w-[1440px] lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-76px)] border-r border-slate-200/80 bg-white/65 px-5 py-8 lg:block">
          <div className="sticky top-28">
            <div className="mb-6 px-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Application progress
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                    {completedSectionCount}/{applicationSectionCount}
                  </p>
                </div>
                <p className="pb-1 text-xs font-medium text-slate-400">
                  sections complete
                </p>
              </div>
              <div
                className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200/80"
                role="progressbar"
                aria-label="Completed application sections"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent}
              >
                <div
                  className="h-full rounded-full bg-[#003478] transition-[width] duration-500 ease-out motion-reduce:transition-none"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-2 text-right text-[10px] font-semibold text-[#003478]">
                {progressPercent}% completed
              </p>
            </div>

            <nav className="space-y-1.5" aria-label="Application sections">
              {visibleSteps.map((step, index) => {
                const Icon = step.icon;
                const active = step.id === activeStepId;
                const done = completion[step.id];
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goToStep(step.id)}
                    aria-current={active ? "step" : undefined}
                    aria-label={`${step.label}${done ? ", completed" : active ? ", current section" : ""}`}
                    className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-300 ease-out motion-reduce:transition-none ${
                      active
                        ? "border-[#dce7f2] bg-[#dce7f2] text-[#0f172a] shadow-sm"
                        : done
                          ? "border-[#dce7f2] bg-white/90 text-[#0f172a] shadow-[0_3px_12px_rgba(15,23,42,0.035)] hover:bg-[#f7fafd]"
                          : "border-transparent text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all duration-300 ${
                        done
                          ? "bg-[#003478] text-white shadow-sm ring-4 ring-[#dce7f2]"
                          : active
                            ? "bg-white text-[#003478] shadow-sm ring-1 ring-slate-200/60"
                            : "bg-slate-100 text-slate-400 group-hover:bg-slate-50"
                      }`}
                    >
                      {done ? (
                        <Check
                          className="h-4 w-4 [animation:caprock-complete-in_.32s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none"
                          strokeWidth={2.7}
                        />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold">
                        {step.label}
                      </span>
                      <span
                        className={`mt-0.5 block truncate text-[10px] ${done ? "font-semibold text-[#003478]" : "text-slate-400"}`}
                      >
                        {done ? "Section completed" : step.description}
                      </span>
                    </span>
                    {done ? (
                      <span className="rounded-full bg-[#dce7f2] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.05em] text-[#0f172a]">
                        Completed
                      </span>
                    ) : active ? (
                      <span className="rounded-full bg-white px-2 py-1 text-[8px] font-bold uppercase tracking-[0.05em] text-[#003478]">
                        Current
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300">
                        {index + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[rgba(0,52,120,0.07)] text-[#003478]">
                  <LockKeyhole className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Secure application
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-400">
                    Your entries are protected throughout this session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 xl:px-14">
          <div className="mx-auto max-w-4xl">
            <div className="mb-5 flex items-center justify-between gap-4 lg:hidden">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Step {activeStepIndex + 1} of {visibleSteps.length}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {visibleSteps[activeStepIndex].label}
                </p>
              </div>
              <span className="rounded-full bg-[#dce7f2] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-800">
                {completedSectionCount}/{applicationSectionCount} complete
              </span>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_45px_rgba(15,23,42,0.045)] sm:p-8 lg:p-10">
              {successNotice ? (
                <div
                  role="status"
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-[rgba(0,52,120,0.13)] bg-[rgba(0,52,120,0.035)] p-4 text-sm leading-6 text-slate-700"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />
                  {successNotice}
                </div>
              ) : null}
              {notice ? (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-800"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  {notice}
                </div>
              ) : null}
              {children}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <button
                type="button"
                onClick={goBack}
                disabled={activeStepIndex === 0}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={isSaving}
                  aria-label={
                    draftStatus === "saving"
                      ? "Saving draft"
                      : draftStatus === "saved"
                        ? "Draft saved"
                        : "Save draft"
                  }
                  aria-live="polite"
                  className={`inline-flex h-12 min-w-[148px] items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#003478]/10 disabled:opacity-70 ${
                    draftStatus === "saved"
                      ? "border-[#dce7f2] bg-[#dce7f2] text-[#0f172a]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#003478]/25 hover:bg-[#f7fafd] hover:text-[#003478]"
                  }`}
                >
                  {draftStatus === "saving" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : draftStatus === "saved" ? (
                    <CheckCircle2 className="h-4 w-4 text-[#003478]" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>
                    {draftStatus === "saving"
                      ? "Saving…"
                      : draftStatus === "saved"
                        ? "Draft saved"
                        : "Save draft"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={
                    isSubmitting || (activeStepId === "review" && submitted)
                  }
                  aria-label={
                    activeStepId === "review"
                      ? submitted
                        ? "Application under review"
                        : "Submit application securely"
                      : "Continue to next section"
                  }
                  className={`group inline-flex h-12 items-center justify-center rounded-xl bg-[#003478] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#002b63] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#003478]/15 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-[#003478] ${
                    activeStepId === "review"
                      ? "min-w-[210px] gap-3 px-4"
                      : "min-w-40 gap-2 px-6"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </span>
                      Submitting securely…
                    </>
                  ) : activeStepId === "review" && submitted ? (
                    <>
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/10">
                        <Clock3 className="h-4 w-4" />
                      </span>
                      <span>Under review</span>
                    </>
                  ) : activeStepId === "review" ? (
                    <>
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/10">
                        <LockKeyhole className="h-4 w-4" />
                      </span>
                      <span>Submit securely</span>
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pb-8 text-[10px] font-medium text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Encrypted
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Banknote className="h-3.5 w-3.5" /> Bank verification
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Compliance review
              </span>
            </div>
          </div>
        </div>
      </main>

      {documentPreview ? (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[3px] sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDocumentPreview(null);
          }}
        >
          <div
            ref={previewDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-preview-title"
            className="flex h-[min(90vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_30px_100px_rgba(2,6,23,0.32)] sm:rounded-3xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p
                    id="document-preview-title"
                    className="text-sm font-semibold text-slate-950"
                  >
                    {documentPreview.label}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {documentPreview.document.name}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={documentPreview.document.previewUrl}
                  download={documentPreview.document.name}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-[#003478] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20 sm:px-3.5"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  ref={previewCloseButtonRef}
                  type="button"
                  onClick={() => setDocumentPreview(null)}
                  aria-label="Close document viewer"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 bg-slate-100 p-2 sm:p-4">
              {documentPreview.document.type.startsWith("image/") ? (
                <div className="grid h-full place-items-center overflow-auto rounded-xl bg-white p-3 ring-1 ring-slate-200 sm:rounded-2xl sm:p-5">
                  <img
                    src={documentPreview.document.previewUrl}
                    alt={`Preview of ${documentPreview.document.name}`}
                    className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
                  />
                </div>
              ) : documentPreview.document.type === "application/pdf" ||
                documentPreview.document.name.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={documentPreview.document.previewUrl}
                  title={`Preview of ${documentPreview.document.name}`}
                  className="h-full w-full rounded-xl border-0 bg-white ring-1 ring-slate-200 sm:rounded-2xl"
                />
              ) : (
                <div className="grid h-full place-items-center rounded-xl bg-white p-6 text-center ring-1 ring-slate-200 sm:rounded-2xl">
                  <div className="max-w-sm">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#dce7f2] text-[#003478]">
                      <FileText className="h-7 w-7" />
                    </div>
                    <h2 className="mt-5 text-lg font-semibold text-slate-950">
                      Preview unavailable for this file type
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Word documents cannot be displayed securely in the browser
                      viewer. Download the file to open it in a compatible
                      application.
                    </p>
                    <a
                      href={documentPreview.document.previewUrl}
                      download={documentPreview.document.name}
                      className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#003478]/15"
                    >
                      <Download className="h-4 w-4" />
                      Download document
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-3 text-[10px] text-slate-400 sm:px-5">
              <span>
                {(documentPreview.document.size / 1024 / 1024).toFixed(2)} MB ·{" "}
                {documentPreview.document.type || "Document"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#003478]" /> Secure
                document viewer
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {showAdviserInvite ? (
        <div
          className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/35 px-4 py-8 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isInvitingAdviser)
              setShowAdviserInvite(false);
          }}
        >
          <div
            ref={adviserDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="adviser-dialog-title"
            aria-describedby="adviser-dialog-description"
            className="max-h-full w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.2)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3.5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#dce7f2] text-[#003478]">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#003478]">
                    Application support
                  </p>
                  <h2
                    id="adviser-dialog-title"
                    className="mt-1 text-lg font-semibold tracking-[-0.02em] text-slate-950"
                  >
                    {form.adviserAccess
                      ? "Manage adviser access"
                      : "Invite an adviser"}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdviserInvite(false)}
                disabled={isInvitingAdviser}
                aria-label="Close adviser invitation"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 px-5 py-6 sm:px-6">
              <p
                id="adviser-dialog-description"
                className="text-sm leading-6 text-slate-600"
              >
                Invite a trusted adviser to complete or update any section of
                this application on your behalf. You remain responsible for
                reviewing and approving the information before submission.
              </p>

              {form.adviserAccess ? (
                <div className="flex items-start gap-3 rounded-2xl border border-[rgba(0,52,120,0.14)] bg-[rgba(0,52,120,0.035)] p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Access currently enabled
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {form.adviserAccess.name} · {form.adviserAccess.email}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Adviser’s name" htmlFor="adviserName">
                  <input
                    ref={adviserNameInputRef}
                    id="adviserName"
                    value={adviserDraft.name}
                    onChange={(event) => {
                      setAdviserDraft((current) => ({
                        ...current,
                        name: event.target.value,
                      }));
                      setAdviserError("");
                    }}
                    placeholder="Full name"
                    autoComplete="name"
                    className={inputClass(
                      Boolean(adviserError && !adviserDraft.name.trim()),
                    )}
                  />
                </Field>
                <Field label="Adviser’s email" htmlFor="adviserEmail">
                  <input
                    id="adviserEmail"
                    type="email"
                    value={adviserDraft.email}
                    onChange={(event) => {
                      setAdviserDraft((current) => ({
                        ...current,
                        email: event.target.value,
                      }));
                      setAdviserError("");
                    }}
                    placeholder="adviser@example.com"
                    autoComplete="email"
                    className={inputClass(
                      Boolean(adviserError && adviserDraft.name.trim()),
                    )}
                  />
                </Field>
              </div>
              {adviserError ? (
                <p role="alert" className="text-xs font-medium text-red-600">
                  {adviserError}
                </p>
              ) : null}

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#003478]" />
                Adviser access applies to the full application, is recorded for
                audit purposes and can be revoked here at any time.
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                {form.adviserAccess ? (
                  <button
                    type="button"
                    onClick={revokeAdviserAccess}
                    disabled={isInvitingAdviser}
                    className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    Revoke access
                  </button>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdviserInvite(false)}
                  disabled={isInvitingAdviser}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={inviteAdviser}
                  disabled={isInvitingAdviser}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63] disabled:cursor-wait disabled:opacity-70"
                >
                  {isInvitingAdviser ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {form.adviserAccess ? "Update invitation" : "Send invitation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <OnboardingAssistant controller={controller} />
    </div>
  );
}
