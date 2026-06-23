import { Prisma } from "@prisma/client";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth";
import { createBusiness, listOwnerBusinesses } from "@/lib/business/service";
import { createBusinessSchema } from "@/lib/validation/business";

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const businesses = await listOwnerBusinesses(session.user.id);
  return jsonOk(businesses);
}

export async function POST(request: Request) {
  const session = await requireAuth();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = createBusinessSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  try {
    const business = await createBusiness(session.user.id, parsed.data);
    return jsonOk(business, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return jsonError(
          "Invalid linked data (owner/category/location). Please refresh and sign in again.",
          400,
        );
      }
      if (error.code === "P2025") {
        return jsonError("Referenced data not found. Please refresh and try again.", 400);
      }
    }
    const message = error instanceof Error ? error.message : "Business creation failed";
    return jsonError(message, 400);
  }
}
