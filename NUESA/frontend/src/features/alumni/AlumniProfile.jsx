import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';

export default function AlumniProfile() {
  const { id } = useParams();

  const { data: alumni, isLoading } = useQuery({
    queryKey: ['alumni-profile', id],
    queryFn: () => api.getAlumniProfile(id),
  });

  const { data: jobs } = useQuery({
    queryKey: ['alumni-jobs', id],
    queryFn: () => api.getAlumniJobs(id),
    enabled: !!id,
  });

  if (isLoading) return <div className="page-container"><div className="loading-state"><div className="spinner-border" style={{ color: 'var(--green)' }} /></div></div>;
  if (!alumni) return <div className="page-container"><div className="empty-state"><h3>Profile not found</h3><Link to="/alumni" className="btn-nuesa btn-outline">Browse alumni</Link></div></div>;

  const p = alumni.profiles || {};

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link to="/alumni" className="btn-nuesa btn-outline btn-sm mb-3">&larr; Alumni Directory</Link>

        <div className="page-card p-4 d-flex gap-4 align-items-start flex-wrap mb-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{
              width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
              border: '3px solid var(--green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-alt)',
            }}
          >
            {p.avatar_url ? (
              <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (p.full_name?.[0] || '?')}
          </motion.div>
          <div style={{ flex: 1 }}>
            <h2 className="fw-bold mb-1">{p.full_name || 'Unknown'}</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {alumni.current_position}{alumni.current_position && alumni.current_company ? ' at ' : ''}{alumni.current_company}
            </p>
            <div className="d-flex flex-wrap gap-3 small mt-2" style={{ color: 'var(--text-muted)' }}>
              <span><i className="fas fa-graduation-cap me-1" style={{ color: 'var(--orange)' }} />Class of {alumni.graduation_year}</span>
              <span><i className="fas fa-briefcase me-1" style={{ color: 'var(--green)' }} />{alumni.industry}</span>
              <span><i className="fas fa-flask me-1" style={{ color: 'var(--orange)' }} />{p.department}</span>
            </div>
            <div className="d-flex gap-2 mt-3">
              {alumni.linkedin_url && (
                <a href={alumni.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn-nuesa btn-outline btn-sm">
                  <i className="fab fa-linkedin me-1" />LinkedIn
                </a>
              )}
              {alumni.website_url && (
                <a href={alumni.website_url} target="_blank" rel="noopener noreferrer" className="btn-nuesa btn-outline btn-sm">
                  <i className="fas fa-globe me-1" />Website
                </a>
              )}
            </div>
          </div>
        </div>

        {alumni.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="page-card p-4 mb-4"
          >
            <h5 className="fw-bold mb-2" style={{ color: 'var(--green)' }}>About</h5>
            <p style={{ whiteSpace: 'pre-wrap' }}>{alumni.bio}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="page-card p-4 mb-4"
        >
          <div className="row g-3">
            {alumni.degree && (
              <div className="col-sm-6">
                <small className="fw-bold d-block" style={{ color: 'var(--text-muted)' }}>Degree</small>
                <span>{alumni.degree}</span>
              </div>
            )}
            {alumni.location_city && (
              <div className="col-sm-6">
                <small className="fw-bold d-block" style={{ color: 'var(--text-muted)' }}>Location</small>
                <span>{alumni.location_city}{alumni.location_country ? `, ${alumni.location_country}` : ''}</span>
              </div>
            )}
          </div>
        </motion.div>

        {jobs?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h5 className="fw-bold mb-3" style={{ color: 'var(--orange)' }}><i className="fas fa-briefcase me-2" />Job Postings</h5>
            <div className="d-flex flex-column gap-2">
              {jobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <Link to={`/jobs/${job.id}`} className="card-nuesa d-block p-3 text-decoration-none">
                    <div className="fw-bold" style={{ color: 'var(--text)' }}>{job.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{job.company} • {job.location || 'Remote'}</div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}