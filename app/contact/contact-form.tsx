"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { FormSuccessCallout } from "@/app/components/form-success-callout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const interests = [
  "Web app or custom system",
  "Shopify / e-commerce",
  "API integration",
  "Automation or data workflow",
  "Fix an existing project",
  "Not sure yet",
] as const;

const field = cn(
  "h-auto rounded-none border-0 border-b border-border bg-transparent px-0 py-[0.7rem]",
  "text-base leading-[1.5] text-foreground md:text-base",
  "placeholder:text-muted-foreground placeholder:opacity-70",
  "focus-visible:border-foreground focus-visible:ring-0"
);

const fieldLabel = "grid min-w-0 gap-[0.45rem]";
const fieldLabelText = "mono-label text-muted-foreground";
const formRow = "grid grid-cols-2 gap-x-5 gap-y-[1.65rem] max-[560px]:grid-cols-1";

type FormState = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
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
          kind: "contact",
          source: "Contact page",
          subject: "Portfolio contact inquiry",
          ...data,
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(result?.message ?? "The message could not be sent.");
      }

      form.reset();
      setState("sent");
      setMessage("Message sent. I will reply with a practical next step.");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "The message could not be sent right now."
      );
    }
  }

  return (
    <AnimatePresence mode="wait">
      {state === "sent" ? (
        <FormSuccessCallout
          key="sent"
          title="Message sent."
          body="Thanks for reaching out. I will reply with a practical next step."
        />
      ) : (
        <motion.form
          key="form"
          className="reveal grid gap-[1.65rem] border-t border-border pt-[1.75rem]"
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

          <div className={formRow}>
            <label className={fieldLabel}>
              <span className={fieldLabelText}>Your name</span>
              <Input className={field} name="name" type="text" autoComplete="name" required />
            </label>
            <label className={fieldLabel}>
              <span className={fieldLabelText}>Your email</span>
              <Input className={field} name="email" type="email" autoComplete="email" required />
            </label>
          </div>

          <div className={formRow}>
            <label className={fieldLabel}>
              <span className={fieldLabelText}>Company / project</span>
              <Input className={field} name="company" type="text" autoComplete="organization" />
            </label>
            <label className={fieldLabel}>
              <span className={fieldLabelText}>Website</span>
              <Input className={field} name="website" type="url" placeholder="https://" />
            </label>
          </div>

          <label className={fieldLabel}>
            <span className={fieldLabelText}>What are you interested in discussing?</span>
            <select
              className={cn(
                field,
                "select-caret w-full cursor-pointer appearance-none pr-7 outline-none focus:border-foreground"
              )}
              name="interest"
              defaultValue=""
            >
              <option value="" disabled>
                Select one
              </option>
              {interests.map((interest) => (
                <option key={interest}>{interest}</option>
              ))}
            </select>
          </label>

          <label className={fieldLabel}>
            <span className={fieldLabelText}>Tell me more about the work</span>
            <Textarea
              className={cn(field, "min-h-40 resize-y leading-[1.6]")}
              name="message"
              rows={7}
              placeholder="Share the goal, current bottleneck, scope, budget range, or launch date."
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
              {state === "sending" ? "Sending..." : "Send it over"}
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
  );
}
