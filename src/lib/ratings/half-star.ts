export const MIN_RATING_SCORE = 0.5;
export const MAX_RATING_SCORE = 5;
export const HALF_STAR_STEP = 0.5;

export function isValidRatingScore(score: number): boolean {
  if (!Number.isFinite(score) || score < MIN_RATING_SCORE || score > MAX_RATING_SCORE) {
    return false;
  }

  return Math.abs(score * 2 - Math.round(score * 2)) < 0.001;
}

/** First click on a star → half point; second click → full point for that star. */
export function getNextScoreOnStarClick(starIndex: number, current: number): number {
  const half = starIndex + MIN_RATING_SCORE;
  const full = starIndex + 1;

  if (current < half - 0.001) {
    return half;
  }

  if (Math.abs(current - half) < 0.001) {
    return full;
  }

  if (current > full + 0.001) {
    return full;
  }

  if (Math.abs(current - full) < 0.001) {
    return half;
  }

  return full;
}

/** Fill ratio for star at index (0–4): 0, 0.5, or 1 */
export function getStarFillRatio(starIndex: number, rating: number): number {
  if (rating >= starIndex + 1) {
    return 1;
  }

  if (rating >= starIndex + MIN_RATING_SCORE) {
    return 0.5;
  }

  return 0;
}

export function formatRatingScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}
