import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', company: '', location: '', description: '', requirements: '',
    application_url: '', application_email: '', expires_at: '',
  });

  const mutation = useMutation({
    mutationFn: (data) => api.createJob(data),
    onSuccess: () => { toast.success('Job posted! Awaiting moderation.'); navigate('/jobs/my'); },
    onError: (err) => toast.error(err.message),
  });

  const handleChange = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (!data.application_url) delete data.application_url;
    if (!data.application_email) delete data.application_email;
    if (!data.expires_at) delete data.expires_at;
    mutation.mutate(data);
  };

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link to="/jobs" className="btn-nuesa btn-outline btn-sm mb-3">&larr; All Jobs</Link>
        <h2 className="fw-bold mb-1" style={{ color: 'var(--green)' }}>Post a Job</h2>
        <p className="text-muted small mb-4">Share opportunities with the NUESA community. Postings require moderation.</p>

        <div className="page-card p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold small">Job Title *</label>
                <input value={form.title} onChange={handleChange('title')} required className="form-control" />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold small">Company *</label>
                <input value={form.company} onChange={handleChange('company')} required className="form-control" />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold small">Location</label>
                <input value={form.location} onChange={handleChange('location')} placeholder="e.g. Lagos or Remote" className="form-control" />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold small">Description *</label>
                <textarea value={form.description} onChange={handleChange('description')} rows={6} required
                  placeholder="Describe the role, responsibilities, and ideal candidate..." className="form-control" />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold small">Requirements</label>
                <textarea value={form.requirements} onChange={handleChange('requirements')} rows={4}
                  placeholder="List qualifications, skills, and experience needed..." className="form-control" />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold small">Application URL</label>
                <input value={form.application_url} onChange={handleChange('application_url')} placeholder="https://..." className="form-control" />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold small">Application Email</label>
                <input value={form.application_email} onChange={handleChange('application_email')} placeholder="hr@company.com" className="form-control" />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold small">Expires At</label>
                <input type="date" value={form.expires_at} onChange={handleChange('expires_at')} className="form-control" />
              </div>
            </div>
            <button type="submit" disabled={mutation.isPending} className="btn-nuesa btn-green w-100 mt-4">
              {mutation.isPending ? 'Posting...' : 'Post Job'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}