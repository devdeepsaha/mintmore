import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroBand } from "@/components/marketing/HeroBand";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PricingSection } from "@/components/marketing/PricingSection";
import { CTABand } from "@/components/marketing/CTABand";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <HeroBand />
        <FeatureGrid />
        <HowItWorks />
        <PricingSection />
        <CTABand />
      </main>
      <Footer />
    </>
  );
}