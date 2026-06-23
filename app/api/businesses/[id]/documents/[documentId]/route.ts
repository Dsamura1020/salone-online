import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { deleteBusinessUpload } from "@/lib/storage/local-files";

type RouteContext = {
  params: Promise<{ id: string; documentId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const { id: businessId, documentId } = await context.params;

  const document = await prisma.businessDocument.findFirst({
    where: {
      id: documentId,
      businessId,
      business: { ownerId: session.user.id },
    },
    select: {
      id: true,
      fileUrl: true,
    },
  });

  if (!document) {
    return jsonError("Document not found or access denied", 404);
  }

  await prisma.businessDocument.delete({
    where: { id: document.id },
  });

  await deleteBusinessUpload(document.fileUrl);

  return jsonOk({ id: document.id, deleted: true });
}
