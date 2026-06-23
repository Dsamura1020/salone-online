import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import {
  deleteUserAvatarUpload,
  saveUserAvatarUpload,
} from "@/lib/storage/local-files";

const ALLOWED_AVATAR_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const formData = await request.formData();
    const avatar = formData.get("avatar");
    if (!(avatar instanceof File)) {
      return jsonError("Profile photo is required", 400);
    }

    if (!ALLOWED_AVATAR_TYPES.has(avatar.type)) {
      return jsonError("Profile photo must be PNG, JPG, JPEG, or WEBP", 400);
    }
    if (avatar.size > MAX_AVATAR_BYTES) {
      return jsonError("Profile photo must be 2MB or smaller", 400);
    }

    const existing = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    const uploaded = await saveUserAvatarUpload({
      userId: session.user.id,
      file: avatar,
    });

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: uploaded.publicPath },
      select: { id: true, image: true },
    });

    if (existing?.image && existing.image !== updated.image) {
      await deleteUserAvatarUpload(existing.image);
    }

    return jsonOk(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Profile photo upload failed";
    return jsonError(message, 500);
  }
}

export async function DELETE() {
  try {
    const session = await requireAuth();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const existing = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
      select: { id: true, image: true },
    });

    if (existing?.image) {
      await deleteUserAvatarUpload(existing.image);
    }

    return jsonOk(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Profile photo removal failed";
    return jsonError(message, 500);
  }
}
