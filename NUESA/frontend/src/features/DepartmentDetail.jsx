import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import PageShell from '../components/layout/PageShell';

const departmentInfo = {
  ABE: { description: 'Designing sustainable agricultural systems, irrigation technology, and post-harvest processing machinery to drive food security and agricultural transformation in Nigeria and beyond.', careers: ['Agricultural Engineer', 'Irrigation Specialist', 'Food Process Engineer', 'Bioenergy Consultant'] },
  CVE: { description: 'Shaping the built environment through innovative structural design, transportation systems, water resources management, and sustainable infrastructure development.', careers: ['Structural Engineer', 'Transportation Planner', 'Water Resources Engineer', 'Construction Manager'] },
  EEE: { description: 'Powering the future through expertise in power generation, transmission systems, electrical machines, renewable energy, and smart grid technologies.', careers: ['Power Systems Engineer', 'Electrical Design Engineer', 'Renewable Energy Consultant', 'Utility Manager'] },
  ELE: { description: 'Driving the digital revolution with expertise in embedded systems, telecommunications, VLSI design, signal processing, and Internet-of-Things technologies.', careers: ['Electronics Engineer', 'Embedded Systems Developer', 'Telecom Engineer', 'IoT Specialist'] },
  MCE: { description: 'Mastering the principles of thermodynamics, fluid mechanics, manufacturing processes, and automotive design to create mechanical systems that improve lives.', careers: ['Mechanical Engineer', 'Automotive Engineer', 'HVAC Engineer', 'Manufacturing Engineer'] },
  MME: { description: 'Advancing materials science through metal extraction, alloy development, corrosion science, and composite materials for aerospace, automotive, and construction.', careers: ['Metallurgical Engineer', 'Materials Scientist', 'Quality Control Engineer', 'Process Metallurgist'] },
  MTE: { description: 'Integrating mechanical, electronic, and computer engineering to create intelligent systems, robotics, automation solutions, and smart manufacturing.', careers: ['Mechatronics Engineer', 'Robotics Engineer', 'Automation Specialist', 'Control Systems Engineer'] },
  BME: { description: 'Innovating at the intersection of engineering and medicine — developing medical devices, prosthetics, imaging systems, and rehabilitation technologies.', careers: ['Biomedical Engineer', 'Medical Device Designer', 'Clinical Engineer', 'Rehabilitation Engineer'] },
  PEE: { description: 'Exploring polymer science, textile engineering, and advanced materials for applications in healthcare, aerospace, automotive, and consumer goods.', careers: ['Polymer Engineer', 'Textile Technologist', 'Materials Engineer', 'Quality Assurance Manager'] },
  FWT: { description: 'Harnessing renewable forest resources through sustainable wood technology, bio-based materials, and environmentally responsible engineering practices.', careers: ['Forest Engineer', 'Wood Technologist', 'Bio-based Materials Engineer', 'Environmental Consultant'] },
};

export default function DepartmentDetail() {
  const { code } = useParams();
  const upperCode = code?.toUpperCase();

  const { data: depts } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments'),
    staleTime: Infinity,
  });

  const dept = depts?.find(d => d.code === upperCode);
  const info = departmentInfo[upperCode];
  const name = dept?.name || upperCode;

  if (!info) {
    return (
      <PageShell title="Department Not Found">
        <div className="empty-state">
          <i className="fas fa-flask" />
          <p className="mt-3">Department &quot;{code}&quot; not found.</p>
          <Link to="/departments" className="btn-nuesa btn-outline text-sm mt-3">All Departments</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={name} subtitle={`Department of ${name}`} toolIndex={2}>
      <Link to="/departments" className="inline-flex items-center gap-1.5 text-sm font-medium mb-4 transition-colors" style={{ color: 'var(--emerald)' }}>
        <i className="fas fa-arrow-left text-xs" /> All Departments
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="page-card overflow-hidden">
            <div className="h-56 lg:h-64 overflow-hidden">
              <img src={`/images/${upperCode.toLowerCase()}.jpeg`} alt={name}
                className="w-full h-full object-cover"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.parentElement.style.background = 'linear-gradient(135deg, var(--emerald-light), var(--gold-light))';
                }} />
            </div>
            <div className="p-5 lg:p-6">
              <span className="badge-nuesa mb-3 inline-block">{upperCode}</span>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{info.description}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="page-card p-5">
            <h5 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
              <i className="fas fa-briefcase" />Career Paths
            </h5>
            <ul className="space-y-2">
              {info.careers.map((career, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--text)' }}
                >
                  <i className="fas fa-check-circle text-xs" style={{ color: 'var(--emerald)' }} />
                  {career}
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="page-card p-5">
            <h5 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
              <i className="fas fa-graduation-cap" />Quick Info
            </h5>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="flex justify-between"><span>Code</span><span className="font-semibold" style={{ color: 'var(--emerald)' }}>{upperCode}</span></div>
              <div className="flex justify-between"><span>Students</span><span className="font-semibold">500+</span></div>
              <div className="flex justify-between"><span>Faculty</span><span className="font-semibold">30+</span></div>
              <div className="flex justify-between"><span>Established</span><span className="font-semibold">1964</span></div>
            </div>
          </div>

          <Link to="/contact" className="btn-nuesa btn-primary w-full justify-center text-sm">
            <i className="fas fa-envelope" /> Contact Department
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
