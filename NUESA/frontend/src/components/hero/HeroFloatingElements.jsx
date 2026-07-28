const elements = [
  { label: 'E = mc²', top: '12%', left: '5%', size: '0.9rem', color: 'rgba(234,88,12,0.18)', delay: '0s', dur: '22s' },
  { label: 'F = ma', top: '8%', right: '8%', size: '0.8rem', color: 'rgba(5,150,105,0.15)', delay: '1s', dur: '19s' },
  { label: '∑', top: '18%', right: '22%', size: '1.3rem', color: 'rgba(234,88,12,0.12)', delay: '0.5s', dur: '25s' },
  { label: '∫ f(x) dx', top: '25%', left: '3%', size: '0.75rem', color: 'rgba(5,150,105,0.14)', delay: '2s', dur: '20s' },
  { label: 'π', top: '40%', right: '4%', size: '1.4rem', color: 'rgba(234,88,12,0.1)', delay: '0s', dur: '28s' },
  { label: '∇·B = 0', top: '50%', left: '2%', size: '0.7rem', color: 'rgba(5,150,105,0.12)', delay: '1.5s', dur: '18s' },
  { label: '√(x² + y²)', top: '60%', right: '6%', size: '0.7rem', color: 'rgba(234,88,12,0.1)', delay: '0.8s', dur: '24s' },
  { label: 'PV = nRT', top: '68%', left: '6%', size: '0.75rem', color: 'rgba(5,150,105,0.12)', delay: '2.5s', dur: '21s' },
  { label: '∂y/∂x', top: '76%', right: '3%', size: '0.8rem', color: 'rgba(234,88,12,0.1)', delay: '1.2s', dur: '26s' },
  { label: 'θ', top: '82%', left: '4%', size: '1.1rem', color: 'rgba(5,150,105,0.1)', delay: '0.3s', dur: '23s' },
  { label: '±', top: '30%', left: '9%', size: '1rem', color: 'rgba(234,88,12,0.08)', delay: '3s', dur: '30s' },
  { label: '∫∫', top: '72%', left: '1%', size: '0.9rem', color: 'rgba(5,150,105,0.08)', delay: '1.8s', dur: '17s' },
];

const thermoFluid = [
  { label: 'Q = mcΔT', top: '16%', left: '82%', size: '0.8rem', color: 'rgba(234,88,12,0.16)', delay: '0.4s', dur: '20s' },
  { label: 'ΔS = Q/T', top: '28%', left: '78%', size: '0.75rem', color: 'rgba(5,150,105,0.13)', delay: '2.2s', dur: '23s' },
  { label: 'η = 1 − T꜀/Tₕ', top: '42%', left: '82%', size: '0.7rem', color: 'rgba(234,88,12,0.11)', delay: '1.1s', dur: '19s' },
  { label: 'dU = TdS − PdV', top: '52%', left: '75%', size: '0.7rem', color: 'rgba(5,150,105,0.1)', delay: '0.7s', dur: '26s' },
  { label: 'ΔH = ΔU + PΔV', top: '63%', left: '78%', size: '0.7rem', color: 'rgba(234,88,12,0.1)', delay: '3s', dur: '22s' },
  { label: 'P + ½ρv² + ρgh = const', top: '20%', left: '12%', size: '0.65rem', color: 'rgba(5,150,105,0.14)', delay: '0.2s', dur: '24s' },
  { label: 'A₁v₁ = A₂v₂', top: '34%', left: '14%', size: '0.8rem', color: 'rgba(234,88,12,0.12)', delay: '1.6s', dur: '18s' },
  { label: 'Re = ρvL/μ', top: '46%', left: '10%', size: '0.75rem', color: 'rgba(5,150,105,0.11)', delay: '0.9s', dur: '25s' },
  { label: "F_D = ½ρv²C_D·A", top: '58%', left: '14%', size: '0.65rem', color: 'rgba(234,88,12,0.09)', delay: '2.8s', dur: '21s' },
  { label: '∂v/∂t + v·∇v = −∇p/ρ + ν∇²v + f', top: '70%', left: '9%', size: '0.6rem', color: 'rgba(5,150,105,0.09)', delay: '1.3s', dur: '27s' },
];

const toolIcons = [
  { icon: '📐', top: '55%', left: '90%', size: '1rem', delay: '0.5s', dur: '22s' },
  { icon: '🔬', top: '75%', left: '87%', size: '1rem', delay: '2s', dur: '26s' },
  { icon: '📏', top: '85%', left: '6%', size: '0.9rem', delay: '1.5s', dur: '19s' },
  { icon: '💡', top: '45%', left: '1%', size: '1.1rem', delay: '0.8s', dur: '28s' },
  { icon: '💨', top: '58%', left: '93%', size: '0.9rem', delay: '0.6s', dur: '18s' },
  { icon: '🌊', top: '78%', left: '94%', size: '0.9rem', delay: '2.3s', dur: '20s' },
  { icon: '🧪', top: '65%', left: '48%', size: '1rem', delay: '2.1s', dur: '17s' },
  { icon: '⚗️', top: '50%', left: '55%', size: '0.9rem', delay: '1.4s', dur: '23s' },
  { icon: '🔋', top: '8%', left: '33%', size: '1rem', delay: '1.1s', dur: '26s' },
  { icon: '🧲', top: '42%', left: '65%', size: '1rem', delay: '0.5s', dur: '24s' },
  { icon: '🌀', top: '80%', left: '42%', size: '1.1rem', delay: '1.8s', dur: '20s' },
  { icon: '💧', top: '62%', left: '35%', size: '0.9rem', delay: '0.2s', dur: '27s' },
];

export default function HeroFloatingElements() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1] select-none">
      <style>{`
        @keyframes float-drift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(12px, -10px) rotate(2deg); }
          50% { transform: translate(-8px, 8px) rotate(-1deg); }
          75% { transform: translate(10px, 6px) rotate(1.5deg); }
        }
        @keyframes float-sway {
          0%, 100% { transform: translateX(0) translateY(0); }
          33% { transform: translateX(15px) translateY(-8px); }
          66% { transform: translateX(-10px) translateY(6px); }
        }
        @keyframes thermo-pulse {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 0.5; transform: translateY(-6px); }
        }
        .float-el { animation: float-drift var(--dur, 20s) ease-in-out var(--delay, 0s) infinite; }
        .float-icon { animation: float-sway var(--dur, 20s) ease-in-out var(--delay, 0s) infinite; }
        .float-thermo { animation: float-drift var(--dur, 22s) ease-in-out var(--delay, 0s) infinite; }
        .float-fluid { animation: thermo-pulse var(--dur, 15s) ease-in-out var(--delay, 0s) infinite; }
      `}</style>

      {elements.map((el, i) => (
        <div key={i} className="float-el absolute font-mono font-bold whitespace-nowrap"
          style={{
            top: el.top, left: el.left, right: el.right,
            fontSize: el.size, color: el.color,
            '--dur': el.dur, '--delay': el.delay,
          }}
        >{el.label}</div>
      ))}

      {thermoFluid.map((el, i) => (
        <div key={`t${i}`} className="float-thermo absolute font-mono font-bold whitespace-nowrap"
          style={{
            top: el.top, left: el.left, right: el.right,
            fontSize: el.size, color: el.color,
            '--dur': el.dur, '--delay': el.delay,
          }}
        >{el.label}</div>
      ))}

      {toolIcons.map((el, i) => {
        const isFluid = ['🌊','💧','🌀','💨'].includes(el.icon);
        const cls = isFluid ? 'float-fluid' : 'float-icon';
        return (
          <div key={`i${i}`} className={`${cls} absolute`}
            style={{
              top: el.top, left: el.left, right: el.right,
              fontSize: el.size, opacity: 0.35,
              '--dur': el.dur, '--delay': el.delay,
            }}
          >{el.icon}</div>
        );
      })}
    </div>
  );
}
