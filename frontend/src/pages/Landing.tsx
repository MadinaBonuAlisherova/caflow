import { HeroSection } from '@/components/landing/HeroSection';
import { CaterAiHub } from '@/components/landing/CaterAiHub';
import { TrustStats } from '@/components/landing/TrustStats';
import { PartnerMarquee } from '@/components/landing/PartnerMarquee';
import { SolutionsShowcase } from '@/components/landing/SolutionsShowcase';
import { BrowseTypesStrip } from '@/components/landing/BrowseTypesStrip';
import { CategoriesSection } from '@/components/landing/CategoriesSection';
import { FeaturedCaterers } from '@/components/landing/FeaturedCaterers';
import { WhyCaterFlow } from '@/components/landing/WhyCaterFlow';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { MarketsStrip } from '@/components/landing/MarketsStrip';
import { LandingCta } from '@/components/landing/LandingCta';
import { VendorCta } from '@/components/landing/VendorCta';

export default function Landing() {
  return (
    <div className="relative bg-cream">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 0%, rgba(242,183,5,0.16), transparent 58%), radial-gradient(ellipse at 80% 20%, rgba(91,42,78,0.05), transparent 40%)',
        }}
      />

      {/* Hero intake — ZeroCater-style location-first planning */}
      <section className="border-b border-line/50 pb-6 md:pb-8">
        <HeroSection />
        <CaterAiHub />
      </section>

      <PartnerMarquee />
      <SolutionsShowcase />
      <FeaturedCaterers />
      <BrowseTypesStrip />
      <WhyCaterFlow />
      <CategoriesSection />
      <HowItWorks />
      <TrustStats className="pb-8 pt-2 md:pb-10" />
      <TestimonialsSection />
      <MarketsStrip />
      <LandingCta />
      <VendorCta />
    </div>
  );
}
