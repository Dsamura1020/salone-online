export function buildBusinessSearchText(business: {
  businessName: string;
  description: string | null;
  category?: { name: string } | null;
  location?: {
    city: string;
    stateProvince: string | null;
    country: string;
  } | null;
}): string {
  const parts = [
    business.businessName,
    business.description,
    business.category?.name,
    business.location
      ? [business.location.city, business.location.stateProvince, business.location.country]
          .filter(Boolean)
          .join(", ")
      : null,
  ];
  return parts.filter(Boolean).join("\n");
}
