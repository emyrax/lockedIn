import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

function ResultsView({ electionId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['results', electionId],
    queryFn: () => api.getResults(electionId),
  });

  if (isLoading) return <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--green)', height: 24, width: 24 }} /></div>;
  if (!data?.results) return <p className="text-muted">No results yet.</p>;

  return (
    <div className="d-flex flex-column gap-3">
      {data.results.map((r, i) => (
        <div key={i} className="page-card p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="fw-bold mb-0" style={{ color: 'var(--text)' }}>{r.position}</h5>
            <span className="small text-muted">Total: {r.total_votes} vote{r.total_votes !== 1 ? 's' : ''}</span>
          </div>
          {r.candidates.length === 0 ? (
            <p className="text-muted small">No votes cast</p>
          ) : (
            <div>
              {r.candidates.map((c, j) => (
                <div key={j} className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontWeight: j === 0 && r.candidates.length > 1 ? 700 : 400 }}>
                      {c.candidate?.profiles?.full_name || 'Unknown'}
                      {j === 0 && r.candidates.length > 1 && <span style={{ marginLeft: 6, color: 'var(--green)' }}>★</span>}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{c.votes} ({Math.round((c.votes / r.total_votes) * 100)}%)</span>
                  </div>
                  <div style={{ height: 8, background: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round((c.votes / r.total_votes) * 100)}%`, background: j === 0 ? 'var(--green)' : '#1a1a2e', borderRadius: 4, minWidth: c.votes > 0 ? 4 : 0 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminElectionDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [tab, setTab] = useState('phases');
  const [showPosForm, setShowPosForm] = useState(false);
  const [posForm, setPosForm] = useState({ title: '', description: '', max_candidates: 10, sort_order: 0 });
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ user_id: '', position_id: '', manifesto: '' });
  const [candFilter, setCandFilter] = useState('');
  const [rejectNote, setRejectNote] = useState({});

  const { data: election, isLoading } = useQuery({
    queryKey: ['admin-election', id],
    queryFn: () => api.getElection(id),
  });

  const { data: candidates } = useQuery({
    queryKey: ['admin-candidates', id, candFilter],
    queryFn: () => api.adminListCandidates(id, candFilter || undefined),
    enabled: !!id,
  });

  const { data: voters } = useQuery({
    queryKey: ['admin-voters', id],
    queryFn: () => api.getVoterRegistry(id),
    enabled: tab === 'voters',
  });

  const statusMutation = useMutation({
    mutationFn: (s) => api.transitionStatus(id, s),
    onSuccess: () => { qc.invalidateQueries(['admin-election', id]); toast.success('Status updated'); },
    onError: (err) => toast.error(err.message),
  });

  const publishMutation = useMutation({
    mutationFn: (publish) => api.publishResults(id, publish),
    onSuccess: () => { qc.invalidateQueries(['admin-election', id]); toast.success('Results updated'); },
    onError: (err) => toast.error(err.message),
  });

  const posCreateMut = useMutation({
    mutationFn: (d) => api.createPosition(id, d),
    onSuccess: () => { qc.invalidateQueries(['admin-election', id]); toast.success('Position created'); setShowPosForm(false); setPosForm({ title: '', description: '', max_candidates: 10, sort_order: 0 }); },
    onError: (err) => toast.error(err.message),
  });

  const posDeleteMut = useMutation({
    mutationFn: (pid) => api.deletePosition(pid),
    onSuccess: () => { qc.invalidateQueries(['admin-election', id]); toast.success('Position deleted'); },
    onError: (err) => toast.error(err.message),
  });

  const verifyMut = useMutation({
    mutationFn: (cid) => api.verifyCandidate(cid),
    onSuccess: () => { qc.invalidateQueries(['admin-candidates', id]); toast.success('Candidate verified'); },
    onError: (err) => toast.error(err.message),
  });

  const rejectMut = useMutation({
    mutationFn: ({ cid, note }) => api.rejectCandidate(cid, note),
    onSuccess: () => { qc.invalidateQueries(['admin-candidates', id]); toast.success('Candidate rejected'); },
    onError: (err) => toast.error(err.message),
  });

  const enrollMut = useMutation({
    mutationFn: (d) => api.enrollCandidate(d),
    onSuccess: () => { qc.invalidateQueries(['admin-candidates', id]); toast.success('Candidate enrolled'); setShowEnrollForm(false); setEnrollForm({ user_id: '', position_id: '', manifesto: '' }); },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--green)' }} /></div>;
  if (!election) return <p className="text-muted">Election not found</p>;

  const nextStatus = (current) => {
    const map = { draft: 'pending', pending: 'nomination', nomination: 'voting', voting: 'completed' };
    return map[current];
  };
  const canNext = ['draft', 'pending', 'nomination', 'voting'].includes(election.status);
  const ns = nextStatus(election.status);
  const tabs = ['phases', 'positions', 'candidates', 'voters', 'results'];

  return (
    <div>
      <Link to="/admin/elections" className="btn-nuesa btn-outline btn-sm mb-2">&larr; All Elections</Link>
      <h4 className="fw-bold mb-1" style={{ color: 'var(--green)' }}>{election.title}</h4>
      <p className="small text-muted mb-3">
        {election.election_type} • Status: {election.status}
        {election.results_published && ' • Results published'}
      </p>

      <div className="d-flex gap-1 mb-3" style={{ borderBottom: '2px solid #e0e0e0' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '8px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--green)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--green)' : '2px solid transparent',
              marginBottom: -2, textTransform: 'capitalize',
            }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'phases' && (
        <div>
          <h5 className="fw-bold mb-2" style={{ color: 'var(--text)' }}>Election Phases</h5>
          <div className="d-flex gap-2 mb-3 flex-wrap">
            {['draft', 'pending', 'nomination', 'voting', 'completed'].map(p => {
              const active = election.status === p;
              const idx = ['draft', 'pending', 'nomination', 'voting', 'completed'].indexOf(election.status);
              const pi = ['draft', 'pending', 'nomination', 'voting', 'completed'].indexOf(p);
              const passed = pi < idx || (p === 'completed' && election.status === 'completed');
              return (
                <div key={p} style={{
                  padding: '8px 16px', borderRadius: 6,
                  background: active ? 'var(--green)' : passed ? '#d4edda' : '#f0f0f0',
                  color: active ? '#fff' : passed ? '#155724' : '#999',
                  fontWeight: active ? 600 : 400, fontSize: 14, textTransform: 'capitalize',
                }}>{p}</div>
              );
            })}
          </div>
          <div className="d-flex gap-2">
            {canNext && (
              <button onClick={() => statusMutation.mutate(ns)} className="btn-nuesa btn-green text-capitalize">
                Advance to {ns}
              </button>
            )}
            {election.status === 'completed' && !election.results_published && (
              <button onClick={() => publishMutation.mutate(true)} className="btn-nuesa" style={{ background: '#1a1a2e', color: '#fff', border: 'none' }}>
                Publish Results
              </button>
            )}
            {election.results_published && (
              <button onClick={() => publishMutation.mutate(false)} className="btn-nuesa" style={{ background: '#f8d7da', color: '#721c24', border: 'none' }}>
                Unpublish Results
              </button>
            )}
          </div>
        </div>
      )}

      {tab === 'positions' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="fw-bold mb-0" style={{ color: 'var(--text)' }}>Positions</h5>
            <button onClick={() => setShowPosForm(!showPosForm)} className="btn-nuesa btn-green btn-sm">
              {showPosForm ? 'Cancel' : '+ Add Position'}
            </button>
          </div>

          {showPosForm && (
            <form onSubmit={e => { e.preventDefault(); posCreateMut.mutate(posForm); }}
              className="page-card p-3 mb-3" style={{ borderLeft: '3px solid var(--green)' }}>
              <div className="row g-2">
                <div className="col-12">
                  <label className="form-label small fw-semibold">Title</label>
                  <input value={posForm.title} onChange={e => setPosForm(p => ({ ...p, title: e.target.value }))} required className="form-control" />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Description</label>
                  <input value={posForm.description} onChange={e => setPosForm(p => ({ ...p, description: e.target.value }))} className="form-control" />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold">Max Candidates</label>
                  <input type="number" value={posForm.max_candidates} onChange={e => setPosForm(p => ({ ...p, max_candidates: +e.target.value }))} className="form-control" />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold">Sort Order</label>
                  <input type="number" value={posForm.sort_order} onChange={e => setPosForm(p => ({ ...p, sort_order: +e.target.value }))} className="form-control" />
                </div>
              </div>
              <button type="submit" className="btn-nuesa btn-green btn-sm mt-2">Save</button>
            </form>
          )}

          {(election.positions || []).length === 0 ? (
            <p className="text-muted">No positions defined.</p>
          ) : (
            <table className="table table-hover">
              <thead><tr><th>Order</th><th>Title</th><th>Description</th><th>Max</th><th>Actions</th></tr></thead>
              <tbody>
                {election.positions.map(p => (
                  <tr key={p.id}>
                    <td>{p.sort_order}</td>
                    <td className="fw-semibold">{p.title}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.description || '—'}</td>
                    <td>{p.max_candidates}</td>
                    <td>
                      <button onClick={() => { if (confirm('Delete this position?')) posDeleteMut.mutate(p.id); }}
                        style={{ background: '#f8d7da', color: '#721c24', border: 'none', padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'candidates' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="fw-bold mb-0" style={{ color: 'var(--text)' }}>Candidates</h5>
            <button onClick={() => setShowEnrollForm(!showEnrollForm)} className="btn-nuesa btn-green btn-sm">
              {showEnrollForm ? 'Cancel' : '+ Enroll Candidate'}
            </button>
          </div>

          {showEnrollForm && (
            <form onSubmit={e => { e.preventDefault(); enrollMut.mutate(enrollForm); }}
              className="page-card p-3 mb-3" style={{ borderLeft: '3px solid var(--green)' }}>
              <div className="mb-2">
                <label className="form-label small fw-semibold">User ID</label>
                <input value={enrollForm.user_id} onChange={e => setEnrollForm(p => ({ ...p, user_id: e.target.value }))} required placeholder="Profile UUID" className="form-control" />
              </div>
              <div className="mb-2">
                <label className="form-label small fw-semibold">Position</label>
                <select value={enrollForm.position_id} onChange={e => setEnrollForm(p => ({ ...p, position_id: e.target.value }))} required className="form-select">
                  <option value="">Select...</option>
                  {(election.positions || []).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="mb-2">
                <label className="form-label small fw-semibold">Manifesto</label>
                <textarea value={enrollForm.manifesto} onChange={e => setEnrollForm(p => ({ ...p, manifesto: e.target.value }))} rows={4} className="form-control" />
              </div>
              <button type="submit" className="btn-nuesa btn-green btn-sm">Enroll</button>
            </form>
          )}

          <div className="d-flex gap-2 mb-2 flex-wrap">
            {['', 'pending', 'verified', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setCandFilter(s)}
                style={{
                  padding: '4px 14px', borderRadius: 14, border: '1px solid #ddd', cursor: 'pointer',
                  background: candFilter === s ? 'var(--green)' : '#fff', color: candFilter === s ? '#fff' : '#333',
                  fontSize: 13, fontWeight: candFilter === s ? 600 : 400, textTransform: 'capitalize',
                }}>
                {s || 'All'}
              </button>
            ))}
          </div>

          {(!candidates || candidates.length === 0) ? (
            <p className="text-muted">No candidates found.</p>
          ) : (
            <table className="table table-hover">
              <thead><tr><th>Name</th><th>Position</th><th>Department</th><th>Level</th><th>Status</th><th>Applied</th><th>Actions</th></tr></thead>
              <tbody>
                {candidates.map(c => (
                  <tr key={c.id}>
                    <td className="fw-semibold">{c.profiles?.full_name || 'Unknown'}</td>
                    <td>{c.positions?.title}</td>
                    <td>{c.profiles?.department}</td>
                    <td>{c.profiles?.level}</td>
                    <td><span style={{
                      padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                      background: c.status === 'pending' ? '#fff3cd' : c.status === 'verified' ? '#cce5ff' : c.status === 'approved' ? '#d4edda' : '#f8d7da',
                      color: c.status === 'pending' ? '#856404' : c.status === 'verified' ? '#004085' : c.status === 'approved' ? '#155724' : '#721c24',
                      textTransform: 'capitalize',
                    }}>{c.status}</span></td>
                    <td style={{ fontSize: 13 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-1">
                        {c.status === 'pending' && (
                          <>
                            <button onClick={() => verifyMut.mutate(c.id)}
                              style={{ background: '#d4edda', color: '#155724', border: 'none', padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Verify</button>
                            <button onClick={() => { const note = rejectNote[c.id] || ''; const n = prompt('Rejection note (optional):', note); if (n !== null) { setRejectNote(p => ({ ...p, [c.id]: n })); rejectMut.mutate({ cid: c.id, note: n }); } }}
                              style={{ background: '#f8d7da', color: '#721c24', border: 'none', padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Reject</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'voters' && (
        <div>
          <h5 className="fw-bold mb-2" style={{ color: 'var(--text)' }}>Voter Registry</h5>
          {voters && (
            <div className="d-flex gap-3 mb-3">
              {[
                { value: voters.total_eligible, label: 'Eligible Voters', bg: '#e0f0e0', color: 'var(--green)' },
                { value: voters.total_voted, label: 'Voted', bg: '#d4edda', color: '#155724' },
                { value: `${voters.turnout_pct}%`, label: 'Turnout', bg: '#cce5ff', color: '#004085' },
              ].map((stat, i) => (
                <div key={i} className="page-card p-3 text-center" style={{ background: stat.bg, minWidth: 120 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div className="small" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
          {voters?.voters?.length > 0 ? (
            <table className="table table-hover">
              <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Level</th><th>Voted</th><th>Voted At</th></tr></thead>
              <tbody>
                {voters.voters.map(v => (
                  <tr key={v.id}>
                    <td className="fw-semibold">{v.profiles?.full_name || 'Unknown'}</td>
                    <td style={{ fontSize: 13 }}>{v.profiles?.email}</td>
                    <td>{v.profiles?.department}</td>
                    <td>{v.profiles?.level}</td>
                    <td>{v.has_voted ? <span style={{ color: '#155724', fontWeight: 600 }}>Yes</span> : <span style={{ color: '#999' }}>No</span>}</td>
                    <td style={{ fontSize: 13 }}>{v.voted_at ? new Date(v.voted_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted">No voters registered yet.</p>
          )}
        </div>
      )}

      {tab === 'results' && (
        <div>
          <h5 className="fw-bold mb-2" style={{ color: 'var(--text)' }}>Results</h5>
          <div className="mb-2">
            {election.results_published ? (
              <span className="badge bg-success">Published</span>
            ) : election.status === 'completed' ? (
              <span className="badge bg-warning text-dark">Not published yet</span>
            ) : (
              <span className="text-muted small">Results available after election completes</span>
            )}
          </div>
          <ResultsView electionId={id} />
        </div>
      )}
    </div>
  );
}