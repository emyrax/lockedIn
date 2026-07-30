import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function MyAlumniProfile() {
  const [form, setForm] = useState({
    graduation_year: '', degree: '', current_company: '', current_position: '',
    industry: '', location_city: '', location_country: '', bio: '',
    linkedin_url: '', website_url: '', mentorship_available: false,
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-alumni-profile'],
    queryFn: () => api.getMyAlumniProfile(),
  });

  useEffect(() => {
    if (profile && profile.id) {
      setForm({
        graduation_year: profile.graduation_year?.toString() || '',
        degree: profile.degree || '',
        current_company: profile.current_company || '',
        current_position: profile.current_position || '',
        industry: profile.industry || '',
        location_city: profile.location_city || '',
        location_country: profile.location_country || '',
        bio: profile.bio || '',
        linkedin_url: profile.linkedin_url || '',
        website_url: profile.website_url || '',
        mentorship_available: profile.mentorship_available || false,
      });
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (data) => api.upsertAlumniProfile(data),
    onSuccess: () => toast.success('Profile saved'),
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...form, graduation_year: parseInt(form.graduation_year) || null });
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(p => ({ ...p, [field]: value }));
  };

  if (isLoading) return <div className="page-container"><div className="loading-state"><div className="spinner-border" style={{ color: 'var(--green)' }} /></div></div>;

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="fw-bold mb-1" style={{ color: 'var(--green)' }}>{profile?.id ? 'Edit' : 'Create'} Alumni Profile</h2>
          <p className="text-muted small mb-4">
            {profile?.id ? 'Update your alumni information' : 'Fill in your details to join the alumni directory'}
          </p>
        </motion.div>

        <div className="page-card p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label fw-semibold small">Graduation Year</label>
                <input type="number" value={form.graduation_year} onChange={handleChange('graduation_year')} required className="form-control" />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold small">Degree</label>
                <input value={form.degree} onChange={handleChange('degree')} placeholder="e.g. B.Eng Civil Engineering" className="form-control" />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold small">Current Position</label>
                <input value={form.current_position} onChange={handleChange('current_position')} placeholder="e.g. Software Engineer" className="form-control" />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold small">Company</label>
                <input value={form.current_company} onChange={handleChange('current_company')} placeholder="e.g. Google" className="form-control" />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold small">Industry</label>
                <input value={form.industry} onChange={handleChange('industry')} placeholder="e.g. Technology" className="form-control" />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold small">City</label>
                <input value={form.location_city} onChange={handleChange('location_city')} placeholder="e.g. Lagos" className="form-control" />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold small">Country</label>
                <input value={form.location_country} onChange={handleChange('location_country')} placeholder="e.g. Nigeria" className="form-control" />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold small">LinkedIn URL</label>
                <input value={form.linkedin_url} onChange={handleChange('linkedin_url')} className="form-control" />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold small">Website</label>
                <input value={form.website_url} onChange={handleChange('website_url')} className="form-control" />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold small">Bio</label>
                <textarea value={form.bio} onChange={handleChange('bio')} rows={4} placeholder="Tell us about your career journey..." className="form-control" />
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="mentorship" checked={form.mentorship_available} onChange={handleChange('mentorship_available')} />
                  <label className="form-check-label small fw-semibold" htmlFor="mentorship">Available for mentorship</label>
                </div>
              </div>
            </div>
            <button type="submit" disabled={mutation.isPending} className="btn-nuesa btn-green w-100 mt-4">
              {mutation.isPending ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}