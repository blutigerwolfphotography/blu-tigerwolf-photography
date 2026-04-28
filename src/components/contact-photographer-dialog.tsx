"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { contactPhotographerAction, type ContactPhotographerState } from "@/app/actions/contact";
import { Mail } from "lucide-react";

const initial: ContactPhotographerState = {};

function isOk(s: ContactPhotographerState): s is { ok: true } {
  return "ok" in s && s.ok === true;
}

const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-[var(--accent)]/40 transition placeholder:text-[var(--muted)] focus:border-[var(--accent-muted)] focus:ring-2";

function ContactPhotographerForm({ onSent, onDismiss }: { onSent: () => void; onDismiss: () => void }) {
  const [state, formAction, pending] = useActionState(contactPhotographerAction, initial);

  useEffect(() => {
    if (isOk(state)) onSent();
  }, [state, onSent]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="space-y-2">
        <label htmlFor="reach_out_email" className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
          Your email
        </label>
        <input
          id="reach_out_email"
          name="reach_out_email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="reach_out_parent_name" className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
          Your name
        </label>
        <input
          id="reach_out_parent_name"
          name="reach_out_parent_name"
          type="text"
          autoComplete="name"
          required
          placeholder="Full name"
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="reach_out_child_name" className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
          Child&apos;s name
        </label>
        <input
          id="reach_out_child_name"
          name="reach_out_child_name"
          type="text"
          autoComplete="off"
          required
          placeholder="As you think it may be on file"
          className={inputClass}
        />
      </div>
      {!isOk(state) && state.error ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--border)]/60 hover:text-[var(--foreground)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#1a1508] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Mail className="size-4 shrink-0" aria-hidden />
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}

export function ContactPhotographerDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0);

  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const onSent = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const openDialog = useCallback(() => {
    setFormKey((k) => k + 1);
    dialogRef.current?.showModal();
  }, []);

  return (
    <>
      <p className="mt-10 text-center text-xs text-[var(--muted)]">
        Trouble signing in?{" "}
        <button
          type="button"
          onClick={openDialog}
          className="text-[var(--foreground)]/80 underline decoration-[var(--muted)] underline-offset-2 transition hover:text-[var(--foreground)]"
        >
          Reach out to your photographer.
        </button>
      </p>

      <dialog
        ref={dialogRef}
        className="m-0 max-h-none max-w-none border-0 bg-transparent p-0 text-[var(--foreground)] shadow-none backdrop:bg-black/60 [&::backdrop]:bg-black/60"
        aria-labelledby="contact-dialog-title"
        onClose={() => setFormKey((k) => k + 1)}
      >
        <div
          className="flex min-h-dvh w-screen items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <div
            className="max-h-[min(90dvh,100%)] w-[min(100%,24rem)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="contact-dialog-title" className="text-lg font-semibold tracking-tight">
              Message the studio
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              We&apos;ll email this to the photographer. Replies go to the address you enter below.
            </p>
            <div className="mt-5">
              <ContactPhotographerForm key={formKey} onSent={onSent} onDismiss={closeDialog} />
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
