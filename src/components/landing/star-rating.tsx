import { getStarFillRatio } from "@/lib/ratings/half-star";

type StarRatingProps = {
  rating: number;
  max?: number;
  size?: "sm" | "md";
};

export function StarRating({ rating, max = 5, size = "md" }: StarRatingProps) {
  const starSize = size === "sm" ? "size-3 text-base" : "size-4 text-lg";

  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating.toFixed(1)} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, index) => {
        const fillRatio = getStarFillRatio(index, rating);

        return (
          <span key={index} className={`relative inline-block leading-none ${starSize}`}>
            <span className="text-slate-200" aria-hidden="true">
              ★
            </span>
            <span
              className="absolute inset-0 overflow-hidden text-amber-400"
              style={{ width: `${fillRatio * 100}%` }}
              aria-hidden="true"
            >
              ★
            </span>
          </span>
        );
      })}
    </span>
  );
}
