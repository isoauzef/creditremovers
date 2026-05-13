import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { Statistics } from "./components/Statistics";
import { WhatWeRemove } from "./components/WhatWeRemove";
import { HowItWorks } from "./components/HowItWorks";
import { BrandReputation } from "./components/BrandReputation";
import { FeaturedIn } from "./components/FeaturedIn";
import { Testimonials } from "./components/Testimonials";
import { CaseStudies } from "./components/CaseStudies";
import { LeadForm } from "./components/LeadForm";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <Navigation />
      <Hero />
      <Statistics />
      <WhatWeRemove />
      <HowItWorks />
      <BrandReputation />
      <FeaturedIn />
      <Testimonials />
      <CaseStudies />
      <FAQ />
      <LeadForm />
      <Footer />
    </div>
  );
}
