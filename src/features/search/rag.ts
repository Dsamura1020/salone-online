"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";
import type { SearchQueryInput } from "@/lib/validation/search";
import { keywordSearch } from "./keyword-search";

export type RagCitation = {
  id: string;
  businessName: string;
  url: string;
  categoryName: string;
  location: string;
  rating: number;
  reviewCount: number;
};

export type RagSearchResponse = {
  question: string;
  answer: string;
  citations: RagCitation[];
  totalMatches: number;
  retrievalMode: "hybrid-vector" | "keyword-only";
  generationMode: "llm" | "template";
};

type RetrievalItem = RagCitation & {
  description: string | null;
  keyScore: number;
};

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
const GENERATION_MODEL = process.env.OPENAI_RAG_MODEL ?? "gpt-4o-mini";

function hasOpenAiKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

async function embedTexts(texts: string[]) {
  if (!hasOpenAiKey() || texts.length === 0) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as {
    data?: Array<{ embedding?: number[] }>;
  };

  const vectors = body.data?.map((item) => item.embedding ?? []);
  if (!vectors || vectors.some((vector) => vector.length === 0)) {
    return null;
  }

  return vectors;
}

function buildEmbeddingContent(item: {
  businessName: string;
  categoryName: string;
  location: string;
  description: string | null;
  rating: number;
}) {
  return [
    `Business: ${item.businessName}`,
    `Category: ${item.categoryName}`,
    `Location: ${item.location}`,
    `Rating: ${item.rating > 0 ? item.rating.toFixed(1) : "New"}`,
    `Description: ${item.description ?? "No description provided."}`,
  ].join("\n");
}

function vectorLiteral(vector: number[]) {
  return `[${vector.map((value) => Number(value.toFixed(6))).join(",")}]`;
}

async function upsertEmbeddingsFromKeywordResults(results: RetrievalItem[]) {
  if (!hasOpenAiKey() || results.length === 0) {
    return;
  }

  const contents = results.map((item) => buildEmbeddingContent(item));
  const vectors = await embedTexts(contents);
  if (!vectors || vectors.length !== results.length) {
    return;
  }

  const businessIds = results.map((item) => item.id);
  await prisma.$executeRaw(
    Prisma.sql`DELETE FROM "SearchEmbedding" WHERE "businessId" IN (${Prisma.join(businessIds)})`,
  );

  for (let index = 0; index < results.length; index += 1) {
    const item = results[index];
    const vector = vectors[index];
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO "SearchEmbedding" (
          "id",
          "businessId",
          "content",
          "embedding",
          "embeddingModel",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          gen_random_uuid(),
          ${item.id},
          ${contents[index]},
          ${vectorLiteral(vector)}::vector,
          ${EMBEDDING_MODEL},
          NOW(),
          NOW()
        )
      `,
    );
  }
}

async function vectorRetrieve(
  question: string,
  input: Omit<SearchQueryInput, "q" | "page" | "limit" | "sort">,
) {
  const vectors = await embedTexts([question]);
  if (!vectors || vectors.length === 0) {
    return [];
  }

  const filters: Prisma.Sql[] = [Prisma.sql`b."isPublished" = true`];
  if (input.categoryId) {
    filters.push(Prisma.sql`b."categoryId" = ${input.categoryId}`);
  }
  if (input.locationId) {
    filters.push(Prisma.sql`b."locationId" = ${input.locationId}`);
  }
  if (input.status) {
    filters.push(Prisma.sql`b."verificationStatus" = ${input.status}`);
  }
  if (typeof input.minRating === "number") {
    filters.push(Prisma.sql`b."averageRating"::float8 >= ${input.minRating}`);
  }
  const whereSql = Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}`;

  type VectorRow = {
    id: string;
    businessName: string;
    slug: string;
    description: string | null;
    categoryName: string;
    city: string;
    stateProvince: string | null;
    country: string;
    rating: number;
    reviewCount: number;
    vectorScore: number;
  };

  const rows = await prisma.$queryRaw<VectorRow[]>(
    Prisma.sql`
      SELECT
        b.id,
        b."businessName",
        b.slug,
        b.description,
        c.name AS "categoryName",
        l.city,
        l."stateProvince",
        l.country,
        b."averageRating"::float8 AS rating,
        b."reviewCount"::int AS "reviewCount",
        (1 - (se.embedding <=> ${vectorLiteral(vectors[0])}::vector))::float8 AS "vectorScore"
      FROM "SearchEmbedding" se
      INNER JOIN "Business" b ON b.id = se."businessId"
      INNER JOIN "BusinessCategory" c ON c.id = b."categoryId"
      INNER JOIN "Location" l ON l.id = b."locationId"
      ${whereSql}
      ORDER BY se.embedding <=> ${vectorLiteral(vectors[0])}::vector ASC
      LIMIT 12
    `,
  );

  return rows.map((row) => ({
    id: row.id,
    businessName: row.businessName,
    url: `/businesses/${row.slug}`,
    categoryName: row.categoryName,
    location: [row.city, row.stateProvince, row.country]
      .filter((part) => Boolean(part))
      .join(", "),
    description: row.description,
    rating: row.rating,
    reviewCount: row.reviewCount,
    keyScore: row.vectorScore,
  }));
}

function summarizeBusiness({
  businessName,
  categoryName,
  location,
  rating,
  reviewCount,
}: RagCitation) {
  const ratingLabel = rating > 0 ? `${rating.toFixed(1)}/5` : "no ratings yet";
  const reviewLabel =
    reviewCount > 0
      ? `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`
      : "no reviews yet";

  return `${businessName} (${categoryName}, ${location}, rating ${ratingLabel}, ${reviewLabel})`;
}

function fuseHybridResults(keywordItems: RetrievalItem[], vectorItems: RetrievalItem[]) {
  const byId = new Map<string, RetrievalItem>();
  const base = new Map<string, number>();

  keywordItems.forEach((item, index) => {
    byId.set(item.id, item);
    base.set(item.id, (base.get(item.id) ?? 0) + 1 / (index + 1 + 10));
  });

  vectorItems.forEach((item, index) => {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
    base.set(item.id, (base.get(item.id) ?? 0) + 1 / (index + 1 + 10));
  });

  return Array.from(byId.values())
    .map((item) => ({ ...item, keyScore: base.get(item.id) ?? 0 }))
    .sort((a, b) => b.keyScore - a.keyScore)
    .slice(0, 5);
}

function buildGroundedAnswer(question: string, citations: RagCitation[], total: number) {
  if (citations.length === 0) {
    return `No matching businesses found for "${question}" yet. Try a simpler keyword, another category, or a different location.`;
  }

  const top = citations.slice(0, 3);
  const topText = top.map((item) => summarizeBusiness(item)).join("; ");

  const totalText =
    total > citations.length
      ? `I found ${total} total matches and highlighted the top ${citations.length} most relevant options.`
      : `I found ${total} matching businesses and highlighted the most relevant options.`;

  return `Based on the current business directory, the strongest matches for "${question}" are: ${topText}. ${totalText}`;
}

async function generateWithLlm(question: string, citations: RagCitation[]) {
  if (!hasOpenAiKey() || citations.length === 0) {
    return null;
  }

  const context = citations
    .map(
      (item, index) =>
        `[${index + 1}] ${item.businessName} | ${item.categoryName} | ${item.location} | rating ${item.rating.toFixed(1)} | ${item.reviewCount} reviews | ${item.url}`,
    )
    .join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GENERATION_MODEL,
      temperature: 0.2,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content:
            "You are a grounded search assistant. Answer only from provided sources. If unsure, say so. Keep response concise and practical.",
        },
        {
          role: "user",
          content: `Question: ${question}\n\nSources:\n${context}\n\nWrite a concise answer and cite relevant sources as [1], [2], etc.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = body.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export async function ragSearch(
  question: string,
  input: Omit<SearchQueryInput, "q" | "page" | "limit" | "sort">,
): Promise<RagSearchResponse> {
  const trimmedQuestion = question.trim();
  const keywordResult = await keywordSearch({
    ...input,
    q: trimmedQuestion,
    page: 1,
    limit: 12,
    sort: "relevance",
  });

  const keywordItems: RetrievalItem[] = keywordResult.results.map((item) => ({
    id: item.id,
    businessName: item.businessName,
    url: item.url,
    categoryName: item.categoryName,
    location: item.location,
    description: item.description,
    rating: item.rating,
    reviewCount: item.reviewCount,
    keyScore: item.personalizedScore,
  }));

  await upsertEmbeddingsFromKeywordResults(keywordItems.slice(0, 8));
  const vectorItems = await vectorRetrieve(trimmedQuestion, input);
  const fused = fuseHybridResults(keywordItems, vectorItems);
  const citations: RagCitation[] = fused.map((item) => ({
    id: item.id,
    businessName: item.businessName,
    url: item.url,
    categoryName: item.categoryName,
    location: item.location,
    rating: item.rating,
    reviewCount: item.reviewCount,
  }));

  const llmAnswer = await generateWithLlm(trimmedQuestion, citations);

  return {
    question: trimmedQuestion,
    answer:
      llmAnswer ??
      buildGroundedAnswer(trimmedQuestion, citations, keywordResult.total),
    citations,
    totalMatches: keywordResult.total,
    retrievalMode:
      vectorItems.length > 0 ? "hybrid-vector" : "keyword-only",
    generationMode: llmAnswer ? "llm" : "template",
  };
}
