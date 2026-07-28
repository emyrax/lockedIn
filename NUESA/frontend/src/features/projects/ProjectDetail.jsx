import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';
import { useAuth } from '../../stores/auth';
import toast from 'react-hot-toast';
import PageShell from '../../components/layout/PageShell';

const categoryColors = {
  research: { bg: 'var(--emerald)', label: 'Research' },
  startup: { bg: 'var(--gold)', label: 'Startup' },
  capstone: { bg: '#2563eb', label: 'Capstone' },
  hackathon: { bg: '#7c3aed', label: 'Hackathon' },
  innovation: { bg: '#dc2626', label: 'Innovation' },
};

const fallbackImg = 'https://via.placeholder.com/1200x500/e2e8f0/64748b?text=Project';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [collabMsg, setCollabMsg] = useState('');
  const [showCollab, setShowCollab] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`),
  });

  const upvoteMutation = useMutation({
    mutationFn: () => api.post(`/projects/${id}/upvote`),
    onSuccess: (data) => {
      queryClient.setQueryData(['project', id], old => ({
        ...old,
        userUpvoted: data.upvoted,
        upvote_count: old.upvote_count + (data.upvoted ? 1 : -1),
      }));
    },
  });

  const collabMutation = useMutation({
    mutationFn: (message) => api.post(`/projects/${id}/collab`, { message }),
    onSuccess: () => {
      toast.success('Collaboration request sent!');
      setShowCollab(false);
      setCollabMsg('');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--gold)' }} /></div>;
  if (!project) return <PageShell title="Not Found"><p style={{ color: 'var(--text-muted)' }}>Project not found.</p></PageShell>;

  const isOwner = user?.sub === project.submitted_by;
  const catColor = categoryColors[project.category] || { bg: '#6b7280', label: project.category };

  return (
    <PageShell title={project.title} subtitle={project.tagline} toolIndex={3}>
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm font-medium mb-4 transition-colors" style={{ color: 'var(--emerald)' }}>
        <i className="fas fa-arrow-left text-xs" /> All Projects
      </Link>

      <div className="page-card overflow-hidden mb-6">
        <img
          src={project.cover_image || fallbackImg}
          alt={project.title}
          className="w-full h-48 sm:h-64 lg:h-80 object-cover"
          onError={(e) => { e.target.src = fallbackImg; }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {project.category && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: catColor.bg }}>
                {catColor.label}
              </span>
            )}
            {project.department && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--emerald-light)', color: 'var(--emerald-dark)' }}>
                {project.department}
              </span>
            )}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              project.status === 'featured' ? 'badge-gold' :
              project.status === 'approved' ? 'text-white' : ''
            }`} style={project.status === 'approved' ? { background: 'var(--emerald)', color: 'white' } : {}}>
              {project.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              className={`btn-nuesa text-xs !py-1.5 !px-3.5 ${project.userUpvoted ? 'btn-gold' : 'btn-ghost'}`}
              onClick={() => user ? upvoteMutation.mutate() : navigate('/login')}
              disabled={upvoteMutation.isPending}
            >
              <i className={`fas fa-heart ${project.userUpvoted ? '' : 'far'} mr-1`} />
              {project.upvote_count || 0} Upvotes
            </button>

            {user && !isOwner && project.status !== 'archived' && (
              <button className="btn-nuesa btn-ghost text-xs !py-1.5 !px-3.5" onClick={() => setShowCollab(!showCollab)}>
                <i className="fas fa-handshake mr-1" />Collaborate
              </button>
            )}

            {isOwner && (
              <Link to={`/projects/${id}/edit`} className="btn-nuesa btn-ghost text-xs !py-1.5 !px-3.5">
                <i className="fas fa-edit mr-1" />Edit
              </Link>
            )}
          </div>

          {showCollab && (
            <div className="page-card p-4 mb-4" style={{ background: 'var(--emerald-light)' }}>
              <label className="form-label">Message to project owner</label>
              <textarea className="form-input mb-2 text-sm" rows={2} placeholder="Tell them why you want to join..."
                value={collabMsg} onChange={e => setCollabMsg(e.target.value)} />
              <div className="flex gap-2">
                <button className="btn-nuesa btn-primary text-xs !py-1.5" onClick={() => collabMutation.mutate(collabMsg)} disabled={collabMutation.isPending}>
                  Send Request
                </button>
                <button className="btn-nuesa btn-ghost text-xs !py-1.5" onClick={() => setShowCollab(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="page-card p-5">
            <h5 className="font-bold text-sm mb-3" style={{ color: 'var(--emerald)' }}>About This Project</h5>
            <div className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{project.description}</div>

            {project.tech_stack?.length > 0 && (
              <div className="mt-5">
                <h5 className="font-bold text-sm mb-2" style={{ color: 'var(--emerald)' }}>Tech Stack</h5>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((t, i) => (
                    <span key={i} className="badge-nuesa">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {project.sdg_tags?.length > 0 && (
              <div className="mt-5">
                <h5 className="font-bold text-sm mb-2" style={{ color: 'var(--emerald)' }}>SDG Alignment</h5>
                <div className="flex flex-wrap gap-2">
                  {project.sdg_tags.map((s, i) => (
                    <span key={i} className="badge-nuesa">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="page-card p-4">
            <h6 className="font-bold text-sm mb-3">Submitted By</h6>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'var(--gold)', color: 'white' }}>
                {project.profiles?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm mb-0 truncate">{project.profiles?.full_name || 'Anonymous'}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.profiles?.department}</p>
              </div>
            </div>
          </div>

          {project.mentor_name && (
            <div className="page-card p-4">
              <h6 className="font-bold text-sm mb-2">Mentor</h6>
              <p className="text-sm font-medium">{project.mentor_name}</p>
              {project.mentor_title && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.mentor_title}</p>}
            </div>
          )}

          {project.gallery?.length > 0 && (
            <div className="page-card p-4">
              <h6 className="font-bold text-sm mb-3">Gallery</h6>
              <div className="grid grid-cols-2 gap-2">
                {project.gallery.map((img, i) => (
                  <img key={i} src={img} alt="" className="rounded-lg w-full h-24 object-cover"
                    onError={e => { e.target.style.display = 'none' }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
