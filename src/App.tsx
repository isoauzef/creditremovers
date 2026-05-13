import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { Statistics } from "./components/Statistics";
import { WhatWeRemove } from "./components/WhatWeRemove";
import { CreditAccessAct } from "./components/CreditAccessAct";
import { HowItWorks } from "./components/HowItWorks";
import { LeadForm } from "./components/LeadForm";
import { FAQ } from "./components/FAQ";
import { CrossNavCTA } from "./components/CrossNavCTA";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <Navigation />
      <Hero />
      <Statistics />
      <WhatWeRemove />
      <CreditAccessAct />
      <HowItWorks />
      <LeadForm />
      <FAQ />
      <CrossNavCTA />
      <Footer />
    </div>
  );
}
