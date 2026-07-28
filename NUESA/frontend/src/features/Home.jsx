import { useState } from 'react';
import { lazy, Suspense } from 'react';
import SectionRenderer from '../components/sections/SectionRenderer';
import SponsorshipCta from '../components/sections/SponsorshipCta';
import LeadershipSection from '../components/sections/LeadershipSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ImpactSimulator from '../components/simulator/ImpactSimulator';
import SponsorshipModal from '../components/payment/SponsorshipModal';

export default function Home() {
  const [sponsorAmount, setSponsorAmount] = useState(null);

  return (
    <>
      <SectionRenderer />
      <LeadershipSection />
      <ProjectsSection />
      <ImpactSimulator onSponsor={(amt) => setSponsorAmount(amt)} />
      <SponsorshipCta />
      <SponsorshipModal
        isOpen={sponsorAmount !== null}
        onClose={() => setSponsorAmount(null)}
        defaultAmount={sponsorAmount || 5000000}
      />
    </>
  );
}