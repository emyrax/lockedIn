import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import InfiniteMarquee from '../common/InfiniteMarquee';
import SectionFloatingBg from '../common/SectionFloatingBg';
import GearDecoration from '../common/GearDecoration';

gsap.registerPlugin(ScrollTrigger);

const partnersByDept = {
  ABE: ['/images/Olam Nigeria.webp', '/images/Presco Plc.jpg', '/images/Notore Chemical.webp', '/images/FMARD.webp', 'Olam', 'Presco', 'Notore', 'FMARD'],
  CVE: ['/images/Julius Berger.webp', '/images/CCECC Nigeria.png', '/images/PW Construction.webp', '/images/Dangote Group.webp', '/images/Lafarge Africa.webp', 'Julius Berger', 'CCECC', 'PW', 'Dangote', 'Lafarge'],
  EEE: ['/images/mtn.jpeg', '/images/Ikeja Electric.webp', '/images/Shell Nigeria.webp', '/images/Huawei Nigeria.png', 'MTN', 'Ikeja Electric', 'Shell', 'Huawei'],
  ELE: ['/images/Flutterwave.webp', '/images/Moniepoint.webp', '/images/Paystack.webp', '/images/Interswitch.webp', '/images/Andela.webp', 'Flutterwave', 'Moniepoint', 'Paystack', 'Interswitch', 'Andela'],
  MCE: ['/images/Toyota Nigeria.webp', '/images/Innoson.webp', '/images/PZ Cussons.webp', 'Toyota', 'Innoson', 'PZ Cussons'],
  MME: ['/images/NNPC.webp', '/images/Dangote Group.webp', '/images/Ajaokuta Steel.webp', '/images/NLNG.webp', '/images/Lafarge Africa.webp', 'NNPC', 'Dangote', 'Ajaokuta Steel', 'NLNG', 'Lafarge'],
  MTE: ['/images/Siemens.webp', '/images/Bosch.webp', '/images/Schneider Electric.png', '/images/SLB (Schlumberger).webp', 'Siemens', 'Bosch', 'Schneider', 'SLB'],
  BME: ['/images/GE Healthcare.jpg', '/images/Philips Healthcare.png', '/images/Siemens Healthineers.png', 'GE Healthcare', 'Philips', 'Siemens'],
  PEE: ['/images/Dunlop Nigeria.webp', '/images/Indorama.webp', 'Dunlop', 'Indorama'],
  FWT: ['/images/Roscommon Timber.webp', '/images/FAO Nigeria.webp', 'Roscommon', 'FAO'],
};

const deptNames = {
  ABE: 'Agricultural & Bioresources Eng.', CVE: 'Civil Engineering', EEE: 'Electrical Engineering',
  ELE: 'Electronics Engineering', MCE: 'Mechanical Engineering', MME: 'Metallurgical & Materials Eng.',
  MTE: 'Mechatronics Engineering', BME: 'Biomedical Engineering', PEE: 'Polymer & Textile Engineering',
  FWT: 'Forestry & Wood Technology',
};

const deptIcons = {
  ABE: 'fa-seedling', CVE: 'fa-road', EEE: 'fa-bolt', ELE: 'fa-microchip',
  MCE: 'fa-cogs', MME: 'fa-industry', MTE: 'fa-robot', BME: 'fa-heartbeat',
  PEE: 'fa-flask', FWT: 'fa-tree',
};

export default function CompaniesSection() {
  const gridRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const ctx = gsap.context(() => {
      const rows = gridRef.current.querySelectorAll('.partner-row');
      gsap.set(rows, { opacity: 0, y: 30, scale: 0.97 });
      ScrollTrigger.create({
        trigger: gridRef.current,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(rows, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.7, stagger: 0.1,
            ease: 'power3.out',
          });
        },
        once: true,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative overflow-hidden bg-grid-engineering" style={{ backgroundColor: 'var(--bg)' }}>
      <SectionFloatingBg />
      <div className="relative z-[2]">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,119,6,0.15), rgba(5,150,105,0.15), transparent)' }} />
        <GearDecoration size="large" color="var(--emerald)" className="absolute -top-6 -right-6 opacity-15" />
        <GearDecoration size="medium" color="var(--gold)" className="absolute -bottom-8 -left-6 opacity-15" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 lg:mb-12"
        >
          <span className="badge-nuesa mb-4">Partners</span>
          <h2 className="section-title text-center" style={{ color: 'var(--emerald)' }}>
            Where UNN Engineers Work
          </h2>
          <p className="mt-5 text-sm md:text-base" style={{ color: 'var(--text-muted)', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Top companies hiring our graduates across all engineering disciplines.
          </p>
        </motion.div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {Object.entries(partnersByDept).map(([code, items], idx) => (
            <div key={code} className="partner-row">
              <div className="page-card overflow-hidden" style={{ borderLeft: '3px solid', borderColor: idx % 2 === 0 ? 'var(--emerald)' : 'var(--gold)' }}>
                <div className="flex items-center gap-2 px-4 pt-3.5 pb-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs" style={{ background: idx % 2 === 0 ? 'rgba(5,150,105,0.08)' : 'rgba(217,119,6,0.08)' }}>
                    <i className={`fas ${deptIcons[code] || 'fa-building'}`} style={{ color: idx % 2 === 0 ? 'var(--emerald)' : 'var(--gold)' }} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{deptNames[code] || code}</span>
                    <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)' }}>({items.filter(i => !i.startsWith('http') && !i.startsWith('/images')).length} companies)</span>
                  </div>
                </div>
                <div className="px-2 py-3">
                  <InfiniteMarquee items={items} speed={28 + idx * 3} height={52} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link to="/departments" className="btn-nuesa btn-outline text-sm">
            Explore by Department <i className="fas fa-arrow-right ml-1" />
          </Link>
        </motion.div>
      </div>
      </div>
    </section>
  );
}
