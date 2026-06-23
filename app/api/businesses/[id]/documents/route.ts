import { DocumentType } from "@prisma/client";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { saveBusinessUpload } from "@/lib/storage/local-files";

const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isDocumentType(value: string): value is DocumentType {
  return Object.values(DocumentType).includes(value as DocumentType);
}

export async function GET(_request: Request, context: RouteContext) {
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

  const documents = await prisma.businessDocument.findMany({
    where: { businessId },
    orderBy: { uploadedAt: "desc" },
  });

  return jsonOk(
    documents.map((document) => ({
      ...document,
      fileSize: document.fileSize.toString(),
    })),
  );
}

export async function POST(request: Request, context: RouteContext) {
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
  const file = formData.get("document");
  const documentType = formData.get("documentType");

  if (!(file instanceof File)) {
    return jsonError("Document file is required", 400);
  }
  if (typeof documentType !== "string" || !isDocumentType(documentType)) {
    return jsonError("Invalid document type", 400);
  }

  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
    return jsonError("Document must be PDF, PNG, JPG, or WEBP", 400);
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return jsonError("Document must be 10MB or smaller", 400);
  }

  const uploaded = await saveBusinessUpload({
    businessId,
    file,
    bucket: "documents",
  });

  const document = await prisma.businessDocument.create({
    data: {
      businessId,
      uploadedById: session.user.id,
      documentType,
      fileName: uploaded.originalName,
      fileUrl: uploaded.publicPath,
      mimeType: file.type,
      fileSize: uploaded.fileSize,
    },
  });

  return jsonOk(
    {
      ...document,
      fileSize: document.fileSize.toString(),
    },
    201,
  );
}
