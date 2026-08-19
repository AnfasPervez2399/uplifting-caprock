import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import { BrandShowcase } from "../ui/BrandShowcase";
import { Logo } from "../ui/Logo";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#edf2ff]">
      {/* Left Panel */}

      <BrandShowcase />

      {/* Divider */}

      {/* Right Panel */}

      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-white px-6 py-10">
        {/* Background */}

        <motion.div
          initial={{
            opacity: 0,
            x: 60,
            scale: 0.95,
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
          className="relative z-10 w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Logo size="md" variant="dark" />
          </div>

          <motion.div
            whileHover={{
              y: -4,
            }}
            className="
              relative
              overflow-hidden
              rounded-[36px]
              border
              border-black/10
              bg-white/95
              p-8
              shadow-[0_30px_80px_rgba(0,0,0,0.12)]
              backdrop-blur-xl
            "
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50" />

            <div className="relative z-10">
              <Outlet />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
