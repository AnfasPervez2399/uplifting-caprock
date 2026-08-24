import { ShieldCheck } from "lucide-react";

interface FullScreenLoaderProps {
  message?: string;
  detail?: string;
}

export function FullScreenLoader({
  message = "Preparing your secure workspace",
  detail = "Loading your application and encrypted documents",
}: FullScreenLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="fixed inset-0 z-[200] grid min-h-screen place-items-center overflow-hidden bg-[#f7f9fc] px-6 text-slate-950"
    >
      <style>{`
        @keyframes caprock-loader-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes caprock-loader-progress {
          0% { transform: translateX(-105%); }
          55% { transform: translateX(45%); }
          100% { transform: translateX(215%); }
        }
        @keyframes caprock-loader-pulse {
          0%, 100% { opacity: .45; transform: scale(.96); }
          50% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .caprock-loader-spin,
          .caprock-loader-progress,
          .caprock-loader-pulse { animation: none !important; }
        }
      `}</style>

      <div className="absolute inset-x-0 top-0 h-1 bg-slate-100">
        <div className="caprock-loader-progress h-full w-1/3 bg-[#003478] [animation:caprock-loader-progress_1.35s_ease-in-out_infinite]" />
      </div>

      <div className="absolute left-5 top-5 sm:left-8 sm:top-7">
        <img
          src="/company-logo.svg"
          alt="Caprock"
          className="h-8 w-auto sm:h-9"
        />
      </div>

      <div className="w-full max-w-sm text-center">
        <div className="relative mx-auto h-20 w-20">
          <div className="caprock-loader-spin absolute inset-0 rounded-[24px] border border-slate-200 border-t-[#003478] [animation:caprock-loader-spin_1.1s_linear_infinite]" />
          <div className="absolute inset-2 grid place-items-center rounded-[19px] bg-white text-[#003478] shadow-[0_12px_35px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <span className="caprock-loader-pulse absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#003478] ring-4 ring-[#dce7f2] [animation:caprock-loader-pulse_1.4s_ease-in-out_infinite]" />
        </div>

        <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-[#003478]">
          Secure session
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-2xl">
          {message}
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
          {detail}
        </p>

        <div className="mx-auto mt-7 h-1.5 max-w-[260px] overflow-hidden rounded-full bg-slate-200/80">
          <div className="caprock-loader-progress h-full w-2/5 rounded-full bg-[#003478] [animation:caprock-loader-progress_1.35s_ease-in-out_infinite]" />
        </div>
        <span className="sr-only">Loading</span>
      </div>

      <div className="absolute inset-x-0 bottom-7 flex items-center justify-center gap-2 text-[10px] font-medium text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-[#003478]" />
        Encrypted connection active
      </div>
    </div>
  );
}
