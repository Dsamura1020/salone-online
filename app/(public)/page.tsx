import { CategoriesSection } from "@/components/landing/categories-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { MostRatedSection } from "@/components/landing/most-rated-section";
import { PlatformHighlights } from "@/components/landing/platform-highlights";
import { StepsSection } from "@/components/landing/steps-section";
import { getSession } from "@/lib/auth/auth";
import { getLandingPageData } from "@/lib/landing/landing-data";
import { getPopularCategoryLinks } from "@/lib/landing/popular-categories";

export default async function HomePage() {
  const [{ topRatedBusinesses }, session, popularCategories] = await Promise.all([
    getLandingPageData(),
    getSession(),
    getPopularCategoryLinks(),
  ]);

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <Header />
      <HeroSection quickCategories={popularCategories} />
      <PlatformHighlights />
      <MostRatedSection
        businesses={topRatedBusinesses}
        currentUserId={session?.user?.id ?? null}
      />
      <FeaturesSection />
      <CategoriesSection categories={popularCategories} />
      <StepsSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
