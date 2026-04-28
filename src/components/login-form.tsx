"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { LogIn } from "lucide-react";

const initial: LoginState = {};

function isOk(s: LoginState): s is { ok: true } {
  return "ok" in s && s.ok === true;
}

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(loginAction, initial);

  useEffect(() => {
    if (isOk(state)) {
      router.replace("/gallery");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-[var(--accent)]/40 transition placeholder:text-[var(--muted)] focus:border-[var(--accent-muted)] focus:ring-2"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="child_name" className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
          Child&apos;s name
        </label>
        <input
          id="child_name"
          name="child_name"
          type="text"
          autoComplete="name"
          required
          placeholder="As registered with the studio"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-[var(--accent)]/40 transition placeholder:text-[var(--muted)] focus:border-[var(--accent-muted)] focus:ring-2"
        />
      </div>
      {!isOk(state) && state.error ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[#1a1508] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn className="size-4 shrink-0" aria-hidden />
        {pending ? "Signing in…" : "View gallery"}
      </button>
    </form>
  );
}
