import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useImpactCalculator } from './useImpactCalculator';

export default function ImpactSimulator({ onSponsor }) {
  const [amount, setAmount] = useState(5000000);
  const { computeOutcomes } = useImpactCalculator();
  const outcomes = useMemo(() => computeOutcomes(amount), [amount]);
  const fmt = (n) => '₦' + n.toLocaleString('en-US');

  return (
    <section style={{ background: 'var(--bg-alt)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-10 lg:mb-12">
            <span className="badge-gold mb-4">Impact Calculator</span>
            <h2 className="section-title text-center" style={{ color: 'var(--emerald)' }}>
              Your Investment, <span style={{ color: 'var(--gold)' }}>Their Future</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div className="page-card p-6 lg:p-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Investment Amount</span>
                <span className="font-bold" style={{ color: 'var(--gold)', fontSize: 'clamp(1.2rem, 2vw, 1.6rem)' }}>{fmt(amount)}</span>
              </div>
              <input
                type="range"
                className="w-full"
                min={1000000}
                max={100000000}
                step={500000}
                value={amount}
                onChange={e => setAmount(parseInt(e.target.value))}
                style={{ accentColor: 'var(--gold)', height: 6 }}
              />
              <div className="flex justify-between text-xs mt-1.5" style={{ color: 'var(--text-light)' }}>
                <span>₦1M</span><span className="hidden sm:inline">₦10M</span><span className="hidden sm:inline">₦50M</span><span>₦100M+</span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tier</span>
                  <span className="text-sm font-bold" style={{ color: outcomes.tierColor }}>{outcomes.tier}</span>
                </div>
                {[
                  { label: 'Equipment & Labs', value: outcomes.equipment, pct: 50, color: 'var(--gold)' },
                  { label: 'Student Stipends', value: outcomes.stipends, pct: 30, color: 'var(--emerald)' },
                  { label: 'Materials & Prototyping', value: outcomes.materials, pct: 20, color: 'var(--emerald-dark)' },
                ].map((bar, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-muted)' }}>{bar.label}</span>
                      <span style={{ color: 'var(--text)' }}>{fmt(bar.value)}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${bar.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.15 }}
                        className="h-full rounded-full"
                        style={{ background: bar.color }}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Students Impacted</span>
                  <span className="font-bold text-lg" style={{ color: 'var(--emerald)' }}>~{outcomes.students}</span>
                </div>
              </div>
            </div>

            <div className="page-card p-6 lg:p-8">
              <h6 className="font-bold text-sm mb-4 flex items-center gap-2">
                <i className="fas fa-gift" style={{ color: 'var(--gold)' }} />
                Unlocked Perks
              </h6>
              <AnimatePresence mode="wait">
                <motion.ul
                  key={amount}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.25 }}
                  className="list-unstyled mb-0 space-y-3"
                >
                  {outcomes.perks.map((perk, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-2.5"
                    >
                      <i className="fas fa-check-circle mt-0.5" style={{ color: 'var(--emerald)', fontSize: 14 }} />
                      <span className="text-sm leading-relaxed">{perk}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatePresence>
              <div className="mt-6 lg:mt-8">
                <button
                  className="btn-nuesa btn-primary w-full justify-center text-sm !py-3"
                  onClick={() => onSponsor?.(amount)}
                >
                  Invest {fmt(amount)} Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
