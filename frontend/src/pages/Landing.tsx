import { HeroSection } from '@/components/landing/HeroSection';
import { CaterAiHub } from '@/components/landing/CaterAiHub';

/** Minimal homepage showcase — hero + CaterAi intake UI */
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

      <section className="border-b border-line/50 pb-8 md:pb-10">
        <HeroSection />
        <CaterAiHub />
      </section>
    </div>
  );
}
