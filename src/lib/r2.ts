import { GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

let s3: S3Client | null = null;

export function getR2Client(): S3Client {
  if (s3) return s3;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_ENDPOINT;
  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error("Missing R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, or R2_ENDPOINT");
  }
  s3 = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
  return s3;
}

export function getBucketName(): string {
  const name = process.env.R2_BUCKET_NAME;
  if (!name) throw new Error("Missing R2_BUCKET_NAME");
  return name;
}

export async function listImageKeysForFolder(folderName: string): Promise<string[]> {
  const client = getR2Client();
  const bucket = getBucketName();
  const prefix = folderName.replace(/^\/+|\/+$/g, "") + "/";
  const keys: string[] = [];
  let ContinuationToken: string | undefined;

  const imageExt = /\.(jpe?g|png|gif|webp|avif|heic|heif)$/i;

  do {
    const out = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken,
      }),
    );
    for (const obj of out.Contents ?? []) {
      const k = obj.Key;
      if (!k || k.endsWith("/")) continue;
      if (imageExt.test(k)) keys.push(k);
    }
    ContinuationToken = out.IsTruncated ? out.NextContinuationToken : undefined;
  } while (ContinuationToken);

  keys.sort();
  return keys;
}

export function buildGetObjectCommand(key: string): GetObjectCommand {
  return new GetObjectCommand({ Bucket: getBucketName(), Key: key });
}

/** Presigned GET with Content-Disposition so browsers save the file instead of navigating. */
export function buildDownloadObjectCommand(key: string, displayName: string): GetObjectCommand {
  const safe = displayName.replace(/["\r\n]/g, "_").slice(0, 180) || "image";
  return new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    ResponseContentDisposition: `attachment; filename="${safe}"`,
  });
}
