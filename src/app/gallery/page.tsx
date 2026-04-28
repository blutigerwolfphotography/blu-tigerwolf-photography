import Link from "next/link";
import { loadGalleryImages } from "@/app/actions/gallery";
import { logoutAction } from "@/app/actions/auth";
import { GalleryGrid } from "@/components/gallery-grid";
import { LogOut } from "lucide-react";

export default async function GalleryPage() {
  try {
    const result = await loadGalleryImages();

    if (!result.ok) {
      return (
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-sm text-red-200">{result.message}</p>
          <Link href="/login" className="text-sm text-[var(--accent)] underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </div>
      );
    }

    return (
      <div className="mx-auto min-h-dvh max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-4 border-b border-[var(--border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">Private gallery</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your photos</h1>
            <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
              Tap download on any image to save the full-resolution file to your device.
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--foreground)] transition hover:border-[var(--accent-muted)] hover:text-[var(--accent)]"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </form>
        </header>
        <GalleryGrid images={result.images} />
      </div>
    );
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      (err as { digest?: unknown }).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw err;
    }
    console.error("GalleryPage render failed", err);
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-red-200">
          Something went wrong loading the gallery. Please go back and sign in again.
        </p>
        <Link href="/login" className="text-sm text-[var(--accent)] underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }
}
