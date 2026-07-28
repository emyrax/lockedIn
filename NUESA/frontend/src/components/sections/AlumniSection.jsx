import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GearDecoration from '../common/GearDecoration';

gsap.registerPlugin(ScrollTrigger);

export default function AlumniSection({ content }) {
  const c = content || {};
  const items = c.items || [
    { name: 'Aaron Esumeh', title: 'CEO Greenage Technologies', subtitle: 'Renewable Energy', image: '/images/Aaron Esumeh.jpg' },
    { name: 'Ndubuisi Ekekwe', title: 'Founder FASMICRO', subtitle: 'Semiconductor Innovation', image: '/images/Ndubuisi Ekekwe.webp' },
    { name: 'Otis Anyaeji', title: 'Former NSE President', subtitle: 'Mechanical Engineering', image: '/images/Otis Anyaeji.jpg' },
    { name: 'Charles Emembolu', title: 'Co-founder Roar Nigeria', subtitle: 'Tech Hub', image: '/images/Charles Emembolu.webp' },
  ];

  const gridRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const ctx = gsap.context(() => {
      const cards = gridRef.current.querySelectorAll('.alumni-card');
      gsap.set(cards, { opacity: 0, y: 25, scale: 0.92 });
      ScrollTrigger.create({
        trigger: gridRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.6, stagger: 0.1,
            ease: 'power3.out',
          });
        },
        once: true,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--bg-alt)' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,119,6,0.15), transparent)' }} />
      <GearDecoration size="medium" color="var(--gold)" className="absolute top-4 right-4 opacity-10" />
      <GearDecoration size="small" color="var(--emerald)" className="absolute bottom-6 left-6 opacity-15" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 lg:mb-12"
        >
          <span className="badge-gold mb-4">Alumni</span>
          <h2 className="section-title text-center" style={{ color: 'var(--gold)' }}>
            Distinguished Alumni
          </h2>
          <p className="mt-5 text-sm md:text-base" style={{ color: 'var(--text-muted)', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Our alumni are reshaping industries across the globe.
          </p>
        </motion.div>

        <div ref={gridRef} className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((alum, i) => (
            <div key={i} className="alumni-card card-nuesa text-center p-6 lg:p-8 group" style={{ cursor: 'default' }}>
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 transition-transform duration-300 group-hover:scale-105" style={{ border: '3px solid rgba(217,119,6,0.15)' }}>
                <img
                  src={alum.image}
                  className="w-full h-full object-cover"
                  alt={alum.name}
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'var(--gold)';
                    e.target.parentElement.style.display = 'flex';
                    e.target.parentElement.style.alignItems = 'center';
                    e.target.parentElement.style.justifyContent = 'center';
                    e.target.parentElement.style.color = 'white';
                    e.target.parentElement.style.fontWeight = '700';
                    e.target.parentElement.style.fontSize = '1.2rem';
                    e.target.parentElement.textContent = alum.name.split(' ').map(w => w[0]).join('');
                  }}
                />
              </div>
              <h6 className="font-bold mt-3 mb-1 text-sm" style={{ color: 'var(--text)' }}>{alum.name}</h6>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--emerald)' }}>{alum.title}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{alum.subtitle}</p>
              <div className="mt-3">
                <i className="fab fa-linkedin-in transition-opacity duration-200" style={{ color: '#0a66c2', fontSize: 15, opacity: 0.5 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.5'} />
              </div>
            </div>
          ))}
        </div>

        <div className="md:hidden flex overflow-x-auto gap-4 pb-4" style={{ scrollSnapType: 'x mandatory' }}>
          {items.map((alum, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="card-nuesa text-center flex-shrink-0 p-5"
              style={{ width: 220, scrollSnapAlign: 'start', cursor: 'default' }}
            >
              <div className="w-16 h-16 mx-auto rounded-full overflow-hidden mb-2" style={{ border: '2px solid rgba(217,119,6,0.15)' }}>
                <img src={alum.image} className="w-full h-full object-cover" alt={alum.name}
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'var(--gold)';
                    e.target.parentElement.style.display = 'flex';
                    e.target.parentElement.style.alignItems = 'center';
                    e.target.parentElement.style.justifyContent = 'center';
                    e.target.parentElement.style.color = 'white';
                    e.target.parentElement.style.fontWeight = '700';
                    e.target.parentElement.style.fontSize = '1rem';
                    e.target.parentElement.textContent = alum.name.split(' ').map(w => w[0]).join('');
                  }} />
              </div>
              <h6 className="font-bold text-xs">{alum.name}</h6>
              <p className="text-[10px] font-semibold" style={{ color: 'var(--emerald)' }}>{alum.title}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link to="/alumni" className="btn-nuesa btn-outline text-sm">
            View More Alumni <i className="fas fa-arrow-right ml-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
