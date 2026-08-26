"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        className="relative min-h-[100svh]"
        key={pathname}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(4px)" }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-0 z-9 h-[3px] origin-left bg-foreground"
          aria-hidden="true"
          initial={shouldReduceMotion ? false : { scaleX: 0, opacity: 0.8 }}
          animate={shouldReduceMotion ? { opacity: 0 } : { scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
