import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { deleteFromS3, isS3Enabled, uploadToS3 } from "./s3";

function extensionFromName(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  return ext || "";
}

function normalizeOriginalName(fileName: string) {
  const trimmed = fileName.trim();
  return trimmed.length > 0 ? trimmed : "upload.bin";
}

async function saveLocalUpload(params: {
  entityId: string;
  file: File;
  entity: "businesses" | "users";
  bucket: "logos" | "documents" | "avatar";
}) {
  const { entityId, file, entity, bucket } = params;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const originalName = normalizeOriginalName(file.name || "upload.bin");
  const extension = extensionFromName(originalName);
  const fileName = `${randomUUID()}${extension}`;

  const relativeDirectory = path.join("uploads", entity, entityId, bucket);
  const absoluteDirectory = path.join(process.cwd(), "public", relativeDirectory);
  await mkdir(absoluteDirectory, { recursive: true });

  const absolutePath = path.join(absoluteDirectory, fileName);
  await writeFile(absolutePath, buffer);

  const publicPath = `/${path.join(relativeDirectory, fileName).replaceAll("\\", "/")}`;
  return {
    publicPath,
    originalName,
    fileSize: BigInt(buffer.byteLength),
  };
}

export async function saveBusinessUpload(params: {
  businessId: string;
  file: File;
  bucket: "logos" | "documents";
}) {
  const { businessId, file, bucket } = params;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const originalName = normalizeOriginalName(file.name || "upload.bin");
  const extension = extensionFromName(originalName);
  const fileName = `${randomUUID()}${extension}`;

  if (isS3Enabled()) {
    const key = path
      .join("uploads", "businesses", businessId, bucket, fileName)
      .replaceAll("\\", "/");
    const { publicPath } = await uploadToS3({
      key,
      body: buffer,
      contentType: file.type || "application/octet-stream",
    });

    return {
      publicPath,
      originalName,
      fileSize: BigInt(buffer.byteLength),
    };
  }

  return saveLocalUpload({
    entityId: businessId,
    entity: "businesses",
    file,
    bucket,
  });
}

export async function saveUserAvatarUpload(params: {
  userId: string;
  file: File;
}) {
  const { userId, file } = params;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const originalName = normalizeOriginalName(file.name || "avatar.bin");
  const extension = extensionFromName(originalName);
  const fileName = `${randomUUID()}${extension}`;

  if (isS3Enabled()) {
    const key = path
      .join("uploads", "users", userId, "avatar", fileName)
      .replaceAll("\\", "/");
    const { publicPath } = await uploadToS3({
      key,
      body: buffer,
      contentType: file.type || "application/octet-stream",
    });

    return {
      publicPath,
      originalName,
      fileSize: BigInt(buffer.byteLength),
    };
  }

  return saveLocalUpload({
    entityId: userId,
    entity: "users",
    file,
    bucket: "avatar",
  });
}

export async function deleteBusinessUpload(publicPath: string) {
  if (isS3Enabled() && publicPath.startsWith("http")) {
    await deleteFromS3(publicPath);
    return;
  }

  if (!publicPath.startsWith("/uploads/businesses/")) {
    return;
  }

  const relativePath = publicPath.replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  try {
    await unlink(absolutePath);
  } catch (error) {
    const isMissingFile =
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT";

    if (!isMissingFile) {
      throw error;
    }
  }
}

export async function deleteUserAvatarUpload(publicPath: string) {
  if (
    isS3Enabled() &&
    publicPath.startsWith("http") &&
    publicPath.includes("/uploads/users/")
  ) {
    await deleteFromS3(publicPath);
    return;
  }

  if (!publicPath.startsWith("/uploads/users/")) {
    return;
  }

  const relativePath = publicPath.replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  try {
    await unlink(absolutePath);
  } catch (error) {
    const isMissingFile =
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT";

    if (!isMissingFile) {
      throw error;
    }
  }
}
