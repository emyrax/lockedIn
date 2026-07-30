import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const statusColors = {
  pending: { bg: '#fff3cd', text: '#856404' },
  approved: { bg: '#d4edda', text: '#155724' },
  rejected: { bg: '#f8d7da', text: '#721c24' },
  expired: { bg: '#e0e0e0', text: '#666' },
};

export default function MyJobs() {
  const qc = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => api.myJobs(),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.deleteJob(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-jobs'] }); toast.success('Job deleted'); },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div className="page-container"><div className="loading-state"><div className="spinner-border" style={{ color: 'var(--green)' }} /></div></div>;

  const list = jobs || [];

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4"
      >
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="fw-bold mb-0" style={{ color: 'var(--green)' }}>My Job Postings</h2>
        </motion.div>
        <Link to="/jobs/post" className="btn-nuesa btn-green btn-sm">+ Post New</Link>
      </motion.div>

      {list.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-briefcase" />
          <p>You haven't posted any jobs yet.</p>
          <Link to="/jobs/post" className="btn-nuesa btn-outline">Post a job</Link>
        </div>
      ) : (
        <motion.div
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="d-flex flex-column gap-3"
        >
          {list.map((job, i) => {
            const sc = statusColors[job.status] || { bg: '#eee', text: '#666' };
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card-nuesa p-3"
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Link to={`/jobs/${job.id}`} className="fw-bold text-decoration-none" style={{ color: 'var(--text)' }}>{job.title}</Link>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{job.company} • {job.location || 'Remote'}</div>
                  </div>
                  <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.text, textTransform: 'capitalize' }}>{job.status}</span>
                </div>
                <div className="d-flex gap-2 mt-2 small">
                  <Link to={`/jobs/${job.id}`} style={{ color: 'var(--green)' }}>View</Link>
                  {['pending', 'approved'].includes(job.status) && (
                    <button onClick={() => { if (confirm('Delete this job?')) deleteMut.mutate(job.id); }}
                      style={{ color: '#721c24', border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: 13 }}>Delete</button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}