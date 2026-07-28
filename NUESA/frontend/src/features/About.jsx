import { motion } from 'framer-motion';
import PageShell from '../components/layout/PageShell';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6 },
};

export default function About() {
  return (
    <PageShell title={`About ${'NUESA UNN'}`} toolIndex={6}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <motion.div {...fadeUp} className="page-card p-5 lg:p-6">
            <p className="text-base font-semibold leading-relaxed" style={{ color: 'var(--emerald)' }}>
              The Nigerian Universities Engineering Students' Association (NUESA), University of Nigeria, Nsukka Chapter, represents the vibrant engineering community at UNN.
            </p>
            <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--text-muted)' }}>
              With over 60 years of excellence, the Faculty of Engineering at UNN has produced thousands of engineers who are leading innovation across Nigeria and the world. Our alumni include distinguished professionals in academia, industry, and government.
            </p>
            <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--text-muted)' }}>
              NUESA UNN serves as the bridge between students, faculty, alumni, and industry partners, fostering academic excellence, professional development, and community impact. Through our programs — mentorship, career fairs, innovation challenges, and community outreach — we prepare the next generation of engineering leaders.
            </p>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="page-card p-5 lg:p-6">
            <h4 className="font-bold text-base mb-3" style={{ color: 'var(--emerald)' }}>Our Mission</h4>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              To unite engineering students across all departments, promote academic excellence, facilitate professional development, and create a platform for innovation and collaboration.
            </p>
            <h4 className="font-bold text-base mt-5 mb-3" style={{ color: 'var(--emerald)' }}>Our Vision</h4>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              To be the leading engineering student association in Nigeria, producing world-class engineers who drive technological advancement and national development.
            </p>
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="page-card-dark p-5"
          >
            <h5 className="font-bold text-sm mb-3 flex items-center gap-2 text-white">
              <i className="fas fa-info-circle" style={{ color: 'var(--gold)' }} />Quick Facts
            </h5>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-dark-muted)' }}>
              {['10 Engineering Departments', '3,500+ Active Students', '15+ Industry Partners', '60+ Years of Excellence'].map((fact, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
                  {fact}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="page-card p-5"
          >
            <h5 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
              <i className="fas fa-address-card" />Contact
            </h5>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-2"><i className="fas fa-envelope" style={{ width: 16, color: 'var(--emerald)' }} />info@nuesaunn.ng</div>
              <div className="flex items-center gap-2"><i className="fas fa-map-marker-alt" style={{ width: 16, color: 'var(--emerald)' }} />Faculty of Engineering, UNN</div>
              <div className="flex items-center gap-2"><i className="fas fa-globe" style={{ width: 16, color: 'var(--emerald)' }} />nuesaunn.ng</div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
}
