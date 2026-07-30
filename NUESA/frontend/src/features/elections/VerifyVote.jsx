import { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';

export default function VerifyVote() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [hash, setHash] = useState(searchParams.get('hash') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!hash.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.verifyVote(id, hash.trim());
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 500 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Link to={`/elections/${id}`} className="btn-nuesa btn-outline btn-sm mb-3">&larr; Back to Election</Link>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="fw-bold mb-1" style={{ color: 'var(--green)' }}>Verify Your Vote</h2>
          <p className="text-muted small mb-4">Enter your vote receipt hash to confirm it was counted</p>
        </motion.div>

        <form onSubmit={handleVerify} className="d-flex gap-2 mb-3">
          <input value={hash} onChange={e => setHash(e.target.value)} placeholder="Paste your receipt hash..." className="form-control" />
          <button type="submit" disabled={loading || !hash.trim()} className="btn-nuesa btn-green">
            {loading ? '...' : 'Verify'}
          </button>
        </form>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: '#f8d7da', color: '#721c24', padding: 12, borderRadius: 6, fontSize: 14 }}>
            {error}
          </motion.div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="p-4 text-center"
            style={{
              borderRadius: 8,
              background: result.verified ? '#f0fff0' : '#fff3cd',
              border: `2px solid ${result.verified ? 'var(--green)' : '#ffc107'}`,
            }}>
            {result.verified ? (
              <>
                <i className="fas fa-check-circle" style={{ fontSize: 48, color: 'var(--green)' }} />
                <h3 style={{ color: 'var(--green)', margin: '8px 0' }}>Vote Verified</h3>
                <p style={{ color: 'var(--text-muted)', margin: '4px 0' }}>Position: <strong>{result.position}</strong></p>
                <p style={{ color: 'var(--text-muted)', margin: '4px 0' }}>Candidate: <strong>{result.candidate}</strong></p>
                <p className="small text-muted mt-2">Timestamp: {new Date(result.timestamp).toLocaleString()}</p>
              </>
            ) : (
              <>
                <h3 style={{ color: '#856404', margin: '0 0 8px' }}>✗ Not Found</h3>
                <p style={{ color: 'var(--text-muted)' }}>{result.message}</p>
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}