import Link from "next/link";

import { toolHref, type Tool } from "./data";

type ToolPaginationProps = {
  previous: Tool | null;
  next: Tool | null;
};

function ToolLink({ direction, tool }: { direction: "previous" | "next"; tool: Tool }) {
  const isNext = direction === "next";

  return (
    <Link
      className={`group/tool-nav flex min-h-[132px] flex-col border-r border-b border-border bg-[rgb(255_253_248/0.34)] p-[clamp(1rem,2.5vw,1.5rem)] no-underline transition-colors hover:bg-[rgb(255_253_248/0.72)] ${
        isNext ? "items-end text-right" : ""
      }`}
      href={toolHref(tool)}
    >
      <span className="mono-label text-muted-foreground">
        {isNext ? "Next tool" : "Previous tool"}
      </span>
      <span className="display mt-3 text-[clamp(1.35rem,2.5vw,1.9rem)] leading-[1.02]">
        {tool.title}
      </span>
      <span className="mt-auto pt-5 text-[0.95rem] text-brand">
        <span
          aria-hidden="true"
          className={`inline-block transition-transform ${
            isNext ? "group-hover/tool-nav:translate-x-[3px]" : "group-hover/tool-nav:-translate-x-[3px]"
          }`}
        >
          {isNext ? "->" : "<-"}
        </span>
      </span>
    </Link>
  );
}

export function ToolPagination({ previous, next }: ToolPaginationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      className="mt-[clamp(2.5rem,6vw,4rem)] grid grid-cols-2 border-t border-l border-border max-[760px]:grid-cols-1"
      aria-label="Tool navigation"
    >
      {previous ? (
        <ToolLink direction="previous" tool={previous} />
      ) : (
        <div className="border-r border-b border-border max-[760px]:hidden" aria-hidden="true" />
      )}
      {next ? (
        <ToolLink direction="next" tool={next} />
      ) : (
        <div className="border-r border-b border-border max-[760px]:hidden" aria-hidden="true" />
      )}
    </nav>
  );
}
