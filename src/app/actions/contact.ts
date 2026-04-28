"use server";

export type ContactPhotographerState = { error?: string } | { ok: true };

function trimField(value: unknown, max: number): string {
  const s = String(value ?? "").trim();
  if (s.length > max) return s.slice(0, max);
  return s;
}

function parseToEmails(raw: string): string[] {
  // Support a single email or comma/space separated list.
  const parts = raw
    .split(/[\s,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  // Very lightweight validation (Resend will still validate strictly).
  const emails = parts.filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
  // De-dupe while preserving order.
  return Array.from(new Set(emails));
}

export async function contactPhotographerAction(
  _prev: ContactPhotographerState | undefined,
  formData: FormData,
): Promise<ContactPhotographerState> {
  const email = trimField(formData.get("reach_out_email"), 320).toLowerCase();
  const parentName = trimField(formData.get("reach_out_parent_name"), 200);
  const childName = trimField(formData.get("reach_out_child_name"), 200);

  if (!email || !parentName || !childName) {
    return { error: "Please fill in your email, your name, and your child’s name." };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const toRaw = process.env.CONTACT_TO_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();

  if (!apiKey || !toRaw || !from) {
    console.error("contactPhotographerAction: missing RESEND_API_KEY, CONTACT_TO_EMAIL, or CONTACT_FROM_EMAIL");
    return { error: "This form is not configured yet. Please email the studio directly." };
  }

  const to = parseToEmails(toRaw);
  if (to.length === 0) {
    console.error("contactPhotographerAction: CONTACT_TO_EMAIL did not contain a valid email address", { toRaw });
    return { error: "This form is not configured yet. Please email the studio directly." };
  }

  const subject = `Gallery help: ${parentName}`;
  const text = [
    "Someone submitted the “reach out to your photographer” form on the login page.",
    "",
    `Parent / guardian name: ${parentName}`,
    `Email: ${email}`,
    `Child’s name: ${childName}`,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      reply_to: email,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Resend API error", res.status, body);
    return { error: "We could not send your message. Please try again in a few minutes." };
  }

  return { ok: true };
}
