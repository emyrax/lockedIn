export function useImpactCalculator(initialAmount = 5000000) {
  const tiers = [
    { label: 'Bronze', min: 1000000, max: 4999999, color: '#cd7f32' },
    { label: 'Silver', min: 5000000, max: 24999999, color: '#c0c0c0' },
    { label: 'Gold', min: 25000000, max: 99999999, color: '#ffd700' },
    { label: 'Platinum', min: 100000000, max: Infinity, color: '#e5e4e2' },
  ];

  function computeOutcomes(amount) {
    const tier = tiers.find(t => amount >= t.min && amount <= t.max) || tiers[0];
    let perks = [];

    if (amount >= 100000000) {
      perks = [
        'Naming Rights to a major Departmental Laboratory',
        'Direct IP Co-development & Joint Patent rights',
        'Executive Advisory Board Seat on NUESA Curriculum Committee',
        'Exclusive recruitment access before general graduation',
      ];
    } else if (amount >= 25000000) {
      perks = [
        'Equips a specialized Testing Bay in Electronic/Mechanical Eng.',
        'Priority Access to Top 5% Graduating Class Resume Book',
        'Dedicated Campus Hackathon Sponsorship & Mentorship Hub',
      ];
    } else if (amount >= 5000000) {
      perks = [
        'Fully funds a 5-person Senior Capstone Team project',
        'Corporate Brand Placement at the Annual NUESA Expo',
        'Logo listing on the NUESA UNN Sponsorship Portal',
      ];
    } else {
      perks = [
        'Supports student workshop materials & prototyping tools',
        'Logo listing on the NUESA UNN Sponsorship Portal',
      ];
    }

    return {
      equipment: Math.round(amount * 0.5),
      stipends: Math.round(amount * 0.3),
      materials: Math.round(amount * 0.2),
      students: Math.round(amount / 100000),
      tier: tier.label,
      tierColor: tier.color,
      perks,
    };
  }

  return { computeOutcomes, tiers };
}