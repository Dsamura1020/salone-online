export type RegisteredBusiness = {
  id: string;
  ownerId: string;
  businessName: string;
  slug: string;
  description: string | null;
  averageRating: number;
  reviewCount: number;
  ratingCount: number;
  isVerified: boolean;
  categoryName: string;
  city: string;
  stateProvince: string | null;
  country: string;
  imageUrl: string | null;
};

export const BUSINESS_FALLBACK_IMAGES = [
  "/images/salone.jpg",
  "/images/salone1.jpg",
  "/images/salone2.jpg",
  "/images/salone3.jpg",
  "/images/salone4.jpg",
];

export function formatBusinessLocation(business: RegisteredBusiness) {
  const region = business.stateProvince ?? business.country;
  return `${business.city}, ${region}`;
}
