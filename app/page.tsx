import Navbar from "@/components/marketing/navbar";
import Hero from "@/components/marketing/hero";
import ValueCards from "@/components/marketing/value-cards";
import HowItWorks from "@/components/marketing/how-it-works";
import DocumentsGrid from "@/components/marketing/documents-grid";
import WhyUs from "@/components/marketing/why-us";
import SampleDeal from "@/components/marketing/sample-deal";
import PricingPreview from "@/components/marketing/pricing-preview";
import FinalCta from "@/components/marketing/final-cta";
import Footer from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Navbar />
      <Hero />
      <ValueCards />
      <HowItWorks />
      <DocumentsGrid />
      <WhyUs />
      <SampleDeal />
      <PricingPreview />
      <FinalCta />
      <Footer />
    </main>
  );
}