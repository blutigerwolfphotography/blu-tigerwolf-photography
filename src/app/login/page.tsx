import { LoginForm } from "@/components/login-form";
import { ContactPhotographerDialog } from "@/components/contact-photographer-dialog";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-16">
      <div className="mb-10 flex flex-col items-center text-center">
        <Image
          src="/blu-tiger-wolf-photography-logo.png"
          alt="Blu Tiger Wolf Photography"
          width={239}
          height={221}
          priority
          className="mb-6 h-auto w-[min(280px,85vw)] max-w-full"
        />
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Studio Gallery</h1>
        <p className="mt-2 max-w-xs text-sm text-[var(--muted)]">Sign in with the email and child name we have on file.</p>
      </div>
      <LoginForm />
      <ContactPhotographerDialog />
    </div>
  );
}
