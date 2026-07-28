import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const featuredProjects = [
  { title: 'Solar-Powered Irrigation System', team: 'Agric Eng. Team', dept: 'ABE', raised: 3200000, goal: 5000000, investors: 12 },
  { title: 'Low-Cost Prosthetic Limb', team: 'BME Innovators', dept: 'BME', raised: 1800000, goal: 3000000, investors: 8 },
  { title: 'AI Traffic Optimization', team: 'ECE Lab', dept: 'ELE', raised: 4500000, goal: 8000000, investors: 15 },
];

export default function ProjectsSection() {
  const fmt = (n) => '₦' + n.toLocaleString('en-US');

  return (
    <section style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-10 lg:mb-12 gap-4">
            <div>
              <span className="badge-nuesa mb-3 inline-block">Featured Capstones</span>
              <h2 className="section-title section-title-left" style={{ color: 'var(--emerald)' }}>
                Adopt-a-Capstone
              </h2>
              <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)', maxWidth: 440 }}>
                Fund a student project and sponsor the next generation of Nigerian innovation.
              </p>
            </div>
            <Link to="/projects" className="btn-nuesa btn-outline text-sm hidden lg:inline-flex">
              View All <i className="fas fa-arrow-right ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {featuredProjects.map((proj, i) => {
              const pct = Math.round((proj.raised / proj.goal) * 100);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="card-nuesa p-5 lg:p-6 h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge-nuesa">{proj.dept}</span>
                    <span className="text-xs" style={{ color: 'var(--text-light)' }}>{proj.investors} investors</span>
                  </div>
                  <h6 className="font-bold mb-1 text-sm">{proj.title}</h6>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>by {proj.team}</p>

                  <div className="mt-auto">
                    <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: '#f3f4f6' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: pct >= 100 ? 'var(--emerald)' : 'var(--gold)' }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs mb-4">
                      <span className="font-bold" style={{ color: 'var(--gold)' }}>{fmt(proj.raised)}</span>
                      <span style={{ color: 'var(--text-light)' }}>of {fmt(proj.goal)}</span>
                    </div>
                    <Link to="/projects" className="btn-nuesa btn-primary w-full justify-center text-xs !py-2.5">
                      Fund This Project
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-6 lg:hidden">
            <Link to="/projects" className="btn-nuesa btn-outline text-sm">
              View All Projects <i className="fas fa-arrow-right ml-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
