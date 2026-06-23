import { prisma } from "@/lib/prisma/prisma";

export type PopularCategoryLink = {
  label: string;
  href: string;
};

export type PopularCategoryOption = {
  id: string;
  label: string;
  name: string;
  slug: string;
  parentCategoryId: string | null;
  parentCategory: {
    id: string;
    name: string;
  } | null;
};

const popularCategoryDefinitions = [
  {
    label: "Education",
    slugs: ["education", "education-training", "higher-education"],
    names: ["Education", "Education & Training", "Higher Education"],
  },
  {
    label: "Tourism",
    slugs: ["tourism", "tourism-hospitality"],
    names: ["Tourism", "Tourism & Hospitality"],
  },
  {
    label: "Healthcare",
    slugs: ["healthcare", "health-medical"],
    names: ["Healthcare", "Health & Medical"],
  },
  {
    label: "Agriculture",
    slugs: ["agriculture", "agriculture-agribusiness"],
    names: ["Agriculture", "Agriculture & Agribusiness"],
  },
  {
    label: "Government Services",
    slugs: ["government-services", "government"],
    names: ["Government Services", "Government"],
  },
];

export async function getPopularCategoryOptions(): Promise<PopularCategoryOption[]> {
  const categories = await prisma.businessCategory.findMany({
    where: {
      OR: popularCategoryDefinitions.flatMap((category) => [
        { slug: { in: category.slugs } },
        { name: { in: category.names } },
      ]),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      parentCategoryId: true,
      parentCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return popularCategoryDefinitions.flatMap((definition) => {
    const match = categories.find(
      (category) =>
        definition.slugs.includes(category.slug) ||
        definition.names.includes(category.name),
    );

    if (!match) {
      return [];
    }

    return {
      ...match,
      label: definition.label,
    };
  });
}

export async function getPopularCategoryLinks(): Promise<PopularCategoryLink[]> {
  const categories = await getPopularCategoryOptions();

  return popularCategoryDefinitions.map((definition) => {
    const match = categories.find((category) => category.label === definition.label);
    const params = new URLSearchParams(
      match ? { categoryId: match.id } : { q: definition.label },
    );

    return {
      label: definition.label,
      href: `/search?${params.toString()}`,
    };
  });
}
