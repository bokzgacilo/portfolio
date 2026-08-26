"use client";

import { MailCheck } from "lucide-react";
import { motion } from "framer-motion";

type FormSuccessCalloutProps = {
  title: string;
  body: string;
};

export function FormSuccessCallout({ title, body }: FormSuccessCalloutProps) {
  return (
    <motion.div
      className="reveal grid min-h-[520px] place-items-center border-t border-border pt-[1.75rem] max-[900px]:min-h-[420px]"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -18, scale: 0.98 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="polite"
    >
      <div className="grid max-w-[520px] justify-items-center text-center">
        <motion.span
          className="relative mb-7 grid size-24 place-items-center rounded-full border border-border bg-paper shadow-lift"
          initial={{ scale: 0.72, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="absolute inset-0 rounded-full border border-brand"
            initial={{ opacity: 0.7, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.55 }}
            transition={{ delay: 0.2, duration: 0.9, ease: "easeOut" }}
          />
          <motion.span
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <MailCheck className="size-10 text-brand-dark" strokeWidth={1.8} />
          </motion.span>
        </motion.span>
        <motion.h2
          className="display text-[clamp(2.2rem,4vw,4rem)] leading-none"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.38 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="mt-5 max-w-[38ch] text-[clamp(1rem,1.2vw,1.12rem)] leading-[1.65] text-muted-foreground"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.38 }}
        >
          {body}
        </motion.p>
      </div>
    </motion.div>
  );
}
