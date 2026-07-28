import { Link } from 'react-router-dom';

const categoryColors = {
  research: 'var(--emerald)',
  startup: 'var(--gold)',
  capstone: '#2563eb',
  hackathon: '#7c3aed',
  innovation: '#dc2626',
};

const fallbackImg = 'https://via.placeholder.com/400x250/e2e8f0/64748b?text=Project';

export default function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} className="block group">
      <div className="card-nuesa h-full overflow-hidden">
        <div className="relative h-44 overflow-hidden">
          <img
            src={project.cover_image || fallbackImg}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.src = fallbackImg; }}
          />
          {project.status === 'featured' && (
            <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--gold)' }}>
              <i className="fas fa-star me-1" />Featured
            </span>
          )}
          {project.category && (
            <span className="absolute bottom-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ background: categoryColors[project.category] || '#6b7280' }}>
              {project.category}
            </span>
          )}
        </div>

        <div className="p-4">
          <h6 className="font-bold text-sm mb-1 leading-snug group-hover:text-[var(--emerald)] transition-colors" style={{ color: 'var(--text)' }}>{project.title}</h6>

          {project.tagline && (
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{project.tagline}</p>
          )}

          <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: project.status === 'featured' ? 'var(--gold)' : project.status === 'approved' ? 'var(--emerald)' : '#9ca3af' }} />
              {project.profiles?.full_name || 'Anonymous'}
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              {project.tech_stack?.length > 0 && (
                <span><i className="fas fa-code me-0.5" style={{ color: 'var(--emerald)' }} />{project.tech_stack[0]}{project.tech_stack.length > 1 && ` +${project.tech_stack.length - 1}`}</span>
              )}
              <span><i className="fas fa-heart me-0.5" style={{ color: '#ef4444' }} />{project.upvote_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
