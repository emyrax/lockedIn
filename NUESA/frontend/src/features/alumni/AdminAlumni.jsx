import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminAlumni() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-alumni'],
    queryFn: () => api.adminListAlumni({ search }),
  });

  const featMut = useMutation({
    mutationFn: (id) => api.adminToggleFeature(id),
    onSuccess: () => { qc.invalidateQueries(['admin-alumni']); toast.success('Updated'); },
    onError: (err) => toast.error(err.message),
  });

  const visMut = useMutation({
    mutationFn: (id) => api.adminToggleVisibility(id),
    onSuccess: () => { qc.invalidateQueries(['admin-alumni']); toast.success('Visibility toggled'); },
    onError: (err) => toast.error(err.message),
  });

  const alumni = data?.alumni || [];

  return (
    <div>
      <h4 className="fw-bold mb-4" style={{ color: 'var(--green)' }}>Alumni Manager</h4>

      <div className="d-flex gap-2 mb-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alumni..."
          className="form-control" style={{ maxWidth: 300 }} />
        <button onClick={() => qc.invalidateQueries(['admin-alumni'])} className="btn-nuesa btn-green">Search</button>
      </div>

      {isLoading ? (
        <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--green)' }} /></div>
      ) : alumni.length === 0 ? (
        <p className="text-muted">No alumni profiles found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead><tr><th>Name</th><th>Position</th><th>Company</th><th>Year</th><th>Industry</th><th>Featured</th><th>Visible</th><th>Actions</th></tr></thead>
            <tbody>
              {alumni.map(a => (
                <tr key={a.id}>
                  <td className="fw-semibold">
                    <Link to={`/alumni/${a.user_id}`} style={{ color: 'var(--green)' }}>{a.profiles?.full_name || 'Unknown'}</Link>
                  </td>
                  <td style={{ fontSize: 13 }}>{a.current_position || '—'}</td>
                  <td style={{ fontSize: 13 }}>{a.current_company || '—'}</td>
                  <td>{a.graduation_year}</td>
                  <td style={{ fontSize: 13 }}>{a.industry || '—'}</td>
                  <td>{a.is_featured ? <span style={{ color: '#155724', fontWeight: 600 }}>Yes</span> : 'No'}</td>
                  <td>{a.is_visible ? <span style={{ color: '#155724' }}>Yes</span> : <span style={{ color: '#721c24' }}>No</span>}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button onClick={() => featMut.mutate(a.id)}
                        className="btn-nuesa btn-sm"
                        style={{ background: a.is_featured ? '#fff3cd' : '#d4edda', color: a.is_featured ? '#856404' : '#155724', border: 'none', fontSize: 12 }}>
                        {a.is_featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button onClick={() => visMut.mutate(a.id)}
                        className="btn-nuesa btn-sm"
                        style={{ background: '#e0e0e0', color: '#333', border: 'none', fontSize: 12 }}>
                        {a.is_visible ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}