import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '../../lib/api';
import { useAuth } from '../../stores/auth';
import ProjectCard from './ProjectCard';
import PageShell from '../../components/layout/PageShell';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  { value: '', label: 'All Projects' },
  { value: 'research', label: 'Research' },
  { value: 'startup', label: 'Startup' },
  { value: 'capstone', label: 'Capstone' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'innovation', label: 'Innovation' },
];

export default function Projects() {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const gridRef = useRef(null);

  const { data: featured } = useQuery({
    queryKey: ['projects-featured'],
    queryFn: () => api.get('/projects/featured'),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['projects', category, search],
    queryFn: () => api.get(`/projects?${new URLSearchParams({ category, search, limit: 30 })}`),
  });

  const projects = data?.projects || [];

  useEffect(() => {
    if (!gridRef.current || isLoading) return;
    const ctx = gsap.context(() => {
      const cards = gridRef.current.querySelectorAll('.project-card');
      gsap.set(cards, { opacity: 0, scale: 0.6, rotateY: 10 });
      ScrollTrigger.create({
        trigger: gridRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1, scale: 1, rotateY: 0,
            duration: 0.7, stagger: 0.06,
            ease: 'back.out(1.7)',
          });
        },
        once: true,
      });
    });
    return () => ctx.revert();
  }, [isLoading, projects.length]);

  return (
    <PageShell
      title="Projects"
      subtitle="Showcasing innovation from UNN Engineering students and alumni"
      adminLink={user ? '/projects/submit' : null}
      adminLabel={<><i className="fas fa-plus" />Submit Project</>}
      toolIndex={5}
    >
      {featured?.length > 0 && (
        <div className="mb-8">
          <h5 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
            <i className="fas fa-star" />Featured Projects
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featured.slice(0, 3).map(p => (
              <div key={p.id}><ProjectCard project={p} /></div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`btn-nuesa text-xs !py-1.5 !px-3.5 ${category === cat.value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <input
            className="form-input text-xs !py-1.5 !px-3"
            style={{ width: 200 }}
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--gold)' }} /></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-lightbulb" />
          <p className="mt-3">No projects found. {user ? 'Be the first to submit!' : ''}</p>
          {!user && <Link to="/register" className="btn-nuesa btn-outline text-sm mt-3">Join to Submit</Link>}
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(p => (
            <div key={p.id} className="project-card"><ProjectCard project={p} /></div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
