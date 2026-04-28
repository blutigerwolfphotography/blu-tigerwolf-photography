"use server";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { cookies } from "next/headers";
import { COOKIE_NAME, parseSessionToken } from "@/lib/session";
import { buildDownloadObjectCommand, buildGetObjectCommand, getR2Client, listImageKeysForFolder } from "@/lib/r2";

export type GalleryImage = {
  key: string;
  url: string;
  downloadUrl: string;
  name: string;
};

const PRESIGN_TTL_SEC = 60 * 60; // 1 hour

function fileNameFromKey(key: string): string {
  const parts = key.split("/");
  return parts[parts.length - 1] || key;
}

export async function loadGalleryImages(): Promise<{ ok: true; images: GalleryImage[] } | { ok: false; message: string }> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const session = token ? parseSessionToken(token) : null;
  if (!session) {
    return { ok: false, message: "Your session has expired. Please sign in again." };
  }

  try {
    const client = getR2Client();
    const keys = await listImageKeysForFolder(session.folderName);
    const images: GalleryImage[] = [];

    for (const key of keys) {
      const name = fileNameFromKey(key);
      const viewCmd = buildGetObjectCommand(key);
      const dlCmd = buildDownloadObjectCommand(key, name);
      const [url, downloadUrl] = await Promise.all([
        getSignedUrl(client, viewCmd, { expiresIn: PRESIGN_TTL_SEC }),
        getSignedUrl(client, dlCmd, { expiresIn: PRESIGN_TTL_SEC }),
      ]);
      images.push({ key, url, downloadUrl, name });
    }

    return { ok: true, images };
  } catch (err) {
    console.error("loadGalleryImages failed", err);
    return {
      ok: false,
      message:
        "We couldn’t load your gallery right now. Please refresh and try again. If this keeps happening, reach out to your photographer.",
    };
  }
}
