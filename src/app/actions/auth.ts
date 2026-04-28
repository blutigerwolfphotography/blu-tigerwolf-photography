"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { COOKIE_NAME, createSessionToken, MAX_AGE_SEC } from "@/lib/session";

function escapeIlikeExact(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export type LoginState = { error?: string } | { ok: true };

export async function loginAction(_prev: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const childName = String(formData.get("child_name") ?? "").trim();

  if (!email || !childName) {
    return { error: "Please enter your email and your child’s name." };
  }

  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 16) {
    console.error("loginAction: SESSION_SECRET missing/too short");
    return { error: "This gallery is not configured yet. Please contact your photographer." };
  }

  const supabase = getSupabaseAdmin();
  const emailPattern = escapeIlikeExact(email);
  const { data: rows, error } = await supabase
    .from("student_access")
    .select("folder_name, child_name")
    .ilike("email", emailPattern);

  if (error) {
    console.error("student_access query", error);
    return { error: "We could not verify access right now. Please try again." };
  }

  const match = (rows ?? []).find(
    (row) => row.child_name && String(row.child_name).trim().toLowerCase() === childName.toLowerCase(),
  );

  if (!match?.folder_name) {
    return { error: "No gallery was found for that email and name. Check spelling and try again." };
  }

  const folderName = String(match.folder_name).trim();
  if (!folderName) {
    return { error: "This account is not configured with a gallery folder yet." };
  }

  const token = createSessionToken(folderName);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  redirect("/login");
}
