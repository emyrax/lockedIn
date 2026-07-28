import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

function emptyForm() {
  return {
    type: 'news', title: '', slug: '', content: '', excerpt: '', cover_image: '',
    category: '', event_date: '', event_end_date: '', location: '',
    rsvp_enabled: false, max_attendees: '', is_published: false, is_featured: false,
  };
}

export default function AdminNewsEvents() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');

  function load() {
    setLoading(true);
    api.adminListNewsEvents({ type: filter || undefined }).then(r => { setItems(r.items || []); }).finally(() => setLoading(false));
    api.getCategories().then(r => setCategories(r.categories || [])).catch(() => {});
  }

  useEffect(() => { load(); }, [filter]);

  function openCreate() { setEditing(null); setForm(emptyForm()); }

  function openEdit(item) {
    setEditing(item.id);
    setForm({
      type: item.type, title: item.title, slug: item.slug, content: item.content || '',
      excerpt: item.excerpt || '', cover_image: item.cover_image || '', category: item.category || '',
      event_date: item.event_date ? item.event_date.slice(0, 16) : '',
      event_end_date: item.event_end_date ? item.event_end_date.slice(0, 16) : '',
      location: item.location || '', rsvp_enabled: item.rsvp_enabled,
      max_attendees: item.max_attendees || '', is_published: item.is_published, is_featured: item.is_featured,
    });
  }

  function closeEditor() { setEditing(null); setForm(emptyForm()); }

  async function handleSave() {
    if (!form.title.trim()) return alert('Title is required');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.event_date) { payload.event_date = null; payload.event_end_date = null; }
      if (!payload.max_attendees) payload.max_attendees = null;
      if (editing) { await api.adminUpdateNewsEvent(editing, payload); }
      else { await api.adminCreateNewsEvent(payload); }
      closeEditor(); load();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  }

  async function togglePublish(id) { try { await api.adminTogglePublish(id); load(); } catch (err) { alert(err.message); } }
  async function toggleFeature(id) { try { await api.adminToggleFeature(id); load(); } catch (err) { alert(err.message); } }
  async function handleDelete(id) { if (!confirm('Delete this item?')) return; try { await api.adminDeleteNewsEvent(id); load(); } catch (err) { alert(err.message); } }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--green)' }}>News & Events</h4>
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm" style={{ width: 140 }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="news">News</option>
            <option value="event">Events</option>
          </select>
          <button className="btn btn-sm text-white" style={{ background: 'var(--orange)' }} onClick={openCreate}>
            <i className="fas fa-plus me-1" /> New
          </button>
        </div>
      </div>

      {(editing !== null || (editing === null && form.title)) ? (
        <div className="page-card p-4 mb-4">
          <h5 className="fw-bold mb-3" style={{ color: 'var(--green)' }}>{editing ? 'Edit' : 'Create'} {form.type === 'news' ? 'News' : 'Event'}</h5>
          <div className="row g-3">
            <div className="col-12">
              <div className="btn-group btn-group-sm mb-2">
                <button className={`btn ${form.type === 'news' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setForm(f => ({ ...f, type: 'news' }))}>News</button>
                <button className={`btn ${form.type === 'event' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setForm(f => ({ ...f, type: 'event' }))}>Event</button>
              </div>
            </div>
            <div className="col-md-8">
              <label className="form-label small fw-bold">Title</label>
              <input className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,290) }))} />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold">Slug</label>
              <input className="form-control form-control-sm" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Category</label>
              <div className="d-flex gap-2">
                <select className="form-select" value={categories.includes(form.category) ? form.category : ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input className="form-control" style={{ maxWidth: 160 }} placeholder="Or type new" value={!categories.includes(form.category) ? form.category : ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Cover Image URL</label>
              <input className="form-control" value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="https://..." />
              {form.cover_image && (
                <div className="mt-2" style={{ width: 120, height: 70, borderRadius: 8, overflow: 'hidden' }}>
                  <img src={form.cover_image} alt="" className="w-100 h-100" style={{ objectFit: 'cover' }} onError={e => e.currentTarget.style.display = 'none'} />
                </div>
              )}
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold">Excerpt</label>
              <textarea className="form-control" rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold">Content <small className="text-muted">(supports HTML)</small></label>
              <textarea className="form-control font-monospace" rows={10} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            </div>
            {form.type === 'event' && (
              <>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Start Date</label>
                  <input type="datetime-local" className="form-control" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">End Date</label>
                  <input type="datetime-local" className="form-control" value={form.event_end_date} onChange={e => setForm(f => ({ ...f, event_end_date: e.target.value }))} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Location</label>
                  <input className="form-control" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div className="col-md-4">
                  <div className="form-check mt-3">
                    <input className="form-check-input" type="checkbox" id="rsvpEnabled" checked={form.rsvp_enabled} onChange={e => setForm(f => ({ ...f, rsvp_enabled: e.target.checked }))} />
                    <label className="form-check-label small" htmlFor="rsvpEnabled">Enable RSVP</label>
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Max Attendees</label>
                  <input type="number" className="form-control" value={form.max_attendees} onChange={e => setForm(f => ({ ...f, max_attendees: e.target.value }))} />
                </div>
              </>
            )}
            <div className="col-12">
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="isPublished" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
                  <label className="form-check-label small" htmlFor="isPublished">Published</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="isFeatured" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} />
                  <label className="form-check-label small" htmlFor="isFeatured">Featured</label>
                </div>
              </div>
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-sm text-white" style={{ background: 'var(--orange)' }} onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                {editing ? 'Update' : 'Create'}
              </button>
              <button className="btn btn-sm btn-outline-secondary" onClick={closeEditor}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border spinner-border-sm" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-5 text-muted"><i className="fas fa-newspaper" style={{ fontSize: 32, opacity: 0.3 }} /><p className="mt-2">No items yet.</p></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="small text-muted">
              <tr><th>Title</th><th>Type</th><th>Category</th><th>Status</th><th>Date</th><th style={{ width: 180 }}>Actions</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <span className="fw-semibold small">{item.title}</span>
                    {item.is_featured && <span className="badge bg-warning text-dark ms-1" style={{ fontSize: 10 }}>Featured</span>}
                  </td>
                  <td><span className="text-capitalize small">{item.type}</span></td>
                  <td><span className="small">{item.category || '—'}</span></td>
                  <td>
                    <span className={`badge ${item.is_published ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: 11 }}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="small text-muted">
                    {item.published_at ? new Date(item.published_at).toLocaleDateString() : new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-dark" style={{ fontSize: 12 }} onClick={() => openEdit(item)}>Edit</button>
                      <button className={`btn btn-sm ${item.is_published ? 'btn-outline-warning' : 'btn-outline-success'}`} style={{ fontSize: 12 }} onClick={() => togglePublish(item.id)}>
                        {item.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button className={`btn btn-sm ${item.is_featured ? 'btn-warning' : 'btn-outline-warning'}`} style={{ fontSize: 12 }} onClick={() => toggleFeature(item.id)}>
                        <i className="fas fa-star" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" style={{ fontSize: 12 }} onClick={() => handleDelete(item.id)}>
                        <i className="fas fa-trash" />
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