import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import { AnimatedBackground } from "../ui/AnimatedBackground";
import { BrandShowcase } from "../ui/BrandShowcase";
import { Logo } from "../ui/Logo";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-[#f3f6fb]">
      {" "}
      <BrandShowcase />
      {/* Right panel — form */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-white px-6 py-10 lg:px-12 lg:py-12">
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-black/[0.03] blur-3xl" />

          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/[0.04] blur-3xl" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.025)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <AnimatedBackground variant="auth" />
        </div>

        <motion.div
          initial={{
            opacity: 0,
            x: 40,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="mb-8 lg:hidden">
            <Logo size="md" variant="dark" />
          </div>

          <motion.div
            whileHover={{
              y: -5,
            }}
            transition={{
              duration: 0.3,
            }}
            className="
    relative
    overflow-hidden
    rounded-[36px]
    border
    border-black/8
    bg-white/95
    p-8
    shadow-[0_30px_80px_rgba(0,0,0,0.12)]
    backdrop-blur-xl
  "
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50" />

            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-black via-slate-700 to-blue-600" />

            <div className="relative z-10">
              <Outlet />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
