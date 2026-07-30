import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';

const statusColors = {
  pending: { bg: '#fff3cd', text: '#856404' },
  verified: { bg: '#cce5ff', text: '#004085' },
  approved: { bg: '#d4edda', text: '#155724' },
  rejected: { bg: '#f8d7da', text: '#721c24' },
};

export default function MyCandidacy() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-candidacy'],
    queryFn: () => api.myCandidacy(),
  });

  const applications = data || [];

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="fw-bold mb-4" style={{ color: 'var(--green)' }}>My Candidacy Applications</h2>
        </motion.div>

        {isLoading ? (
          <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--green)' }} /></div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-vote-yea" />
            <p>You haven't applied for any positions yet.</p>
            <Link to="/elections" className="btn-nuesa btn-outline">Browse elections</Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {applications.map((app, i) => {
              const sc = statusColors[app.status] || { bg: '#eee', text: '#666' };
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-nuesa p-3"
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <strong style={{ color: 'var(--text)' }}>{app.positions?.title || 'Unknown Position'}</strong>
                      <div className="small text-muted">{app.elections?.title || 'Election'}</div>
                    </div>
                    <span style={{
                      padding: '3px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      background: sc.bg, color: sc.text, textTransform: 'capitalize',
                    }}>{app.status}</span>
                  </div>
                  {app.manifesto && (
                    <details>
                      <summary style={{ fontSize: 13, color: 'var(--green)', cursor: 'pointer' }}>View Manifesto</summary>
                      <p className="small mt-2" style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{app.manifesto}</p>
                    </details>
                  )}
                  {app.approval_note && (
                    <p className="small mt-2" style={{ background: '#f8d7da', padding: 8, borderRadius: 4, color: '#721c24' }}>
                      Note: {app.approval_note}
                    </p>
                  )}
                  <div className="small text-muted mt-2">Applied: {new Date(app.created_at).toLocaleDateString()}</div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}