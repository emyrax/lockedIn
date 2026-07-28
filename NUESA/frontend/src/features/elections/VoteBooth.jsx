import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuth } from '../../stores/auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoteBooth() {
  const { id } = useParams();
  const { user } = useAuth();
  const [currentPosIdx, setCurrentPosIdx] = useState(0);
  const [selected, setSelected] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  const { data: election, isLoading } = useQuery({
    queryKey: ['election', id],
    queryFn: () => api.getElection(id),
  });

  if (isLoading) return <div className="page-container"><div className="loading-state"><div className="spinner-border" style={{ color: 'var(--green)' }} /></div></div>;

  if (!election || election.status !== 'voting') {
    return (
      <div className="page-container text-center">
        <h2 style={{ color: 'var(--text)' }}>Voting is not open</h2>
        <Link to={`/elections/${id}`} className="btn-nuesa btn-outline mt-2">Back to election</Link>
      </div>
    );
  }

  const positions = election.positions || [];
  const pos = positions[currentPosIdx];

  if (receipt) {
    return (
      <div className="page-container" style={{ maxWidth: 600 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 text-center"
          style={{ border: '2px solid var(--green)', borderRadius: 12, background: '#f0fff0' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <i className="fas fa-check-circle" style={{ fontSize: 64, color: 'var(--green)' }} />
          </motion.div>
          <h2 style={{ color: 'var(--green)', marginTop: 12 }}>Vote Cast Successfully!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Your vote has been recorded anonymously.</p>
          <div className="page-card p-3 my-3">
            <p className="small text-muted mb-1">Your receipt (save this to verify):</p>
            <code style={{ fontSize: 12, wordBreak: 'break-all' }}>{receipt}</code>
          </div>
          <div className="d-flex gap-2 justify-content-center">
            <Link to={`/elections/${id}/verify?hash=${receipt}`} className="btn-nuesa btn-green">Verify Vote</Link>
            <Link to={`/elections/${id}`} className="btn-nuesa btn-outline">View Election</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSelect = (candidateId) => {
    setSelected(prev => ({ ...prev, [pos.id]: candidateId }));
  };

  const handleNext = async () => {
    if (!selected[pos.id]) { setError('Please select a candidate'); return; }
    setError('');
    setSubmitting(true);
    try {
      const result = await api.castVote(id, pos.id, selected[pos.id]);
      if (currentPosIdx < positions.length - 1) {
        setCurrentPosIdx(prev => prev + 1);
        setSubmitting(false);
      } else {
        setReceipt(result.vote_hash);
      }
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Link to={`/elections/${id}`} className="btn-nuesa btn-outline btn-sm mb-3">&larr; Back to Election</Link>

        <div style={{ marginBottom: 24 }}>
          <h2 className="fw-bold mb-1">Cast Your Vote</h2>
          <p className="text-muted small">{election.title}</p>
          <div className="d-flex gap-1 mt-2">
            {positions.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: i < currentPosIdx ? 'var(--green)' : i === currentPosIdx ? 'var(--orange)' : '#e0e0e0',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <div className="text-muted small mt-1">Position {currentPosIdx + 1} of {positions.length}</div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: '#f8d7da', color: '#721c24', padding: '8px 16px', borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {pos && (
            <motion.div
              key={pos.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <h3 className="fw-bold mb-1">{pos.title}</h3>
              {pos.description && <p className="text-muted small mb-3">{pos.description}</p>}

              <div className="d-flex flex-column gap-2">
                {(pos.candidates || []).length === 0 ? (
                  <p className="text-muted">No candidates available for this position</p>
                ) : (
                  pos.candidates.map(cand => {
                    const isSelected = selected[pos.id] === cand.id;
                    return (
                      <motion.button
                        key={cand.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(cand.id)}
                        className="d-flex align-items-center gap-3 p-3 w-100 text-start"
                        style={{
                          borderRadius: 8, cursor: 'pointer', border: `2px solid ${isSelected ? 'var(--green)' : '#e0e0e0'}`,
                          background: isSelected ? '#f0fff0' : '#fff', transition: 'all 0.15s',
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          border: `2px solid ${isSelected ? 'var(--green)' : '#ccc'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {isSelected && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)' }} />}
                        </div>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                          border: isSelected ? '2px solid var(--green)' : '2px solid transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, background: '#e0e0e0', color: 'var(--text-muted)',
                        }}>
                          {cand.photo_url ? (
                            <img src={cand.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (cand.profiles?.full_name?.[0] || '?')}
                        </div>
                        <div>
                          <div className="fw-bold" style={{ color: 'var(--text)' }}>{cand.profiles?.full_name || 'Unknown'}</div>
                          <div className="small" style={{ color: 'var(--text-muted)' }}>
                            {cand.profiles?.department} {cand.profiles?.level && `• ${cand.profiles.level}`}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>

              <div className="d-flex" style={{ justifyContent: currentPosIdx > 0 ? 'space-between' : 'flex-end', marginTop: 24 }}>
                {currentPosIdx > 0 && (
                  <button onClick={() => setCurrentPosIdx(prev => prev - 1)} className="btn-nuesa btn-outline">Previous</button>
                )}
                <button onClick={handleNext} disabled={submitting || !selected[pos.id]}
                  className="btn-nuesa" style={{ background: selected[pos.id] ? 'var(--green)' : '#ccc', color: '#fff', border: 'none', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Submitting...' : currentPosIdx < positions.length - 1 ? 'Next Position' : 'Submit Vote'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}