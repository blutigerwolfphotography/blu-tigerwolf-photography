import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME } from "@/lib/gallery-session/constants";
import { parseSessionToken } from "@/lib/session";

export default async function GalleryLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) redirect("/login");

  try {
    if (!parseSessionToken(token)) redirect("/login");
  } catch (err) {
    console.error("GalleryLayout: parseSessionToken failed", err);
    redirect("/login");
  }
  return <>{children}</>;
}
