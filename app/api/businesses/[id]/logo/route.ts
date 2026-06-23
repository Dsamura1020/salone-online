import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { saveBusinessUpload } from "@/lib/storage/local-files";

const ALLOWED_LOGO_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { id: businessId } = await context.params;
    const business = await prisma.business.findFirst({
      where: { id: businessId, ownerId: session.user.id },
      select: { id: true },
    });

    if (!business) {
      return jsonError("Business not found or access denied", 404);
    }

    const formData = await request.formData();
    const logo = formData.get("logo");
    if (!(logo instanceof File)) {
      return jsonError("Logo file is required", 400);
    }

    if (!ALLOWED_LOGO_TYPES.has(logo.type)) {
      return jsonError("Logo must be PNG, JPG, JPEG, or WEBP", 400);
    }
    if (logo.size > MAX_LOGO_BYTES) {
      return jsonError("Logo must be 2MB or smaller", 400);
    }

    const uploaded = await saveBusinessUpload({
      businessId,
      file: logo,
      bucket: "logos",
    });

    const updated = await prisma.business.update({
      where: { id: businessId },
      data: { logoUrl: uploaded.publicPath },
      select: {
        id: true,
        logoUrl: true,
      },
    });

    return jsonOk(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Logo upload failed";
    return jsonError(message, 500);
  }
}
