import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

function VersionEditor({ section, onBack }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');

  const { data: versionsData } = useQuery({
    queryKey: ['versions', section.slug],
    queryFn: () => api.getSectionVersions(section.slug),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.createVersion(section.slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['versions', section.slug]);
      toast.success('Draft saved'); setContent(''); setSummary('');
    },
    onError: (err) => toast.error(err.message),
  });

  const publishMutation = useMutation({
    mutationFn: (versionId) => api.publishVersion(section.slug, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['versions', section.slug]);
      queryClient.invalidateQueries(['sections']);
      toast.success('Version published');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    let parsedContent;
    try { parsedContent = content ? JSON.parse(content) : section.content; }
    catch { toast.error('Invalid JSON content'); return; }
    createMutation.mutate({ content: parsedContent, change_summary: summary });
  };

  const liveVersionId = versionsData?.live_version_id;
  const versions = versionsData?.versions || [];

  return (
    <div>
      <button className="btn-nuesa btn-outline btn-sm mb-3" onClick={onBack}>
        <i className="fas fa-arrow-left me-1" />Back to Sections
      </button>

      <div className="d-flex align-items-start gap-2 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--green)' }}>{section.label}</h4>
          <span className="badge bg-secondary">{section.section_type}</span>
          <span className="badge bg-light text-dark ms-2">/{section.slug}</span>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-7">
          <div className="page-card p-3">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--green)' }}>Content Editor</h6>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Content (JSON)</label>
                <textarea className="form-control font-monospace" rows={12} value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={JSON.stringify(section.content || {}, null, 2)} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Change Summary</label>
                <input className="form-control" placeholder="e.g. Updated hero headline for 2026/27 session"
                  value={summary} onChange={e => setSummary(e.target.value)} required />
              </div>
              <button className="btn-nuesa btn-primary" type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Save as Draft'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-5">
          <h6 className="fw-bold mb-3" style={{ color: 'var(--green)' }}>Version History</h6>
          {versions.map(v => (
            <div key={v.id} className="page-card p-3 mb-2 d-flex justify-content-between align-items-center"
              style={{ border: liveVersionId === v.id ? '2px solid var(--green)' : '1px solid #eee' }}>
              <div>
                <span className="fw-bold" style={{ color: 'var(--text)' }}>v{v.version_number}</span>
                {v.session_tag && <span className="badge bg-light text-dark ms-2">{v.session_tag}</span>}
                {liveVersionId === v.id && <span className="badge bg-success ms-2">LIVE</span>}
                {!v.published && <span className="badge bg-warning text-dark ms-2">Draft</span>}
                <p className="text-muted small mb-0 mt-1">{v.change_summary || 'No summary'}</p>
                <small className="text-muted">{new Date(v.created_at).toLocaleDateString()}</small>
              </div>
              <div className="d-flex gap-1">
                {v.id !== liveVersionId && v.published && (
                  <button className="btn-nuesa btn-green btn-sm" onClick={() => publishMutation.mutate(v.id)}>Rollback</button>
                )}
                {!v.published && (
                  <button className="btn-nuesa btn-outline btn-sm" onClick={() => publishMutation.mutate(v.id)}>Publish</button>
                )}
              </div>
            </div>
          ))}
          {versions.length === 0 && <p className="text-muted small">No versions yet</p>}
        </div>
      </div>
    </div>
  );
}

export default function SectionManager() {
  const [selectedSlug, setSelectedSlug] = useState(null);

  const { data: sections, isLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: () => api.getSections(),
  });

  if (isLoading) return <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--orange)' }} /></div>;

  if (selectedSlug) {
    const section = sections?.find(s => s.slug === selectedSlug);
    if (!section) return <div className="text-muted">Section not found</div>;
    return <VersionEditor section={section} onBack={() => setSelectedSlug(null)} />;
  }

  return (
    <div>
      <h4 className="fw-bold mb-1" style={{ color: 'var(--green)' }}>Section Manager</h4>
      <p className="text-muted small mb-4">
        Manage versioned content sections. Each edit creates a new version — previous versions are never deleted unless explicitly removed.
      </p>

      <div className="row g-3">
        {sections?.map(section => (
          <div className="col-md-6 col-lg-4" key={section.id}>
            <div className="card-nuesa p-3" style={{ cursor: 'pointer' }} onClick={() => setSelectedSlug(section.slug)}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: 'var(--text)' }}>{section.label}</h6>
                  <span className="badge bg-secondary">{section.section_type}</span>
                  <p className="text-muted small mb-0 mt-2">/{section.slug}</p>
                </div>
                <div className={`badge ${section.version ? 'bg-success' : 'bg-warning'}`}>
                  {section.version ? `v${section.version} live` : 'No live version'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}