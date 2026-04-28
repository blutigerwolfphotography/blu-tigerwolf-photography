import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME } from "@/lib/gallery-session/constants";
import { parseSessionToken } from "@/lib/session";

export default async function GalleryLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !parseSessionToken(token)) {
    redirect("/login");
  }
  return <>{children}</>;
}
