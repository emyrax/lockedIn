const formulas = [
  { label: 'Q = mcΔT', top: '8%', left: '92%', size: '0.8rem', color: 'rgba(234,88,12,0.12)', delay: '0s', dur: '22s' },
  { label: 'ΔS = Q/T', top: '18%', left: '4%', size: '0.75rem', color: 'rgba(5,150,105,0.1)', delay: '1.5s', dur: '19s' },
  { label: 'η = 1 − T꜀/Tₕ', top: '28%', left: '88%', size: '0.7rem', color: 'rgba(234,88,12,0.1)', delay: '0.8s', dur: '25s' },
  { label: 'dU = TdS − PdV', top: '38%', left: '6%', size: '0.7rem', color: 'rgba(5,150,105,0.09)', delay: '2.2s', dur: '20s' },
  { label: 'ΔH = ΔU + PΔV', top: '48%', left: '90%', size: '0.7rem', color: 'rgba(234,88,12,0.08)', delay: '0.3s', dur: '24s' },
  { label: 'P + ½ρv² + ρgh = C', top: '4%', left: '50%', size: '0.7rem', color: 'rgba(5,150,105,0.1)', delay: '1s', dur: '21s' },
  { label: 'A₁v₁ = A₂v₂', top: '14%', left: '50%', size: '0.8rem', color: 'rgba(234,88,12,0.09)', delay: '0.5s', dur: '18s' },
  { label: 'Re = ρvL/μ', top: '32%', left: '50%', size: '0.75rem', color: 'rgba(5,150,105,0.08)', delay: '2.5s', dur: '23s' },
  { label: 'F_D = ½ρv²C_D A', top: '44%', left: '50%', size: '0.7rem', color: 'rgba(234,88,12,0.07)', delay: '1.2s', dur: '26s' },
  { label: '∂v/∂t + v·∇v = −∇p/ρ + ν∇²v + f', top: '56%', left: '50%', size: '0.6rem', color: 'rgba(5,150,105,0.07)', delay: '0.6s', dur: '28s' },
  { label: 'σ = My/I', top: '62%', left: '6%', size: '0.75rem', color: 'rgba(234,88,12,0.08)', delay: '1.8s', dur: '17s' },
  { label: 'F = −kx', top: '70%', left: '90%', size: '0.8rem', color: 'rgba(5,150,105,0.08)', delay: '0.2s', dur: '22s' },
  { label: 'V = IR', top: '76%', left: '4%', size: '0.8rem', color: 'rgba(234,88,12,0.07)', delay: '2s', dur: '20s' },
  { label: 'P = IV', top: '84%', left: '88%', size: '0.8rem', color: 'rgba(5,150,105,0.06)', delay: '0.9s', dur: '24s' },
  { label: '∇·E = ρ/ε₀', top: '90%', left: '50%', size: '0.7rem', color: 'rgba(234,88,12,0.06)', delay: '1.4s', dur: '27s' },
];

export default function MainFloatingElements() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" style={{ zIndex: 0 }}>
      <style>{`
        @keyframes section-float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(10px, -8px) rotate(1.5deg); }
          50% { transform: translate(-6px, 6px) rotate(-1deg); }
          75% { transform: translate(8px, 4px) rotate(1deg); }
        }
        .sec-float-el { animation: section-float var(--dur, 22s) ease-in-out var(--delay, 0s) infinite; }
      `}</style>
      {formulas.map((el, i) => (
        <div
          key={i}
          className="sec-float-el absolute font-mono font-bold whitespace-nowrap"
          style={{
            top: el.top, left: el.left,
            fontSize: el.size, color: el.color,
            '--dur': el.dur, '--delay': el.delay,
          }}
        >{el.label}</div>
      ))}
    </div>
  );
}
