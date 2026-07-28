import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ApplyCandidate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [positionId, setPositionId] = useState('');
  const [manifesto, setManifesto] = useState('');

  const { data: election } = useQuery({
    queryKey: ['election', id],
    queryFn: () => api.getElection(id),
  });

  const mutation = useMutation({
    mutationFn: (data) => api.applyCandidate(id, data),
    onSuccess: () => {
      toast.success('Application submitted! Awaiting verification.');
      navigate(`/elections/${id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!positionId) return toast.error('Select a position');
    mutation.mutate({ position_id: positionId, manifesto });
  };

  const positions = election?.positions || [];

  return (
    <div className="page-container" style={{ maxWidth: 600 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Link to={`/elections/${id}`} className="btn-nuesa btn-outline btn-sm mb-3">&larr; Back to Election</Link>
        <h2 className="fw-bold mb-1" style={{ color: 'var(--green)' }}>Apply as Candidate</h2>
        {election && <p className="text-muted small mb-4">{election.title}</p>}

        {election?.status !== 'nomination' ? (
          <p className="text-muted">This election is not accepting nominations right now.</p>
        ) : (
          <div className="page-card p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Position</label>
                <select value={positionId} onChange={e => setPositionId(e.target.value)} required className="form-select">
                  <option value="">Select a position...</option>
                  {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Manifesto</label>
                <textarea value={manifesto} onChange={e => setManifesto(e.target.value)} rows={8}
                  placeholder="Outline your vision, qualifications, and plans..." className="form-control" />
              </div>
              <button type="submit" disabled={mutation.isPending} className="btn-nuesa btn-green w-100">
                {mutation.isPending ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}