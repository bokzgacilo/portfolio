import Link from "next/link";

import { JsonLd, breadcrumbs } from "@/app/components/json-ld";
import { Eyebrow, SubPage } from "@/app/components/editorial";
import { absoluteUrl } from "@/app/data/site";

const title = "Claude Chat vs Claude Code: What to Use, When, and How to Set It Up";
const description =
  "A practical comparison of Claude's browser chat experience and Claude Code's terminal workflow, with install and setup steps for developers.";
const published = "2026-09-07";

const comparisonRows = [
  {
    point: "Primary interface",
    chat: "Claude.ai in the browser, desktop app, or mobile app.",
    code: "A command line tool that runs inside your terminal.",
  },
  {
    point: "Best use",
    chat: "Writing, research, brainstorming, analysis, planning, and general Q&A.",
    code: "Repository-aware coding work: reading files, editing code, running commands, and helping move a task through implementation.",
  },
  {
    point: "Project context",
    chat: "You provide context by typing, attaching files, or pasting snippets.",
    code: "It can inspect the local project you launch it from, subject to permissions and settings.",
  },
  {
    point: "Workflow style",
    chat: "Conversational and document-oriented.",
    code: "Task-oriented and terminal-native, useful for iterative development loops.",
  },
  {
    point: "Setup required",
    chat: "Create or sign in to a Claude account and start a conversation.",
    code: "Install the CLI, authenticate, open a project folder, then run `claude`.",
  },
  {
    point: "Outputs",
    chat: "Explanations, drafts, summaries, code examples, tables, and plans.",
    code: "Code changes, command output analysis, refactors, tests, and implementation guidance.",
  },
  {
    point: "Human control",
    chat: "You decide what to copy, run, or apply.",
    code: "You review tool use, permissions, diffs, and command execution while it works in your repository.",
  },
  {
    point: "Subscription path",
    chat: "Free and paid Claude plans are used through Claude.ai.",
    code: "Can authenticate through Anthropic Console billing, Claude Pro or Max, or enterprise platforms.",
  },
] as const;

const setupSteps = [
  "Confirm your machine meets the basics: macOS 10.15+, Ubuntu 20.04+/Debian 10+, or Windows 10+ with WSL or Git for Windows; Node.js 18+; at least 4GB RAM; and an internet connection.",
  "Install Claude Code with `npm install -g @anthropic-ai/claude-code`. Anthropic advises against using `sudo npm install -g` because it can create permission and security issues.",
  "Run `claude doctor` after installation to check the install type, version, and common configuration problems.",
  "Move into the project you want Claude Code to help with, for example `cd your-project`.",
  "Start an interactive session with `claude`.",
  "Authenticate with the option that fits your account: Anthropic Console, a Claude Pro or Max plan, or an enterprise setup through Amazon Bedrock or Google Vertex AI.",
  "Try a small first task, such as asking Claude Code to explain the repository structure or inspect a failing test before asking it to edit files.",
] as const;

export const metadata = {
  title,
  description,
  alternates: { canonical: "/blogs/claude-chat-vs-claude-code" },
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto border border-border bg-card p-4 text-sm leading-relaxed text-foreground">
      <code>{children}</code>
    </pre>
  );
}

export default function ClaudeChatVsClaudeCodePage() {
  return (
    <SubPage className="max-w-[980px]">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "@id": `${absoluteUrl("/blogs/claude-chat-vs-claude-code")}#article`,
            url: absoluteUrl("/blogs/claude-chat-vs-claude-code"),
            headline: title,
            description,
            datePublished: published,
            dateModified: published,
            author: { "@id": `${absoluteUrl("/")}#person` },
          },
          breadcrumbs([
            ["Home", "/"],
            ["Blogs", "/blogs"],
            ["Claude Chat vs Claude Code", "/blogs/claude-chat-vs-claude-code"],
          ]),
        ]}
      />

      <article className="space-y-14">
        <header className="max-w-[820px]">
          <Eyebrow>Developer Guide</Eyebrow>
          <h1 className="display mb-6 text-[clamp(3rem,7vw,6.4rem)] leading-[0.92]">
            Claude Chat vs Claude Code
          </h1>
          <p className="text-[clamp(1.05rem,1.4vw,1.2rem)] leading-8 text-muted-foreground">
            Claude Chat and Claude Code use the same Claude family idea in two different places.
            Claude Chat is where you think, write, compare, and explore. Claude Code is where
            you bring that reasoning into a local development workflow.
          </p>
        </header>

        <section className="grid gap-5 border-t border-border pt-8">
          <h2 className="display text-[clamp(2rem,4vw,3.6rem)] leading-none">
            Short answer
          </h2>
          <p className="max-w-[72ch] leading-8 text-muted-foreground">
            Use Claude Chat when the work is mostly conversation: research notes, product
            thinking, explanations, copy, data analysis, or code snippets. Use Claude Code when
            the work belongs inside a repository: tracing files, planning a change, editing code,
            running checks, and reviewing diffs.
          </p>
        </section>

        <section className="grid gap-6 border-t border-border pt-8">
          <div>
            <Eyebrow className="mb-3">Comparison</Eyebrow>
            <h2 className="display text-[clamp(2rem,4vw,3.6rem)] leading-none">
              Claude Chat vs Claude Code
            </h2>
          </div>

          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead className="bg-card text-foreground">
                <tr>
                  <th className="border-b border-r border-border p-4 font-mono text-xs uppercase">
                    Feature
                  </th>
                  <th className="border-b border-r border-border p-4 font-mono text-xs uppercase">
                    Claude Chat
                  </th>
                  <th className="border-b border-border p-4 font-mono text-xs uppercase">
                    Claude Code
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.point} className="align-top">
                    <th className="border-r border-t border-border p-4 font-bold text-foreground">
                      {row.point}
                    </th>
                    <td className="border-r border-t border-border p-4 leading-7 text-muted-foreground">
                      {row.chat}
                    </td>
                    <td className="border-t border-border p-4 leading-7 text-muted-foreground">
                      {row.code}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-5 border-t border-border pt-8">
          <h2 className="display text-[clamp(2rem,4vw,3.6rem)] leading-none">
            How to choose
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border-l border-border pl-5">
              <h3 className="mb-3 font-mono text-xs uppercase text-brand">
                Choose Claude Chat for
              </h3>
              <ul className="grid gap-3 leading-7 text-muted-foreground">
                <li>Explaining concepts before you open the codebase.</li>
                <li>Drafting blog posts, docs, emails, proposals, and reports.</li>
                <li>Comparing tools, architecture options, and tradeoffs.</li>
                <li>Analyzing pasted snippets or uploaded reference files.</li>
              </ul>
            </div>
            <div className="border-l border-border pl-5">
              <h3 className="mb-3 font-mono text-xs uppercase text-brand">
                Choose Claude Code for
              </h3>
              <ul className="grid gap-3 leading-7 text-muted-foreground">
                <li>Understanding a repository without manually pasting files.</li>
                <li>Making scoped edits while keeping diffs visible.</li>
                <li>Running test, lint, build, or debug commands in context.</li>
                <li>Working through multi-file implementation tasks from the terminal.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-6 border-t border-border pt-8">
          <div>
            <Eyebrow className="mb-3">Install</Eyebrow>
            <h2 className="display text-[clamp(2rem,4vw,3.6rem)] leading-none">
              Claude Code setup guide
            </h2>
          </div>

          <ol className="grid gap-4">
            {setupSteps.map((step, index) => (
              <li
                key={step}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-t border-border pt-4"
              >
                <span className="font-mono text-sm text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="leading-8 text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>

          <CodeBlock>{`npm install -g @anthropic-ai/claude-code
claude doctor
cd your-project
claude`}</CodeBlock>
        </section>

        <section className="grid gap-5 border-t border-border pt-8">
          <h2 className="display text-[clamp(2rem,4vw,3.6rem)] leading-none">
            Everyday workflow
          </h2>
          <p className="max-w-[72ch] leading-8 text-muted-foreground">
            A useful pattern is to start in Claude Chat for broad thinking, then move to Claude
            Code when the work becomes concrete. For example, you might ask Claude Chat to compare
            implementation approaches, then ask Claude Code to inspect the actual repository and
            apply the chosen approach.
          </p>
          <CodeBlock>{`claude "explain this project structure"
claude "find the files involved in the login flow"
claude -p "summarize the current git diff"`}</CodeBlock>
        </section>

        <section className="grid gap-5 border-t border-border pt-8">
          <h2 className="display text-[clamp(2rem,4vw,3.6rem)] leading-none">
            Practical setup notes
          </h2>
          <ul className="grid gap-3 leading-8 text-muted-foreground">
            <li>Open Claude Code from the repository root so it sees the right project context.</li>
            <li>Start with read-only questions before asking it to edit important files.</li>
            <li>Review diffs and command output the same way you would review a teammate's work.</li>
            <li>Use `claude update` when you want to manually update the CLI.</li>
            <li>Use Claude Chat for sensitive summaries or planning when you do not need local file access.</li>
          </ul>
        </section>

        <section className="grid gap-5 border-t border-border pt-8">
          <h2 className="display text-[clamp(2rem,4vw,3.6rem)] leading-none">
            Sources
          </h2>
          <ul className="grid gap-3 leading-7 text-muted-foreground">
            <li>
              <a
                className="font-bold text-brand-dark underline decoration-border underline-offset-[0.35em]"
                href="https://docs.anthropic.com/en/docs/claude-code/getting-started"
                target="_blank"
                rel="noopener noreferrer"
              >
                Anthropic Claude Code setup docs
              </a>
            </li>
            <li>
              <a
                className="font-bold text-brand-dark underline decoration-border underline-offset-[0.35em]"
                href="https://docs.anthropic.com/en/docs/claude-code/cli-usage"
                target="_blank"
                rel="noopener noreferrer"
              >
                Anthropic Claude Code CLI reference
              </a>
            </li>
            <li>
              <a
                className="font-bold text-brand-dark underline decoration-border underline-offset-[0.35em]"
                href="https://support.anthropic.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan"
                target="_blank"
                rel="noopener noreferrer"
              >
                Anthropic Help Center: Claude Code with Pro or Max
              </a>
            </li>
          </ul>
        </section>

        <footer className="border-t border-border pt-8">
          <Link
            className="font-extrabold text-brand-dark underline decoration-border underline-offset-[0.35em]"
            href="/blogs"
          >
            Back to blogs
          </Link>
        </footer>
      </article>
    </SubPage>
  );
}
