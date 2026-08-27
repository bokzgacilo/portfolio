"use client";

import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

type ToolDownloadSuccessProps = {
  eyebrow: string;
  fileName: string;
  toolName: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
};

export function ToolDownloadSuccess({
  eyebrow,
  fileName,
  toolName,
  body,
  actionLabel,
  onAction,
}: ToolDownloadSuccessProps) {
  return (
    <motion.div
      className="grid min-h-[340px] min-w-0 content-center justify-items-start gap-4"
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="polite"
    >
      <motion.span
        className="relative grid size-14 place-items-center rounded-full border border-border bg-card text-brand-dark shadow-lift"
        initial={{ scale: 0.8, rotate: -6 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.08, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          className="absolute inset-0 rounded-full border border-brand"
          initial={{ opacity: 0.65, scale: 0.8 }}
          animate={{ opacity: 0, scale: 1.8 }}
          transition={{ delay: 0.16, duration: 0.9, ease: "easeOut" }}
          aria-hidden="true"
        />
        <CheckCircle2 className="size-7" strokeWidth={1.8} aria-hidden="true" />
      </motion.span>

      <motion.span
        className="mono-label rounded-full border border-border bg-card px-[0.62rem] py-[0.32rem] text-brand-dark"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.28 }}
      >
        {eyebrow}
      </motion.span>
      <motion.h2
        className="display text-[clamp(1.65rem,3vw,2.45rem)] leading-[1.04] [overflow-wrap:anywhere]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.32 }}
      >
        Thank you for choosing {toolName}. {fileName} is in your downloads.
      </motion.h2>
      <motion.p
        className="max-w-[46ch] text-muted-foreground"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.31, duration: 0.32 }}
      >
        {body}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, duration: 0.32 }}
      >
        <Button variant="editorial" size="pill" onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      </motion.div>
    </motion.div>
  );
}
