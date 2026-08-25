import { motion, useReducedMotion } from "framer-motion";
import { Outlet } from "react-router-dom";
import { BrandShowcase } from "../../components/ui/BrandShowcase";

const EASE = [0.22, 1, 0.36, 1] as const;

export function AuthLayout() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex h-[100svh] overflow-hidden bg-[#f4f6f8] selection:bg-[#dce7f2] selection:text-[#0f172a]">
      <BrandShowcase />

      <main className="relative min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#fbfbfa]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.58, ease: EASE }}
          className="mx-auto flex min-h-full w-full max-w-[510px] items-center px-4 py-5 sm:px-8 sm:py-8 xl:px-12"
        >
          <div className="w-full">
            <div className="relative overflow-hidden rounded-[24px] border border-black/[0.075] bg-white shadow-[0_28px_70px_-46px_rgba(15,23,42,0.32),0_8px_24px_-20px_rgba(15,23,42,0.14)] sm:rounded-[28px]">
              <div className="relative px-1 sm:px-5">
                <Outlet />
              </div>
            </div>

            <p className="mt-5 text-center text-[11px] font-medium tracking-[0.01em] text-slate-400">
              Secure access to the Caprock investor network
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default AuthLayout;
