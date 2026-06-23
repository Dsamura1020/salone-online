import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

type ObjectStorageConfig = {
  bucket: string;
  client: S3Client;
  publicBase?: string;
};

function trimTrailingSlash(value: string | undefined) {
  return value?.replace(/\/$/, "");
}

function normalizePublicBase(value: string | undefined) {
  const trimmed = trimTrailingSlash(value);
  if (!trimmed) {
    return undefined;
  }

  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getR2Config(): ObjectStorageConfig | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  return {
    bucket,
    client: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    }),
    publicBase: normalizePublicBase(process.env.R2_PUBLIC_DOMAIN),
  };
}

function getAwsS3Config(): ObjectStorageConfig | null {
  const region = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;
  if (!region || !process.env.S3_BUCKET) {
    return null;
  }

  return {
    bucket: process.env.S3_BUCKET,
    client: new S3Client({ region }),
    publicBase: normalizePublicBase(process.env.S3_PUBLIC_BASE_URL),
  };
}

function getObjectStorageConfig() {
  return getR2Config() ?? getAwsS3Config();
}

export function isS3Enabled() {
  return Boolean(getObjectStorageConfig());
}

export async function uploadToS3(params: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  const config = getObjectStorageConfig();

  if (!config) {
    throw new Error("Object storage is not configured");
  }

  await config.client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    }),
  );

  const publicPath = config.publicBase
    ? `${config.publicBase}/${params.key}`
    : `https://${config.bucket}.s3.amazonaws.com/${params.key}`;

  return { publicPath };
}

export async function deleteFromS3(publicPath: string) {
  const config = getObjectStorageConfig();

  if (!config) {
    return;
  }

  const key = config.publicBase && publicPath.startsWith(config.publicBase)
    ? publicPath.slice(config.publicBase.length + 1)
    : publicPath.replace(/^https?:\/\/[^/]+\//, "");

  await config.client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}
