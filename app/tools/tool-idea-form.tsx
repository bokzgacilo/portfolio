"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { FormSuccessCallout } from "../components/form-success-callout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { Eyebrow } from "../components/editorial";

/**
 * Underline fields, same treatment as the contact form: the shadcn source is
 * left untouched and the box styling is overridden here so both stay
 * upgradeable.
 */
const field = cn(
  "h-auto rounded-none border-0 border-b border-border bg-transparent px-0 py-[0.7rem]",
  "text-base leading-[1.5] text-foreground md:text-base",
  "placeholder:text-muted-foreground placeholder:opacity-70",
  "focus-visible:border-foreground focus-visible:ring-0"
);

const fieldLabel = "grid min-w-0 gap-[0.45rem]";
const fieldLabelText = "mono-label text-muted-foreground";

type FormState = "idle" | "sending" | "sent" | "error";

export function ToolIdeaForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "tool-idea",
          source: "Tools page",
          subject: "New portfolio tool idea",
          ...data,
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(result?.message ?? "The idea could not be sent.");
      }

      form.reset();
      setState("sent");
      setMessage("Idea sent. I will keep it on the build list.");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "The idea could not be sent right now."
      );
    }
  }

  return (
    <section
      className="mt-[clamp(4rem,9vw,7rem)] grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-[clamp(2rem,5vw,4.5rem)] border-t border-border pt-[clamp(1.5rem,4vw,2.6rem)] max-[900px]:grid-cols-1"
      aria-labelledby="tool-idea"
    >
      <div className="reveal">
        <Eyebrow>Suggest a tool</Eyebrow>
        <h2
          className="display mb-5 max-w-[16ch] text-[clamp(1.9rem,3.2vw,3.2rem)] leading-[1.05] max-[560px]:max-w-none max-[560px]:text-[1.9rem]"
          id="tool-idea"
        >
          Missing something you keep doing by hand?
        </h2>
        <p className="max-w-[46ch] text-[clamp(0.98rem,1.1vw,1.1rem)] leading-[1.65] text-muted-foreground">
          Tell me the task, the file types involved, and how often it comes up.
          The ideas that show up more than once get built first — and I&apos;ll
          email you when yours goes live.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {state === "sent" ? (
          <FormSuccessCallout
            key="sent"
            title="Idea sent."
            body="Thanks for sharing it. I will keep it on the build list."
          />
        ) : (
          <motion.form
            key="form"
            className="reveal grid gap-[1.65rem] border-t border-border pt-[1.75rem] max-[900px]:border-t-0 max-[900px]:pt-0"
            onSubmit={handleSubmit}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18, scale: 0.985 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <input
              className="hidden"
              name="websiteField"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-2 gap-x-5 gap-y-[1.65rem] max-[560px]:grid-cols-1">
              <label className={fieldLabel}>
                <span className={fieldLabelText}>First name</span>
                <Input
                  className={field}
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                />
              </label>
              <label className={fieldLabel}>
                <span className={fieldLabelText}>Last name</span>
                <Input
                  className={field}
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                />
              </label>
            </div>

            <label className={fieldLabel}>
              <span className={fieldLabelText}>Your email</span>
              <Input
                className={field}
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </label>

            <label className={fieldLabel}>
              <span className={fieldLabelText}>What should the tool do?</span>
              <Textarea
                className={cn(field, "min-h-40 resize-y leading-[1.6]")}
                name="idea"
                rows={7}
                placeholder="Describe the task you want automated — input format, expected output, and how often you need it."
                required
              />
            </label>

            <div className="grid gap-3">
              <Button
                className="mt-2 w-fit border-0 disabled:translate-y-0"
                variant="editorial-primary"
                size="pill"
                type="submit"
                disabled={state === "sending"}
              >
                {state === "sending" ? "Sending..." : "Send the idea"}
              </Button>
              {state === "error" && message ? (
                <p className="max-w-[46ch] text-sm font-semibold text-destructive" role="status">
                  {message}
                </p>
              ) : null}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}
