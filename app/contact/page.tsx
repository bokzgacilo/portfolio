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

export default function ContactPage() {
  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="contact-intro reveal">
          <p className="eyebrow">Contact</p>
          <h1>Let&apos;s start a conversation.</h1>
          <p>
            Tell me what you&apos;re working on, what needs to improve, and what timeline you have in mind. I&apos;ll reply
            with a practical next step.
          </p>
          <div className="contact-portrait" aria-label="Ariel Jericko Gacilo portrait">
            <img src="/assets/headshot.jpeg" alt="Headshot of Ariel Jericko Gacilo" />
            <span>Manila · Remote-friendly</span>
          </div>
        </div>

        <form className="contact-form reveal" action="mailto:bokzgacilo@gmail.com" method="post" encType="text/plain">
          <div className="form-row">
            <label>
              <span>Your name</span>
              <input name="name" type="text" autoComplete="name" required />
            </label>
            <label>
              <span>Your email</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
          </div>

          <div className="form-row">
            <label>
              <span>Company / project</span>
              <input name="company" type="text" autoComplete="organization" />
            </label>
            <label>
              <span>Website</span>
              <input name="website" type="url" placeholder="https://" />
            </label>
          </div>

          <label>
            <span>What are you interested in discussing?</span>
            <select name="interest" defaultValue="">
              <option value="" disabled>
                Select one
              </option>
              {interests.map((interest) => (
                <option key={interest}>{interest}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Tell me more about the work</span>
            <textarea
              name="message"
              rows={7}
              placeholder="Share the goal, current bottleneck, scope, budget range, or launch date."
              required
            />
          </label>

          <button className="button primary contact-submit" type="submit">
            Send it over
          </button>
        </form>
      </section>

      <section className="contact-details reveal" aria-label="Direct contact details">
        <div>
          <p className="eyebrow">Get in touch</p>
          <h2>Prefer direct contact?</h2>
        </div>
        <div className="contact-detail-grid">
          {contactLinks.map(([label, value, href]) => (
            <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
              <span>{label}</span>
              {value}
            </a>
          ))}
        </div>
      </section>

      <section className="contact-banner reveal">
        <p>Web products, commerce systems, and operational workflows move better with a steady technical partner.</p>
        <span>Available for product and ops builds</span>
      </section>
    </main>
  );
}
