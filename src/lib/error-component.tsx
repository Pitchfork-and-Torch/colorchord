import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--color-bg,#070709)] px-6 text-center text-[var(--color-fg,#f0f0f2)]">
      <span className="text-[var(--color-fg-muted,#9b9ba6)]" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={1.75} />
      </span>
      <h1 className="text-lg font-semibold tracking-tight">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-[var(--color-fg-muted,#9b9ba6)]">
        {error.message || "An unexpected error occurred. Try reloading the page."}
      </p>
    </main>
  );
}
