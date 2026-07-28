import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'featured', label: 'Featured' },
  { value: 'archived', label: 'Archived' },
];

export default function AdminProjects() {
  const [status, setStatus] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects', status],
    queryFn: () => api.get(`/projects/admin/all?${new URLSearchParams({ status, limit: 50 })}`),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/projects/${id}/approve`),
    onSuccess: () => { queryClient.invalidateQueries(['admin-projects']); toast.success('Project approved'); },
    onError: (err) => toast.error(err.message),
  });

  const featureMutation = useMutation({
    mutationFn: (id) => api.patch(`/projects/${id}/feature`),
    onSuccess: () => { queryClient.invalidateQueries(['admin-projects']); toast.success('Featured status toggled'); },
    onError: (err) => toast.error(err.message),
  });

  const projects = data?.projects || [];

  return (
    <div>
      <h4 className="fw-bold mb-4" style={{ color: 'var(--green)' }}>Project Manager</h4>

      <div className="d-flex gap-2 mb-4 flex-wrap align-items-center">
        {statusFilters.map(sf => (
          <button key={sf.value}
            className={`btn btn-sm fw-semibold ${status === sf.value ? 'btn-green' : 'btn-outline'}`}
            style={status === sf.value ? { background: 'var(--green)', color: '#fff', border: '1px solid var(--green)' } : {}}
            onClick={() => setStatus(sf.value)}
          >
            {sf.label}
          </button>
        ))}
        <span className="badge bg-light text-dark d-flex align-items-center ms-auto">
          {data?.total || 0} total
        </span>
      </div>

      {isLoading ? (
        <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--orange)' }} /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-5 text-muted">No projects found</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Title</th><th>Submitter</th><th>Category</th><th>Department</th><th>Upvotes</th><th>Status</th><th>Submitted</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}>
                  <td className="fw-semibold small" style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.title}
                  </td>
                  <td className="small">{p.profiles?.full_name || '—'}</td>
                  <td><span className="badge bg-secondary">{p.category || '—'}</span></td>
                  <td className="small">{p.department || '—'}</td>
                  <td className="small">{p.upvote_count || 0}</td>
                  <td>
                    <span className={`badge ${p.status === 'featured' ? 'bg-warning text-dark' : p.status === 'approved' ? 'bg-success' : p.status === 'submitted' ? 'bg-info' : 'bg-secondary'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="small">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex gap-1">
                      {p.status === 'submitted' && (
                        <button className="btn btn-sm btn-success" onClick={() => approveMutation.mutate(p.id)} disabled={approveMutation.isPending}>Approve</button>
                      )}
                      {(p.status === 'approved' || p.status === 'featured') && (
                        <button className={`btn btn-sm ${p.status === 'featured' ? 'btn-outline-warning' : 'btn-warning'}`} onClick={() => featureMutation.mutate(p.id)} disabled={featureMutation.isPending}>
                          <i className="fas fa-star me-1" />{p.status === 'featured' ? 'Unfeature' : 'Feature'}
                        </button>
                      )}
                      <a href={`/projects/${p.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-dark"><i className="fas fa-eye" /></a>
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