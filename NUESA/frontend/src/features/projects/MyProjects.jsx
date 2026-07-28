import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import ProjectCard from './ProjectCard';
import { motion } from 'framer-motion';

export default function MyProjects() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => api.get('/projects/my'),
  });

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4"
      >
        <div>
          <h2 className="fw-bold mb-1" style={{ color: 'var(--green)' }}>My Projects</h2>
          <p className="text-muted">Track your submitted projects</p>
        </div>
        <Link to="/projects/submit" className="btn-nuesa btn-primary">
          <i className="fas fa-plus me-1" />New Project
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--orange)' }} /></div>
      ) : !projects || projects.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-lightbulb" />
          <p>You haven't submitted any projects yet.</p>
          <Link to="/projects/submit" className="btn-nuesa btn-outline">Submit Your First Project</Link>
        </div>
      ) : (
        <motion.div
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="row g-4"
        >
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              className="col-md-6 col-lg-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <ProjectCard project={p} />
              <div className="mt-2 d-flex gap-2">
                <span className={`badge ${p.status === 'submitted' ? 'bg-warning text-dark' : p.status === 'approved' ? 'bg-success' : p.status === 'featured' ? 'bg-danger' : 'bg-secondary'}`}>
                  {p.status}
                </span>
                {p.status === 'submitted' && (
                  <Link to={`/projects/${p.id}/edit`} className="btn-nuesa btn-outline btn-sm">
                    <i className="fas fa-edit me-1" />Edit
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}