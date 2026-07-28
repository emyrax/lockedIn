import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GearDecoration from '../common/GearDecoration';

gsap.registerPlugin(ScrollTrigger);

const execCouncil = [
  { name: 'Comr. Emmanuel Okonkwo', title: 'NUESA President', dept: 'Mechanical Engineering', year: 'Final Year', image: '/images/president.jpg', initials: 'EO' },
  { name: 'Comr. Chioma Adebayo', title: 'Vice President', dept: 'Electrical Engineering', year: 'Final Year', image: '/images/president.jpg', initials: 'CA' },
  { name: 'Comr. Ibrahim Musa', title: 'Secretary General', dept: 'Civil Engineering', year: 'Penultimate Year', image: '/images/president.jpg', initials: 'IM' },
];

const horMembers = [
  { name: 'Hon. Ezechinyere Jesse Chibuike', dept: 'Bio-medical Engineering', image: '/images/president.jpg', initials: 'EJ' },
  { name: 'Chime Chibuzo', dept: 'Mechatronics Engineering', image: '/images/president.jpg', initials: 'CC' },
  { name: 'Igwe Moses Ikechukwu', dept: 'Metallurgical & Materials Eng.', image: '/images/president.jpg', initials: 'IM' },
  { name: 'Ugwuanyi Afam Udochukwu', dept: 'Mechanical Engineering', image: '/images/president.jpg', initials: 'UA' },
  { name: 'Hon. Okorojiaku Michael Chinaemerem', dept: 'Biomedical Engineering', image: '/images/president.jpg', initials: 'OM' },
  { name: 'Hon. Obiora Akachukwu Favour', dept: 'Agricultural & Bio-Resources Eng.', image: '/images/president.jpg', initials: 'OA' },
  { name: 'Hon. Ekwueme Miracle Ifeanyi', dept: 'Mechatronic Engineering', image: '/images/president.jpg', initials: 'EM' },
  { name: 'Chikwado Collins Chukwuebuka', dept: 'Metallurgical & Materials Eng.', image: '/images/president.jpg', initials: 'CC' },
  { name: 'Rt. Hon. Omeili Michael', dept: 'Civil Engineering', image: '/images/president.jpg', initials: 'OM' },
  { name: 'Oliver Wisdom Uwaoma', dept: 'Agricultural & Bio-Resources Eng.', image: '/images/president.jpg', initials: 'OW' },
  { name: 'Rt. Hon. Nwankwo Okwara Osinachi', dept: 'Biomedical Engineering', image: '/images/president.jpg', initials: 'NO' },
  { name: 'Okwudili Samuel Ebubechukwu', dept: 'Electronics & Computer Eng.', image: '/images/president.jpg', initials: 'OS' },
  { name: 'Hon. Nekabari Bakpo', dept: 'Mechatronic Engineering', image: '/images/president.jpg', initials: 'NB' },
  { name: 'Okechukwu Amarachi', dept: 'Civil Engineering', image: '/images/president.jpg', initials: 'OA' },
  { name: 'Rt. Hon. Asogwa Ebubechukwu Joel', dept: 'Electrical Engineering', image: '/images/president.jpg', initials: 'AE' },
  { name: 'Hon. Kalu Emmanuel Uka', dept: 'Electrical Engineering', image: '/images/president.jpg', initials: 'KE' },
  { name: 'Obasi Ihuoma N.', dept: 'Electronic & Computer Engineering', image: '/images/president.jpg', initials: 'OI' },
  { name: 'Ezea Patience Chimaobi', dept: 'Electronic & Computer Engineering', image: '/images/president.jpg', initials: 'EP' },
];

const pastExec = [
  { name: 'Engr. John Okafor', title: 'NUESA President (2022/23)', dept: 'Civil Engineering', initials: 'JO' },
  { name: 'Engr. Amaka Nwosu', title: 'NUESA President (2021/22)', dept: 'Electrical Engineering', initials: 'AN' },
  { name: 'Engr. Bello Yusuf', title: 'NUESA President (2020/21)', dept: 'Mechanical Engineering', initials: 'BY' },
];

function Avatar({ src, initials, size = 80, gold = false }) {
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div
        className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 w-full h-full"
        style={{
          border: `3px solid ${gold ? 'rgba(217,119,6,0.2)' : 'rgba(5,150,105,0.15)'}`,
          background: gold ? 'var(--gold)' : 'var(--emerald)',
        }}
      >
        <img
          src={src} alt=""
          className="w-full h-full object-cover"
          onError={e => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement.style.color = 'white';
            e.currentTarget.parentElement.style.fontWeight = 700;
            e.currentTarget.parentElement.style.fontSize = size * 0.35;
            e.currentTarget.parentElement.textContent = initials;
          }}
        />
      </div>
    </div>
  );
}

export default function LeadershipSection() {
  const execRef = useRef(null);
  const pastRef = useRef(null);

  useEffect(() => {
    if (!execRef.current) return;
    const ctx = gsap.context(() => {
      const rows = execRef.current.querySelectorAll('.hor-card');
      gsap.set(rows, { opacity: 0, y: 20, scale: 0.95 });
      ScrollTrigger.create({
        trigger: execRef.current,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(rows, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.5, stagger: 0.03,
            ease: 'power3.out',
          });
        },
        once: true,
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!pastRef.current) return;
    const ctx = gsap.context(() => {
      const cards = pastRef.current.querySelectorAll('.past-card');
      gsap.set(cards, { opacity: 0, y: 15, scale: 0.95 });
      ScrollTrigger.create({
        trigger: pastRef.current,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.5, stagger: 0.08,
            ease: 'power3.out',
          });
        },
        once: true,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--bg-warm)' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(5,150,105,0.15), transparent)' }} />
      <GearDecoration size="small" color="var(--emerald)" className="absolute top-4 left-4 opacity-15" />
      <GearDecoration size="medium" color="var(--gold)" className="absolute bottom-4 right-4 opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-10 lg:mb-12">
            <span className="badge-nuesa mb-4">Leadership</span>
            <h2 className="section-title text-center" style={{ color: 'var(--emerald)' }}>
              Current NUESA Representatives
            </h2>
            <p className="mt-5 text-sm md:text-base" style={{ color: 'var(--text-muted)', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
              Meet the dedicated leaders driving the Nigerian Universities Engineering Students&apos; Association
            </p>
          </div>

          <div className="mb-10">
            <h6 className="text-xs font-semibold tracking-wider uppercase mb-5 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
              <i className="fas fa-crown" />Executive Council
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {execCouncil.map((person, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card-nuesa text-center p-6 lg:p-8 group"
                >
                  <Avatar src={person.image} initials={person.initials} size={90} gold />
                  <h6 className="font-bold mt-4 mb-1 text-sm">{person.name}</h6>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--gold)' }}>{person.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{person.dept} &bull; {person.year}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div ref={execRef}>
            <h6 className="text-xs font-semibold tracking-wider uppercase mb-5 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
              <i className="fas fa-users" />House of Representatives
            </h6>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {horMembers.map((person, i) => (
                <div
                  key={i}
                  className="hor-card card-nuesa text-center p-3 lg:p-4 group"
                  style={{ cursor: 'default' }}
                >
                  <Avatar src={person.image} initials={person.initials} size={52} />
                  <p className="text-[11px] font-semibold mt-2 mb-0.5 leading-tight">{person.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{person.dept}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="border-t" style={{ borderColor: 'var(--border-light)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3" style={{ background: 'rgba(217,119,6,0.08)', color: 'var(--gold)' }}>
                <i className="fas fa-clock-rotate-left" /> Past Leadership
              </span>
              <h2 className="section-title text-center" style={{ color: 'var(--gold)' }}>
                Past NUESA Representatives
              </h2>
              <p className="mt-3 text-sm md:text-base" style={{ color: 'var(--text-muted)', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
                Former leaders who served the Faculty of Engineering with distinction.
              </p>
            </div>

            <div ref={pastRef} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {pastExec.map((person, i) => (
                <div key={i} className="past-card card-nuesa-dark text-center p-5 lg:p-6 group" style={{ cursor: 'default' }}>
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-lg font-bold text-white mb-3 opacity-70" style={{ background: 'var(--gold)' }}>
                    {person.initials}
                  </div>
                  <h6 className="font-bold text-sm mb-1 text-white/80">{person.name}</h6>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>{person.title}</p>
                  <p className="text-xs text-white/40">{person.dept}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link to="/pastrepresentative" className="btn-nuesa btn-outline text-sm">
                View All Past Representatives <i className="fas fa-arrow-right ms-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
