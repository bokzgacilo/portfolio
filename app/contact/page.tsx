import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { Eyebrow, measure } from "../components/editorial";

const contactLinks = [
  ["Email", "bokzgacilo@gmail.com", "mailto:bokzgacilo@gmail.com"],
  ["Phone", "0976 222 0951", "tel:+639762220951"],
  ["LinkedIn", "ariel-jericko-gacilo", "https://www.linkedin.com/in/ariel-jericko-gacilo/"],
  ["GitHub", "bokzgacilo", "https://github.com/bokzgacilo"],
] as const;

const interests = [
  "Web app or custom system",
  "Shopify / e-commerce",
  "API integration",
  "Automation or data workflow",
  "Fix an existing project",
  "Not sure yet",
] as const;

export const metadata = {
  title: "Contact | Ariel Jericko Gacilo",
  description: "Start a conversation with Ariel Jericko Gacilo about web products, Shopify, integrations, automation, and launch support.",
};

/**
 * This form's fields are underlines, not boxes. The shadcn Input/Textarea
 * source is kept as-is and the box treatment is overridden here so the two
 * stay upgradeable.
 */
const field = cn(
  "h-auto rounded-none border-0 border-b border-border bg-transparent px-0 py-[0.7rem]",
  "text-base leading-[1.5] text-foreground md:text-base",
  "placeholder:text-muted-foreground placeholder:opacity-70",
  "focus-visible:border-foreground focus-visible:ring-0"
);

const fieldLabel = "grid min-w-0 gap-[0.45rem]";
const fieldLabelText = "mono-label text-muted-foreground";
const formRow = "grid grid-cols-2 gap-x-5 gap-y-[1.65rem] max-[560px]:grid-cols-1";

export default function ContactPage() {
  return (
    <main
      className={`${measure.wide} pt-[clamp(8rem,14vw,11rem)] pb-[clamp(4rem,8vw,7rem)] max-[560px]:w-[calc(100%_-_2.5rem)]`}
    >
      <section className="grid grid-cols-2 items-start gap-[clamp(2.5rem,5vw,4.5rem)] max-[900px]:grid-cols-1">
        <div className="reveal sticky top-24 max-[900px]:static">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="display mb-5 text-[clamp(2.6rem,4.6vw,4.75rem)] leading-none text-balance max-[900px]:text-[clamp(2.5rem,7vw,4.5rem)]">
            Let&apos;s start a conversation.
          </h1>
          <p className="max-w-[46ch] text-[clamp(0.98rem,1.1vw,1.1rem)] leading-[1.65] text-muted-foreground">
            Tell me what you&apos;re working on, what needs to improve, and what
            timeline you have in mind. I&apos;ll reply with a practical next step.
          </p>
          <div
            className="relative mt-[clamp(2rem,5vw,3.5rem)] max-w-[390px] overflow-hidden rounded-lg bg-secondary shadow-editorial"
            aria-label="Ariel Jericko Gacilo portrait"
          >
            <img
              className="block aspect-[4/5] w-full object-cover object-top [filter:saturate(0.92)_contrast(1.02)]"
              src="/assets/headshot.jpeg"
              alt="Headshot of Ariel Jericko Gacilo"
            />
            <span className="mono-label absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-[rgb(21_20_18/0.72)] p-4 font-extrabold text-paper">
              Manila · Remote-friendly
            </span>
          </div>
        </div>

        <form
          className="reveal grid gap-[1.65rem] border-t border-border pt-[1.75rem]"
          action="mailto:bokzgacilo@gmail.com"
          method="post"
          encType="text/plain"
        >
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
            {/* Native select on purpose: it keeps the OS picker on mobile. */}
            <select
              className={cn(field, "select-caret w-full cursor-pointer appearance-none pr-7 outline-none focus:border-foreground")}
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

          <Button
            className="mt-2 w-fit border-0"
            variant="editorial-primary"
            size="pill"
            type="submit"
          >
            Send it over
          </Button>
        </form>
      </section>

      <section
        className="reveal mt-[clamp(4rem,9vw,8rem)] grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-[clamp(2rem,5vw,4.5rem)] border-t border-border pt-[clamp(1.5rem,4vw,2.6rem)] max-[900px]:grid-cols-1"
        aria-label="Direct contact details"
      >
        <div>
          <Eyebrow>Get in touch</Eyebrow>
          <h2 className="display max-w-[18ch] text-[clamp(1.9rem,3vw,3rem)] leading-[1.05] max-[560px]:max-w-none max-[560px]:text-[1.9rem]">
            Prefer direct contact?
          </h2>
        </div>
        <div className="grid content-start gap-x-8 gap-y-[1.35rem] grid-cols-2 max-[560px]:grid-cols-1">
          {contactLinks.map(([label, value, href]) => (
            <a
              className="grid gap-[0.4rem] border-b border-border pb-[0.8rem] text-base leading-[1.4] font-medium text-foreground no-underline transition-colors [overflow-wrap:anywhere] hover:border-foreground hover:text-brand"
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
            >
              <span className="mono-label text-muted-foreground">{label}</span>
              {value}
            </a>
          ))}
        </div>
      </section>

      <section className="reveal mt-[clamp(3.5rem,7vw,6rem)] flex items-end justify-between gap-8 border-t border-border pt-[clamp(1.5rem,4vw,2.4rem)] max-[560px]:flex-col max-[560px]:items-start">
        <p className="display max-w-[40ch] text-[clamp(1.5rem,2.5vw,2.5rem)] leading-[1.2] text-balance max-[560px]:max-w-none max-[560px]:text-[clamp(1.4rem,6vw,1.9rem)]">
          Web products, commerce systems, and operational workflows move better
          with a steady technical partner.
        </p>
        <span className="mono-label flex-none pb-[0.35rem] text-muted-foreground">
          Available for product and ops builds
        </span>
      </section>
    </main>
  );
}
