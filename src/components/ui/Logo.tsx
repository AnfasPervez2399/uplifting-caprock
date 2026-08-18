// import { motion } from "framer-motion";
// import { cn } from "../../lib/cn";

// interface LogoProps {
//   size?: "sm" | "md" | "lg";
//   variant?: "light" | "dark";
//   className?: string;
// }

// const sizes = {
//   sm: { icon: "h-7 w-7", text: "text-lg" },
//   md: { icon: "h-9 w-9", text: "text-xl" },
//   lg: { icon: "h-11 w-11", text: "text-2xl" },
// };

// export function Logo({ size = "md", variant = "light", className }: LogoProps) {
//   const s = sizes[size];
//   return (
//     <motion.div
//       className={cn("flex items-center gap-2.5", className)}
//       whileHover={{ scale: 1.02 }}
//       transition={{ type: "spring", stiffness: 400, damping: 25 }}
//     >
//       <div
//         className={cn(
//           s.icon,
//           "relative flex items-center justify-center rounded-xl bg-caprock shadow-lg shadow-caprock/30",
//         )}
//       >
//         <svg
//           viewBox="0 0 24 24"
//           className="h-5 w-5 text-white"
//           fill="currentColor"
//         >
//           <path d="M4 18V6h3.2c2.1 0 3.4 1.1 3.4 2.7 0 1.1-.6 2-1.6 2.4L12 18H9.2l-2.1-3.4H6.4V18H4zm2.4-5.5h.8c.8 0 1.3-.4 1.3-1s-.5-1-1.3-1h-.8v2z" />
//           <circle cx="17" cy="12" r="2.2" opacity="0.85" />
//         </svg>
//         <img
//           src="/Caprock-Logo 2.svg"
//           alt="Logo"
//           className="absolute top-8 left-8"
//         />
//         <div className="absolute inset-0 rounded-xl bg-white/10" />
//       </div>

//       <span
//         className={cn(
//           s.text,
//           "font-display font-bold tracking-tight",
//           variant === "light" ? "text-white" : "text-ink",
//         )}
//       >
//         Caprock
//       </span>
//     </motion.div>
//   );
// }
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8",
  md: "h-10",
  lg: "h-14",
};

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <motion.div
      className={cn("flex items-center", className)}
      whileHover={{ scale: 1.03 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
    >
      <img
        src="/Caprock-Logo 2.svg"
        alt="Caprock"
        className={cn(sizes[size], "w-auto object-contain")}
      />
    </motion.div>
  );
}
