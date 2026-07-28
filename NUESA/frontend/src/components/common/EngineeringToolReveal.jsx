import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const tools = [
  { icon: '🔧', label: 'Wrench' },
  { icon: '⚙️', label: 'Gear' },
  { icon: '🔬', label: 'Microscope' },
  { icon: '⚡', label: 'Circuit' },
  { icon: '🧪', label: 'Beaker' },
  { icon: '🚀', label: 'Rocket' },
  { icon: '📐', label: 'Compass' },
  { icon: '📏', label: 'Ruler' },
  { icon: '🔥', label: 'Flame' },
  { icon: '💡', label: 'Innovation' },
  { icon: '🛠️', label: 'Tools' },
  { icon: '🔋', label: 'Battery' },
];

export default function EngineeringToolReveal({ index, className = '', style = {} }) {
  const ref = useRef(null);
  const tool = tools[(index ?? 0) % tools.length];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, scale: 0.3, rotate: -30 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(el, {
            opacity: 0.12, scale: 1, rotate: 0, duration: 1.2, ease: 'elastic.out(1, 0.4)',
          });
        },
        once: true,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className={`engineering-tool-reveal ${className}`}
      style={{
        position: 'absolute', fontSize: 48, pointerEvents: 'none', userSelect: 'none',
        zIndex: 1, opacity: 0, ...style,
      }}
      aria-hidden
    >
      {tool.icon}
    </div>
  );
}
