import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

const statusColors = {
  draft: { bg: '#e0e0e0', text: '#666' },
  pending: { bg: '#fff3cd', text: '#856404' },
  nomination: { bg: '#cce5ff', text: '#004085' },
  voting: { bg: '#d4edda', text: '#155724' },
  completed: { bg: '#e2d5f3', text: '#5a2d82' },
  cancelled: { bg: '#f8d7da', text: '#721c24' },
};

export default function AdminElections() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', election_type: 'general',
    nomination_start: '', nomination_end: '', voting_start: '', voting_end: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-elections'],
    queryFn: () => api.listElections(),
  });

  const createMutation = useMutation({
    mutationFn: (d) => api.createElection(d),
    onSuccess: () => { qc.invalidateQueries(['admin-elections']); toast.success('Election created'); setShowForm(false); resetForm(); },
    onError: (err) => toast.error(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.transitionStatus(id, status),
    onSuccess: () => { qc.invalidateQueries(['admin-elections']); toast.success('Status updated'); },
    onError: (err) => toast.error(err.message),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, publish }) => api.publishResults(id, publish),
    onSuccess: () => { qc.invalidateQueries(['admin-elections']); toast.success('Results updated'); },
    onError: (err) => toast.error(err.message),
  });

  const resetForm = () => setForm({ title: '', description: '', election_type: 'general', nomination_start: '', nomination_end: '', voting_start: '', voting_end: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      nomination_start: new Date(form.nomination_start).toISOString(),
      nomination_end: new Date(form.nomination_end).toISOString(),
      voting_start: new Date(form.voting_start).toISOString(),
      voting_end: new Date(form.voting_end).toISOString(),
    });
  };

  const elections = data?.elections || [];

  const nextStatus = (current) => {
    const map = { draft: 'pending', pending: 'nomination', nomination: 'voting', voting: 'completed' };
    return map[current];
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--green)' }}>Election Manager</h4>
        <button onClick={() => setShowForm(!showForm)} className="btn-nuesa btn-green">
          {showForm ? 'Cancel' : '+ New Election'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="page-card p-4 mb-4" style={{ borderLeft: '3px solid var(--green)' }}>
          <h5 className="fw-bold mb-3" style={{ color: 'var(--green)' }}>Create Election</h5>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label small fw-semibold">Title</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required className="form-control" />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Type</label>
              <select value={form.election_type} onChange={e => setForm(p => ({ ...p, election_type: e.target.value }))} className="form-select">
                <option value="general">General</option>
                <option value="faculty">Faculty</option>
                <option value="departmental">Departmental</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Nomination Start</label>
              <input type="datetime-local" value={form.nomination_start} required onChange={e => setForm(p => ({ ...p, nomination_start: e.target.value }))} className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Nomination End</label>
              <input type="datetime-local" value={form.nomination_end} required onChange={e => setForm(p => ({ ...p, nomination_end: e.target.value }))} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Voting Start</label>
              <input type="datetime-local" value={form.voting_start} required onChange={e => setForm(p => ({ ...p, voting_start: e.target.value }))} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Voting End</label>
              <input type="datetime-local" value={form.voting_end} required onChange={e => setForm(p => ({ ...p, voting_end: e.target.value }))} className="form-control" />
            </div>
          </div>
          <button type="submit" disabled={createMutation.isPending} className="btn-nuesa btn-green mt-3">
            {createMutation.isPending ? 'Creating...' : 'Create Election'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--green)' }} /></div>
      ) : elections.length === 0 ? (
        <p className="text-muted">No elections yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Voting Period</th><th>Results</th><th>Actions</th></tr></thead>
            <tbody>
              {elections.map(e => {
                const sc = statusColors[e.status] || {};
                const ns = nextStatus(e.status);
                return (
                  <tr key={e.id}>
                    <td><Link to={`/admin/elections/${e.id}`} style={{ color: 'var(--green)', fontWeight: 600 }}>{e.title}</Link></td>
                    <td className="text-capitalize">{e.election_type}</td>
                    <td><span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.text, textTransform: 'capitalize' }}>{e.status}</span></td>
                    <td style={{ fontSize: 13 }}>{new Date(e.voting_start).toLocaleDateString()} – {new Date(e.voting_end).toLocaleDateString()}</td>
                    <td>
                      {e.results_published ? (
                        <button onClick={() => publishMutation.mutate({ id: e.id, publish: false })}
                          style={{ background: '#fff3cd', color: '#856404', border: '1px solid #856404', padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                          Unpublish
                        </button>
                      ) : e.status === 'completed' ? (
                        <button onClick={() => publishMutation.mutate({ id: e.id, publish: true })}
                          style={{ background: '#d4edda', color: '#155724', border: '1px solid #155724', padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                          Publish
                        </button>
                      ) : <span className="text-muted" style={{ fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Link to={`/admin/elections/${e.id}`} className="btn-nuesa btn-green btn-sm" style={{ fontSize: 12 }}>Manage</Link>
                        {ns && ['draft', 'pending', 'nomination', 'voting'].includes(e.status) && (
                          <button onClick={() => statusMutation.mutate({ id: e.id, status: ns })}
                            className="btn-nuesa btn-sm" style={{ background: '#1a1a2e', color: '#fff', border: 'none', fontSize: 12, textTransform: 'capitalize' }}>
                            → {ns}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}