import Link from "next/link";
import { StarRating } from "@/components/landing/star-rating";
import { PinIcon } from "@/components/landing/icons";

export type BusinessDetailSummaryData = {
  businessName: string;
  slug: string;
  description: string | null;
  averageRating: number;
  reviewCount: number;
  categoryName: string;
  city: string;
  stateProvince: string | null;
  country: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
};

type BusinessDetailSummaryProps = {
  business: BusinessDetailSummaryData;
  reviewsAnchor?: string;
};

export function BusinessDetailSummary({
  business,
  reviewsAnchor = "#reviews",
}: BusinessDetailSummaryProps) {
  const region = business.stateProvince ?? business.country;
  const locationLabel = `${business.city}, ${region}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">
        {business.businessName}
      </h2>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
        <PinIcon className="size-4" />
        {locationLabel} · {business.categoryName}
      </p>

      <Link
        href={reviewsAnchor}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 transition hover:bg-amber-100"
      >
        <StarRating rating={business.averageRating} />
        <span className="text-sm font-bold text-slate-800">
          {business.averageRating > 0
            ? business.averageRating.toFixed(1)
            : "New"}
          {business.reviewCount > 0 && (
            <span className="font-medium text-slate-500">
              {" "}
              ({business.reviewCount} reviews)
            </span>
          )}
        </span>
      </Link>

      {business.description && (
        <p className="mt-6 text-base leading-7 text-slate-700">
          {business.description}
        </p>
      )}

      {(business.phone || business.email || business.website) && (
        <dl className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          {business.phone && (
            <div>
              <dt className="font-semibold text-slate-900">Phone</dt>
              <dd>{business.phone}</dd>
            </div>
          )}
          {business.email && (
            <div>
              <dt className="font-semibold text-slate-900">Email</dt>
              <dd>{business.email}</dd>
            </div>
          )}
          {business.website && (
            <div>
              <dt className="font-semibold text-slate-900">Website</dt>
              <dd>
                <a
                  href={business.website}
                  className="text-[#111d63] hover:underline"
                >
                  {business.website}
                </a>
              </dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
