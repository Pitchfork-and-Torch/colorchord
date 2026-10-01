import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  return (
    <main className="grid min-h-[calc(100dvh-var(--grok-banner-h,0px))] place-items-center bg-[var(--color-bg)] px-6 py-10 text-[var(--color-fg)]">
      <div className="w-full max-w-sm space-y-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
        <div>
          <p className="text-[0.65rem] font-medium tracking-[0.16em] text-[var(--color-fg-subtle)] uppercase">
            Color Chord
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
            Optional - the instrument works without an account.
          </p>
        </div>
        {authEnabled ? (
          <div className="space-y-2">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-fg-muted)]">Sign-in is disabled.</p>
        )}
        <Link
          to="/"
          className="block text-center text-sm text-[var(--color-fg-muted)] underline-offset-4 hover:text-[var(--color-fg)] hover:underline"
        >
          Back to the wheel
        </Link>
      </div>
    </main>
  );
}
