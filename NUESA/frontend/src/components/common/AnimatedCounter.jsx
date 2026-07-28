import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function AnimatedCounter({ value, label, icon, color, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const num = parseInt(value);
  const suffix = value.replace(/[\d]/g, '');
  const prefix = value.replace(suffix, '').replace(num.toString(), '');

  return (
    <div ref={ref}>
      {icon && (
        <div className="mb-2">
          <i className={`fas ${icon}`} style={{ fontSize: 22, color: 'var(--emerald)', opacity: 0.5 }} />
        </div>
      )}
      <div className="font-bold mb-0" style={{ color: 'var(--gold)', fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
        {prefix}
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 + delay }}
        >
          {num}
        </motion.span>
        {suffix}
      </div>
      <p className="text-xs font-medium mt-1.5 mb-0" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}
