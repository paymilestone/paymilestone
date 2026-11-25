import {
  CtaBandSection,
  FaqSection,
  FeaturesSection,
  HeroSection,
  HowItWorksSection,
  LandingFooter,
  WhoItsForSection,
  WhyPayMilestoneSection,
} from "@/components/layout/landing";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white font-sans">
      <HeroSection />
      <WhoItsForSection />
      <HowItWorksSection />
      <FeaturesSection />
      <WhyPayMilestoneSection />
      <FaqSection />
      <CtaBandSection />
      <LandingFooter />
    </main>
  );
}
