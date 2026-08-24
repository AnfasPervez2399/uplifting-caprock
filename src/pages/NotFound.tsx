import { Check, Layers3, LockKeyhole, ShieldCheck } from "lucide-react";

interface FullScreenLoaderProps {
  message?: string;
  detail?: string;
}

export function FullScreenLoader({
  message = "Preparing your workspace",
  detail = "Loading your secure Caprock experience.",
}: FullScreenLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="pointer-events-auto fixed inset-0 flex h-[100dvh] min-h-screen w-screen flex-col overflow-hidden bg-[#f7f9fc] text-slate-950"
      style={{ zIndex: 2147483647 }}
    >
      <style>{`
        @keyframes caprock-loader-enter {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes caprock-loader-orbit {
          to { transform: rotate(360deg); }
        }
        @keyframes caprock-loader-progress {
          0% { transform: translateX(-120%); }
          52% { transform: translateX(60%); }
          100% { transform: translateX(260%); }
        }
        @keyframes caprock-loader-breathe {
          0%, 100% { opacity: .38; transform: scale(.88); }
          50% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .caprock-loader-enter,
          .caprock-loader-orbit,
          .caprock-loader-progress,
          .caprock-loader-breathe { animation: none !important; }
        }
      `}</style>

      <div
        className="caprock-loader-enter pointer-events-none absolute inset-0 [animation:caprock-loader-enter_.25s_ease-out_both]"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(0,52,120,0.045)]" />
        <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(0,52,120,0.04)]" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[rgba(0,52,120,0.045)] blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[rgba(0,52,120,0.035)] blur-3xl" />
      </div>

      <header className="relative flex h-20 shrink-0 items-center justify-between border-b border-slate-200/70 bg-white/70 px-5 backdrop-blur-sm sm:px-8">
        <img
          src="/company-logo.svg"
          alt="Caprock"
          className="h-8 w-auto sm:h-9"
        />
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-[#003478]" />
          Protected session
        </span>
      </header>

      <div className="relative grid flex-1 place-items-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-xl text-center">
          <div className="relative mx-auto h-28 w-28">
            <div className="caprock-loader-orbit absolute inset-0 rounded-full border border-slate-200 border-r-[#003478] border-t-[#003478] [animation:caprock-loader-orbit_1.35s_linear_infinite]" />
            <div className="caprock-loader-orbit absolute inset-2 rounded-full border border-dashed border-[rgba(0,52,120,0.2)] [animation:caprock-loader-orbit_2.4s_linear_infinite_reverse]" />
            <div className="absolute inset-4 grid place-items-center rounded-[26px] bg-white text-[#003478] shadow-[0_18px_50px_rgba(15,23,42,0.1)] ring-1 ring-slate-200/80">
              <LockKeyhole className="h-7 w-7" />
            </div>
            <span className="caprock-loader-breathe absolute right-1 top-3 h-3 w-3 rounded-full bg-[#003478] ring-4 ring-[#dce7f2] [animation:caprock-loader-breathe_1.25s_ease-in-out_infinite]" />
          </div>

          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#003478]">
            Caprock secure workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-[30px]">
            {message}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            {detail}
          </p>

          <div className="mx-auto mt-8 h-1.5 max-w-sm overflow-hidden rounded-full bg-slate-200/80">
            <div className="caprock-loader-progress h-full w-1/3 rounded-full bg-[#003478] [animation:caprock-loader-progress_1.25s_ease-in-out_infinite]" />
          </div>

          <div className="mx-auto mt-7 grid max-w-lg grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: "Session", icon: Check, complete: true },
              { label: "Encryption", icon: ShieldCheck, complete: true },
              { label: "Workspace", icon: Layers3, complete: false },
            ].map(({ label, icon: Icon, complete }) => (
              <div
                key={label}
                className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-2 py-2.5 shadow-sm backdrop-blur-sm sm:px-3"
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg ${complete ? "bg-[#dce7f2] text-[#003478]" : "bg-[#003478] text-white"}`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${complete ? "" : "caprock-loader-breathe [animation:caprock-loader-breathe_1.25s_ease-in-out_infinite]"}`}
                  />
                </span>
                <span className="truncate text-[10px] font-semibold text-slate-600 sm:text-[11px]">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <span className="sr-only">Loading</span>
        </div>
      </div>

      <footer className="relative flex h-14 shrink-0 items-center justify-center border-t border-slate-200/70 bg-white/55 px-5 text-[10px] font-medium text-slate-400 backdrop-blur-sm">
        Please keep this window open while your workspace loads
      </footer>
    </div>
  );
}

export default FullScreenLoader;
