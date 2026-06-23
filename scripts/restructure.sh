#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

mkdir -p \
  app/\(public\)/businesses/\[slug\] \
  app/\(public\)/search \
  app/\(public\)/about \
  app/\(auth\)/login \
  app/\(auth\)/register \
  app/\(auth\)/forgot-password \
  app/\(auth\)/verify-email \
  app/dashboard/admin/verification/\[id\] \
  app/dashboard/admin/reviews \
  app/dashboard/owner/businesses/\[id\]/edit \
  app/dashboard/owner/businesses/new \
  app/dashboard/user \
  app/dashboard/verifier/\[id\] \
  src/components/landing \
  src/components/forms \
  src/components/layouts \
  src/components/ui \
  src/features/auth/components \
  src/features/auth/schemas \
  src/features/users/components \
  src/features/users/services \
  src/features/businesses/components \
  src/features/verification/components \
  src/features/search/components \
  src/features/search/services \
  src/features/admin/components \
  src/services \
  src/utils \
  src/repositories

# --- Landing ---
if [ -d app/components/landing ]; then
  cp -R app/components/landing/. src/components/landing/
fi

# --- Auth UI ---
for f in auth-field auth-page-shell auth-panel auth-visual-panel google-icon; do
  [ -f "app/login/components/${f}.tsx" ] && cp "app/login/components/${f}.tsx" "src/features/auth/components/${f}.tsx"
done

# --- Dashboard / business UI ---
[ -f app/dashboard/businesses/business-form.tsx ] && cp app/dashboard/businesses/business-form.tsx src/components/forms/business-form.tsx
for f in dashboard-shell dashboard-sidebar dashboard-header dashboard-cards dashboard-logout-button icons; do
  [ -f "app/dashboard/components/${f}.tsx" ] && cp "app/dashboard/components/${f}.tsx" "src/components/layouts/${f}.tsx"
done
[ -f app/dashboard/components/member-dashboard.tsx ] && cp app/dashboard/components/member-dashboard.tsx src/features/users/components/member-dashboard.tsx
[ -f app/dashboard/components/owner-dashboard.tsx ] && cp app/dashboard/components/owner-dashboard.tsx src/features/businesses/components/owner-dashboard.tsx
[ -f app/dashboard/components/dashboard-data.ts ] && cp app/dashboard/components/dashboard-data.ts src/features/users/services/dashboard-data.ts

# --- Admin / verification UI ---
[ -f app/admin/sign-out-button.tsx ] && cp app/admin/sign-out-button.tsx src/features/admin/components/sign-out-button.tsx
[ -f app/admin/verification/verification-queue.tsx ] && cp app/admin/verification/verification-queue.tsx src/features/verification/components/verification-queue.tsx
[ -f app/admin/verification/\[id\]/verification-decision-form.tsx ] && cp app/admin/verification/\[id\]/verification-decision-form.tsx src/features/verification/components/verification-decision-form.tsx

# --- Services ---
cp src/lib/business/service.ts src/services/business.service.ts
cp src/lib/verification/workflow.ts src/services/verification.service.ts

# --- Auth lib renames (copy; shims written separately) ---
cp src/lib/auth/auth-options.ts src/lib/auth/auth.config.ts
cp src/lib/auth/session.ts src/lib/auth/auth.ts
cp src/lib/auth/roles.ts src/lib/auth/permissions.ts

# --- Validation schemas ---
cp src/lib/validation/auth.ts src/lib/validation/auth.schema.ts
cp src/lib/validation/business.ts src/lib/validation/business.schema.ts
cp src/lib/validation/review.ts src/lib/validation/review.schema.ts
cp src/lib/validation/search.ts src/lib/validation/search.schema.ts
cp src/lib/validation/verification.ts src/lib/validation/verification.schema.ts

# --- Storage ---
cp src/lib/storage/local-files.ts src/lib/storage/upload.ts

# --- Search feature split from lib/ai/search.ts handled in TS manually ---

echo "restructure copy phase done"
