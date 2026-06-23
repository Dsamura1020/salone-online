import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth";
import { publicBusinessWhere } from "@/lib/business/public-visibility";
import { prisma } from "@/lib/prisma/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getPublicBusinessId(businessId: string) {
  return prisma.business.findFirst({
    where: { id: businessId, ...publicBusinessWhere },
    select: { id: true },
  });
}

export async function POST(_request: Request, context: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return jsonError("Please log in to save this business", 401);
  }

  const { id: businessId } = await context.params;
  const business = await getPublicBusinessId(businessId);
  if (!business) {
    return jsonError("Business not found", 404);
  }

  const saved = await prisma.savedBusiness.upsert({
    where: {
      userId_businessId: {
        userId: session.user.id,
        businessId,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      businessId,
    },
    select: { id: true, businessId: true },
  });

  return jsonOk({ saved, isSaved: true }, 201);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return jsonError("Please log in to update saved businesses", 401);
  }

  const { id: businessId } = await context.params;

  await prisma.savedBusiness.deleteMany({
    where: {
      userId: session.user.id,
      businessId,
    },
  });

  return jsonOk({ businessId, isSaved: false });
}
