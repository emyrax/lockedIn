const formulas = [
  { label: 'Q = mcΔT', top: '8%', left: '1%', size: '0.8rem', color: 'rgba(234,88,12,0.1)', delay: '0s', dur: '22s' },
  { label: 'ΔS = Q/T', top: '20%', right: '2%', size: '0.75rem', color: 'rgba(5,150,105,0.08)', delay: '1.5s', dur: '19s' },
  { label: 'η = 1 − T꜀/Tₕ', top: '40%', left: '2%', size: '0.7rem', color: 'rgba(234,88,12,0.08)', delay: '0.8s', dur: '25s' },
  { label: 'dU = TdS − PdV', top: '55%', right: '3%', size: '0.7rem', color: 'rgba(5,150,105,0.07)', delay: '2.2s', dur: '20s' },
  { label: 'ΔH = ΔU + PΔV', top: '70%', left: '1%', size: '0.7rem', color: 'rgba(234,88,12,0.07)', delay: '0.3s', dur: '24s' },
  { label: 'P + ½ρv² + ρgh = C', top: '82%', right: '1%', size: '0.7rem', color: 'rgba(5,150,105,0.06)', delay: '1s', dur: '21s' },
  { label: 'A₁v₁ = A₂v₂', top: '12%', left: '90%', size: '0.8rem', color: 'rgba(234,88,12,0.07)', delay: '0.5s', dur: '18s' },
  { label: 'Re = ρvL/μ', top: '30%', right: '1%', size: '0.75rem', color: 'rgba(5,150,105,0.06)', delay: '2.5s', dur: '23s' },
  { label: 'F_D = ½ρv²C_D A', top: '48%', left: '90%', size: '0.7rem', color: 'rgba(234,88,12,0.06)', delay: '1.2s', dur: '26s' },
  { label: 'σ = My/I', top: '65%', left: '93%', size: '0.75rem', color: 'rgba(5,150,105,0.06)', delay: '1.8s', dur: '17s' },
  { label: 'F = −kx', top: '75%', left: '5%', size: '0.8rem', color: 'rgba(234,88,12,0.06)', delay: '0.2s', dur: '22s' },
  { label: 'V = IR', top: '85%', right: '5%', size: '0.8rem', color: 'rgba(5,150,105,0.05)', delay: '2s', dur: '20s' },
];

export default function SectionFloatingBg() {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden select-none">
      <style>{`
        @keyframes sec-float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(10px, -8px) rotate(1.5deg); }
          50% { transform: translate(-6px, 6px) rotate(-1deg); }
          75% { transform: translate(8px, 4px) rotate(1deg); }
        }
        .sec-el { animation: sec-float var(--dur, 22s) ease-in-out var(--delay, 0s) infinite; }
      `}</style>
      {formulas.map((el, i) => (
        <div key={i} className="sec-el absolute font-mono font-bold whitespace-nowrap"
          style={{ top: el.top, left: el.left, right: el.right, fontSize: el.size, color: el.color, '--dur': el.dur, '--delay': el.delay }}
        >{el.label}</div>
      ))}
    </div>
  );
}
