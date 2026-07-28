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

const toolIcons = [
  { icon: '🔧', top: '15%', left: '88%', size: '1rem', delay: '0s', dur: '20s' },
  { icon: '⚙️', top: '35%', left: '92%', size: '1.3rem', delay: '1s', dur: '24s' },
  { icon: '📐', top: '55%', left: '90%', size: '1rem', delay: '0.5s', dur: '22s' },
  { icon: '🔬', top: '75%', left: '87%', size: '1rem', delay: '2s', dur: '26s' },
  { icon: '📏', top: '85%', left: '6%', size: '0.9rem', delay: '1.5s', dur: '19s' },
  { icon: '💡', top: '45%', left: '1%', size: '1.1rem', delay: '0.8s', dur: '28s' },
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
        .float-el { animation: float-drift var(--dur, 20s) ease-in-out var(--delay, 0s) infinite; }
        .float-icon { animation: float-sway var(--dur, 20s) ease-in-out var(--delay, 0s) infinite; }
      `}</style>

      {elements.map((el, i) => (
        <div
          key={i}
          className="float-el absolute font-mono font-bold whitespace-nowrap"
          style={{
            top: el.top, left: el.left, right: el.right,
            fontSize: el.size, color: el.color,
            '--dur': el.dur, '--delay': el.delay,
          }}
        >
          {el.label}
        </div>
      ))}

      {toolIcons.map((el, i) => (
        <div
          key={`t${i}`}
          className="float-icon absolute"
          style={{
            top: el.top, left: el.left, right: el.right,
            fontSize: el.size, opacity: 0.35,
            '--dur': el.dur, '--delay': el.delay,
          }}
        >
          {el.icon}
        </div>
      ))}
    </div>
  );
}
