import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

const statusColors = {
  pending: { bg: '#fff3cd', text: '#856404' },
  approved: { bg: '#d4edda', text: '#155724' },
  rejected: { bg: '#f8d7da', text: '#721c24' },
  expired: { bg: '#e0e0e0', text: '#666' },
};

export default function AdminJobs() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs', filter],
    queryFn: () => api.adminListJobs({ status: filter || undefined }),
  });

  const approveMut = useMutation({
    mutationFn: (id) => api.adminApproveJob(id),
    onSuccess: () => { qc.invalidateQueries(['admin-jobs']); toast.success('Job approved'); },
    onError: (err) => toast.error(err.message),
  });

  const rejectMut = useMutation({
    mutationFn: (id) => api.adminRejectJob(id),
    onSuccess: () => { qc.invalidateQueries(['admin-jobs']); toast.success('Job rejected'); },
    onError: (err) => toast.error(err.message),
  });

  const jobs = data?.jobs || [];

  return (
    <div>
      <h4 className="fw-bold mb-4" style={{ color: 'var(--green)' }}>Job Moderator</h4>

      <div className="d-flex gap-2 mb-3 flex-wrap">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              padding: '4px 14px', borderRadius: 14, border: '1px solid #ddd', cursor: 'pointer',
              background: filter === s ? 'var(--green)' : '#fff', color: filter === s ? '#fff' : '#333',
              fontSize: 13, fontWeight: filter === s ? 600 : 400, textTransform: 'capitalize',
            }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--green)' }} /></div>
      ) : jobs.length === 0 ? (
        <p className="text-muted">No job postings found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead><tr><th>Title</th><th>Company</th><th>Posted By</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.map(job => {
                const sc = statusColors[job.status] || { bg: '#eee', text: '#666' };
                return (
                  <tr key={job.id}>
                    <td className="fw-semibold">{job.title}</td>
                    <td>{job.company}</td>
                    <td style={{ fontSize: 13 }}>{job.profiles?.full_name || 'Unknown'}</td>
                    <td style={{ fontSize: 13 }}>{new Date(job.created_at).toLocaleDateString()}</td>
                    <td><span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.text, textTransform: 'capitalize' }}>{job.status}</span></td>
                    <td>
                      <div className="d-flex gap-1">
                        {job.status === 'pending' && (
                          <>
                            <button onClick={() => approveMut.mutate(job.id)}
                              className="btn-nuesa btn-sm" style={{ background: '#d4edda', color: '#155724', border: 'none', fontSize: 12 }}>Approve</button>
                            <button onClick={() => rejectMut.mutate(job.id)}
                              className="btn-nuesa btn-sm" style={{ background: '#f8d7da', color: '#721c24', border: 'none', fontSize: 12 }}>Reject</button>
                          </>
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