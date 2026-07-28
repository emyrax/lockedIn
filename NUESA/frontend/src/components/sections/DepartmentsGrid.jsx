import { useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '../../lib/api';
import GearDecoration from '../common/GearDecoration';

gsap.registerPlugin(ScrollTrigger);

const deptDescriptions = {
  ABE: 'Sustainable machinery, irrigation, and post-harvest technologies for food security.',
  CVE: 'Structural design, transportation, water resources, and environmental engineering.',
  EEE: 'Power generation, transmission, machines, and renewable energy systems.',
  ELE: 'Embedded systems, telecommunications, VLSI design, and signal processing.',
  MCE: 'Thermodynamics, fluid mechanics, manufacturing, and automotive design.',
  MME: 'Metal extraction, alloy development, corrosion science, and composites.',
  MTE: 'Mineral exploration, rock mechanics, and sustainable extraction.',
  BME: 'Medical devices, prosthetics, imaging systems, and rehabilitation.',
  PEE: 'Polymer science, textile engineering, and advanced materials.',
  FWT: 'Forestry, wood technology, and bio-based materials.',
};

export default function DepartmentsGrid({ content }) {
  const { data: depts } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments'),
    staleTime: Infinity,
  });

  const departments = depts || [
    { code: 'ABE', name: 'Agricultural & Bioresources Eng.' },
    { code: 'CVE', name: 'Civil Engineering' },
    { code: 'EEE', name: 'Electrical Engineering' },
    { code: 'ELE', name: 'Electronic Engineering' },
    { code: 'MCE', name: 'Mechanical Engineering' },
    { code: 'MME', name: 'Metallurgical & Materials Eng.' },
    { code: 'MTE', name: 'Mechatronics Engineering' },
    { code: 'BME', name: 'Biomedical Engineering' },
    { code: 'PEE', name: 'Polymer & Textile Engineering' },
    { code: 'FWT', name: 'Forestry & Wood Technology' },
  ];

  const gridRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const ctx = gsap.context(() => {
      const cards = gridRef.current.querySelectorAll('.dept-card');
      gsap.set(cards, { opacity: 0, x: (i) => (i % 2 === 0 ? -80 : 80), scale: 0.9 });
      ScrollTrigger.create({
        trigger: gridRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1, x: 0, scale: 1,
            duration: 0.7, stagger: 0.06, ease: 'power4.out',
          });
        },
        once: true,
      });

      cards.forEach((card, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        ScrollTrigger.create({
          trigger: card,
          start: 'top 85%',
          onEnter: () => {
            gsap.to(card, {
              scale: 1.1, y: -6, x: dir * 10,
              boxShadow: '0 14px 36px rgba(217,119,6,0.15), 0 0 0 2px var(--gold)',
              duration: 0.35,
              ease: 'back.out(2)',
              onComplete: () => {
                gsap.to(card, {
                  scale: 1, y: 0, x: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  duration: 0.35,
                  ease: 'power2.inOut',
                });
              },
            });
          },
          once: true,
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="departments" className="relative" style={{ background: 'var(--bg)' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,119,6,0.2), rgba(5,150,105,0.2), transparent)' }} />
      <GearDecoration size="small" color="var(--gold)" className="absolute top-6 right-8 opacity-30" />
      <GearDecoration size="medium" color="var(--emerald)" className="absolute bottom-8 left-6 opacity-25" />
      <GearDecoration size="small" color="var(--gold)" className="absolute bottom-12 right-12 opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-14"
        >
          <span className="badge-nuesa mb-4">Departments</span>
          <h2 className="section-title text-center" style={{ color: 'var(--emerald)' }}>
            Academic Departments
          </h2>
          <p className="mt-5 text-sm md:text-base" style={{ color: 'var(--text-muted)', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            Ten departments powering Africa&apos;s engineering excellence.
          </p>
        </motion.div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {departments.map((dept, i) => {
            const desc = deptDescriptions[dept.code] || 'Advancing engineering innovation at UNN.';
            return (
              <div key={dept.code} className="dept-card" style={{ transition: 'box-shadow 0.3s' }}>
                <Link to={`/departments/${dept.code}`} className="block group">
                  <div className="card-nuesa overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={`/images/${dept.code.toLowerCase()}.jpeg`}
                        alt={dept.name}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 50%, rgba(5,150,105,0.08))' }} />
                    </div>
                    <div className="p-5">
                      <span className="badge-nuesa mb-2.5">{dept.code}</span>
                      <h6 className="font-bold mb-1.5 text-sm" style={{ color: 'var(--text)' }}>{dept.name}</h6>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
