import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuth } from '../../stores/auth';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.getJob(id),
  });

  const deleteMut = useMutation({
    mutationFn: () => api.deleteJob(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); toast.success('Job deleted'); navigate('/jobs'); },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div className="page-container"><div className="loading-state"><div className="spinner-border" style={{ color: 'var(--green)' }} /></div></div>;
  if (!job) return <div className="page-container"><div className="empty-state"><h3>Job not found</h3><Link to="/jobs" className="btn-nuesa btn-outline">Browse jobs</Link></div></div>;

  const isOwner = user?.sub === job.posted_by;

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link to="/jobs" className="btn-nuesa btn-outline btn-sm mb-3">&larr; All Jobs</Link>

        <div className="page-card p-4 mb-4">
          <h2 className="fw-bold mb-1">{job.title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, margin: '4px 0' }}>
            <i className="fas fa-building me-1" style={{ color: 'var(--green)' }} />{job.company}
            {job.location ? <span className="ms-2"><i className="fas fa-map-marker-alt me-1" style={{ color: 'var(--orange)' }} />{job.location}</span> : ''}
          </p>

          <div className="d-flex flex-wrap gap-3 small mb-4" style={{ color: 'var(--text-muted)' }}>
            <span><i className="far fa-calendar me-1" />Posted {new Date(job.created_at).toLocaleDateString()}</span>
            {job.expires_at && <span><i className="far fa-clock me-1" />Expires {new Date(job.expires_at).toLocaleDateString()}</span>}
            <span><i className="far fa-user me-1" />By {job.profiles?.full_name || 'Alumnus'}</span>
          </div>

          {(job.application_url || job.application_email) && (
            <div className="d-flex gap-2 mb-4">
              {job.application_url && (
                <a href={job.application_url} target="_blank" rel="noopener noreferrer"
                  className="btn-nuesa btn-green">
                  <i className="fas fa-external-link-alt me-2" />Apply Now
                </a>
              )}
              {job.application_email && (
                <a href={`mailto:${job.application_email}`}
                  className="btn-nuesa btn-primary">
                  <i className="fas fa-envelope me-2" />Send Application
                </a>
              )}
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="page-card p-4 mb-4"
        >
          <h5 className="fw-bold mb-2" style={{ color: 'var(--green)' }}>Description</h5>
          <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
        </motion.div>

        {job.requirements && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="page-card p-4 mb-4"
          >
            <h5 className="fw-bold mb-2" style={{ color: 'var(--orange)' }}>Requirements</h5>
            <p style={{ whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
          </motion.div>
        )}

        {isOwner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="d-flex gap-2 mt-4"
          >
            <Link to={`/jobs/${id}/edit`} className="btn-nuesa btn-outline btn-sm">Edit</Link>
            <button onClick={() => { if (confirm('Delete this job?')) deleteMut.mutate(); }}
              className="btn-nuesa btn-sm" style={{ color: '#721c24', borderColor: '#721c24' }}>
              <i className="fas fa-trash me-1" />Delete
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}