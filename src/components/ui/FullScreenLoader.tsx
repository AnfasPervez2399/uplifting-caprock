import { Send } from "lucide-react";

interface FullScreenLoaderProps {
  message?: string;
  detail?: string;
}

export function FullScreenLoader({
  message = "Please wait",
}: FullScreenLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      aria-busy="true"
      className="pointer-events-auto fixed inset-0 grid h-[100dvh] min-h-screen w-screen place-items-center overflow-hidden bg-slate-950/15 px-4 py-6 text-slate-950 backdrop-blur-[12px]"
      style={{ zIndex: 2147483647 }}
    >
      <style>{`
        @keyframes caprock-loader-enter {
          from { opacity: 0; transform: translateY(10px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes caprock-loader-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes caprock-loader-ripple {
          0% { opacity: .35; transform: scale(.72); }
          80%, 100% { opacity: 0; transform: scale(1.38); }
        }
        @keyframes caprock-loader-bar {
          0%, 100% { height: 8px; opacity: .55; }
          50% { height: 21px; opacity: 1; }
        }
        @keyframes caprock-loader-line {
          0% { transform: translateX(-120%); }
          55%, 100% { transform: translateX(250%); }
        }
        @keyframes caprock-loader-travel {
          0% { left: 0%; opacity: 0; transform: translate(-50%, -50%) scale(.76) rotate(-8deg); }
          10% { opacity: 1; }
          48% { transform: translate(-50%, -58%) scale(1) rotate(2deg); }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; transform: translate(-50%, -50%) scale(.8) rotate(-8deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .caprock-loader-enter,
          .caprock-loader-spin,
          .caprock-loader-ripple,
          .caprock-loader-bar,
          .caprock-loader-line,
          .caprock-loader-travel { animation: none !important; }
          .caprock-loader-travel { left: 65% !important; opacity: 1 !important; }
        }
      `}</style>

      <section className="caprock-loader-enter w-full max-w-[360px] rounded-[28px] border border-white/80 bg-white/[0.9] px-6 py-8 text-center shadow-[0_28px_90px_rgba(15,23,42,0.2),0_4px_16px_rgba(15,23,42,0.07)] backdrop-blur-2xl [animation:caprock-loader-enter_.28s_cubic-bezier(.22,1,.36,1)_both] sm:px-8 sm:py-9">
        <div className="relative mx-auto h-24 w-24" aria-hidden="true">
          <span className="caprock-loader-ripple absolute inset-1 rounded-[30px] border border-[#003478]/25 [animation:caprock-loader-ripple_1.8s_ease-out_infinite]" />
          <span className="caprock-loader-spin absolute inset-1 rounded-[30px] border border-slate-200 border-r-[#003478] border-t-[#003478] [animation:caprock-loader-spin_1.35s_linear_infinite]" />
          <span className="absolute inset-[14px] flex items-center justify-center gap-1 rounded-[22px] bg-[#003478] shadow-[0_14px_32px_rgba(0,52,120,0.24)]">
            {[0, 160, 320].map((delay) => (
              <span
                key={delay}
                className="caprock-loader-bar w-1.5 rounded-full bg-white [animation:caprock-loader-bar_1.15s_ease-in-out_infinite]"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </span>
        </div>

        <h1 className="mt-6 text-[22px] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[24px]">
          {message}
        </h1>

        <div
          className="relative mx-auto mt-7 h-10 max-w-[260px]"
          aria-hidden="true"
        >
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 overflow-hidden bg-slate-200">
            <span className="caprock-loader-line block h-full w-2/5 bg-[#003478] [animation:caprock-loader-line_1.8s_cubic-bezier(.45,0,.2,1)_infinite]" />
          </div>
          <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#003478]/30" />
          <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#003478]/30" />
          <span className="caprock-loader-travel absolute top-1/2 grid h-8 w-8 place-items-center rounded-xl bg-[#003478] text-white shadow-[0_7px_18px_rgba(0,52,120,0.28)] [animation:caprock-loader-travel_2.4s_cubic-bezier(.4,0,.2,1)_infinite]">
            <Send
              className="h-3.5 w-3.5 -rotate-6"
              fill="currentColor"
              strokeWidth={1.5}
            />
          </span>
        </div>

        <span className="sr-only">Loading. Please wait.</span>
      </section>
    </div>
  );
}

export default FullScreenLoader;
