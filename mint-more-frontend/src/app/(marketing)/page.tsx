import { HeroBand } from "@/components/marketing/HeroBand";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PricingSection } from "@/components/marketing/PricingSection";
import { CTABand } from "@/components/marketing/CTABand";

export default function HomePage() {
  return (
    <>
      <HeroBand />
      <FeatureGrid />
      <HowItWorks />
      <PricingSection />
      <CTABand />
    </>
  );
}