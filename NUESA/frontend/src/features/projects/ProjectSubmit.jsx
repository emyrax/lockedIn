import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const DEPARTMENTS = [
  { code: 'ABE', name: 'Agricultural & Bioresources Eng.' },
  { code: 'CVE', name: 'Civil Engineering' },
  { code: 'EEE', name: 'Electrical Engineering' },
  { code: 'ELE', name: 'Electronic Engineering' },
  { code: 'MCE', name: 'Mechanical Engineering' },
  { code: 'MME', name: 'Metallurgical & Materials Eng.' },
  { code: 'MTE', name: 'Mechatronics Engineering' },
  { code: 'BME', name: 'Biomedical Engineering' },
];

const CATEGORIES = [
  { value: 'research', label: 'Research Project' },
  { value: 'startup', label: 'Startup / Venture' },
  { value: 'capstone', label: 'Capstone Project' },
  { value: 'hackathon', label: 'Hackathon Project' },
  { value: 'innovation', label: 'Innovation Lab' },
];

const emptyTeamMember = { name: '', role: '' };

const STEP_ICONS = ['fa-info-circle', 'fa-align-left', 'fa-image', 'fa-users', 'fa-check'];

export default function ProjectSubmit() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '', tagline: '', category: '', department: '', description: '',
    mentor_name: '', cover_image: '', video_url: '', github_url: '', demo_url: '',
    tech_stack: '', sdg_tags: '', team_members: [{ ...emptyTeamMember }],
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const updateMember = (i, field) => (e) => {
    const members = [...form.team_members];
    members[i] = { ...members[i], [field]: e.target.value };
    setForm({ ...form, team_members: members });
  };
  const addMember = () => setForm({ ...form, team_members: [...form.team_members, { ...emptyTeamMember }] });
  const removeMember = (i) => {
    if (form.team_members.length <= 1) return;
    setForm({ ...form, team_members: form.team_members.filter((_, idx) => idx !== i) });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        tech_stack: form.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
        sdg_tags: form.sdg_tags.split(',').map(s => s.trim()).filter(Boolean),
        team_members: form.team_members.filter(m => m.name.trim()),
      };
      await api.post('/projects', payload);
      toast.success('Project submitted for review!');
      navigate('/projects/my');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Link to="/projects" className="btn-nuesa btn-outline btn-sm mb-3">
          <i className="fas fa-arrow-left me-1" />Back to Projects
        </Link>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="fw-bold mb-4" style={{ color: 'var(--orange)' }}>Submit Your Project</h2>
        </motion.div>

        <div className="d-flex gap-2 mb-4 flex-wrap">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="d-flex align-items-center gap-1"
              style={{ opacity: step === s ? 1 : step > s ? 0.6 : 0.3 }}>
              <span className="badge text-white d-flex align-items-center justify-content-center"
                style={{ background: step >= s ? 'var(--orange)' : '#e0e0e0', borderRadius: '50%', width: 28, height: 28 }}>
                <i className={`fas ${STEP_ICONS[s - 1]}`} style={{ fontSize: 12 }} />
              </span>
              <small className="d-none d-md-inline fw-semibold">{['Basics', 'Details', 'Media & Links', 'Team', 'Review'][s - 1]}</small>
              {s < 5 && <small className="text-muted mx-1">—</small>}
            </div>
          ))}
        </div>

        <div className="row justify-content-center">
          <div className="col-md-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="page-card p-4"
              >
                {step === 1 && (
                  <>
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                      <h5 className="fw-bold mb-3" style={{ color: 'var(--green)' }}>Basic Information</h5>
                    </motion.div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Project Title *</label>
                      <input className="form-control form-control-lg" placeholder="e.g. Solar-Powered Irrigation System" value={form.title} onChange={update('title')} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Tagline</label>
                      <input className="form-control" placeholder="Short description (max 200 chars)" value={form.tagline} onChange={update('tagline')} maxLength={200} />
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Category *</label>
                        <select className="form-select" value={form.category} onChange={update('category')}>
                          <option value="">Select category</option>
                          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Department</label>
                        <select className="form-select" value={form.department} onChange={update('department')}>
                          <option value="">Select department</option>
                          {DEPARTMENTS.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                      <h5 className="fw-bold mb-3" style={{ color: 'var(--green)' }}>Project Details</h5>
                    </motion.div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Description *</label>
                      <textarea className="form-control" rows={8} placeholder="Describe your project in detail — problem, solution, methodology, impact..." value={form.description} onChange={update('description')} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Mentor Name</label>
                      <input className="form-control" placeholder="e.g. Prof. John Doe" value={form.mentor_name} onChange={update('mentor_name')} />
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Tech Stack</label>
                        <input className="form-control" placeholder="React, Node.js, Python (comma-separated)" value={form.tech_stack} onChange={update('tech_stack')} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">SDG Tags</label>
                        <input className="form-control" placeholder="SDG 7, SDG 13 (comma-separated)" value={form.sdg_tags} onChange={update('sdg_tags')} />
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                      <h5 className="fw-bold mb-3" style={{ color: 'var(--green)' }}>Media & Links</h5>
                    </motion.div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Cover Image URL</label>
                      <input className="form-control" placeholder="https://example.com/image.jpg" value={form.cover_image} onChange={update('cover_image')} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Demo Video URL</label>
                      <input className="form-control" placeholder="https://youtube.com/watch?v=..." value={form.video_url} onChange={update('video_url')} />
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">GitHub URL</label>
                        <input className="form-control" placeholder="https://github.com/user/repo" value={form.github_url} onChange={update('github_url')} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Demo URL</label>
                        <input className="form-control" placeholder="https://my-project.vercel.app" value={form.demo_url} onChange={update('demo_url')} />
                      </div>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                      <h5 className="fw-bold mb-3" style={{ color: 'var(--green)' }}>Team Members</h5>
                    </motion.div>
                    {form.team_members.map((member, i) => (
                      <div key={i} className="row g-2 mb-2 align-items-end">
                        <div className="col-md-5">
                          <label className="form-label small">Name</label>
                          <input className="form-control" placeholder="Full name" value={member.name} onChange={updateMember(i, 'name')} />
                        </div>
                        <div className="col-md-5">
                          <label className="form-label small">Role</label>
                          <input className="form-control" placeholder="e.g. Lead Developer" value={member.role} onChange={updateMember(i, 'role')} />
                        </div>
                        <div className="col-md-2">
                          {form.team_members.length > 1 && (
                            <button className="btn btn-outline-danger btn-sm" onClick={() => removeMember(i)}>
                              <i className="fas fa-times" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button className="btn-nuesa btn-outline btn-sm" onClick={addMember}>
                      <i className="fas fa-plus me-1" />Add Member
                    </button>
                  </>
                )}

                {step === 5 && (
                  <>
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                      <h5 className="fw-bold mb-3" style={{ color: 'var(--green)' }}>Review & Submit</h5>
                    </motion.div>
                    <div className="mb-3" style={{ color: 'var(--text-muted)' }}>
                      <p><strong style={{ color: 'var(--text)' }}>Title:</strong> {form.title || '—'}</p>
                      <p><strong style={{ color: 'var(--text)' }}>Tagline:</strong> {form.tagline || '—'}</p>
                      <p><strong style={{ color: 'var(--text)' }}>Category:</strong> {form.category || '—'}</p>
                      <p><strong style={{ color: 'var(--text)' }}>Department:</strong> {form.department || '—'}</p>
                      <p><strong style={{ color: 'var(--text)' }}>Mentor:</strong> {form.mentor_name || '—'}</p>
                      <p><strong style={{ color: 'var(--text)' }}>Description:</strong> {form.description.slice(0, 200)}...</p>
                      <p><strong style={{ color: 'var(--text)' }}>Tech Stack:</strong> {form.tech_stack || '—'}</p>
                      <p><strong style={{ color: 'var(--text)' }}>Team:</strong> {form.team_members.filter(m => m.name).length} member(s)</p>
                    </div>
                    <button className="btn-nuesa btn-primary btn-lg w-100" onClick={handleSubmit} disabled={loading || !form.title || !form.description}>
                      {loading ? 'Submitting...' : 'Submit for Review'}
                    </button>
                  </>
                )}

                <div className="d-flex justify-content-between mt-4">
                  {step > 1 ? (
                    <button className="btn-nuesa btn-outline" onClick={() => setStep(step - 1)}>
                      <i className="fas fa-arrow-left me-1" />Back
                    </button>
                  ) : <div />}
                  {step < 5 && (
                    <button className="btn-nuesa btn-green px-4" onClick={() => setStep(step + 1)}>
                      Next <i className="fas fa-arrow-right ms-1" />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}