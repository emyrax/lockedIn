import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '../../lib/api';
import { useAuth } from '../../stores/auth';
import PageShell from '../../components/layout/PageShell';

gsap.registerPlugin(ScrollTrigger);

const statusColors = {
  draft: { bg: '#e0e0e0', text: '#666', label: 'Draft' },
  pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
  nomination: { bg: '#dbeafe', text: '#1e40af', label: 'Nomination' },
  voting: { bg: '#d1fae5', text: '#065f46', label: 'Voting' },
  completed: { bg: '#ede9fe', text: '#5b21b6', label: 'Completed' },
  cancelled: { bg: '#fce4ec', text: '#c62828', label: 'Cancelled' },
};

export default function Elections() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const gridRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['elections'],
    queryFn: () => api.listElections(),
  });

  const elections = data?.elections || [];
  const isAdmin = user && ['electo', 'super_admin'].includes(user.role);
  const filtered = filter === 'all' ? elections : elections.filter(e => e.status === filter);

  const filters = ['all', 'nomination', 'voting', 'completed'];

  useEffect(() => {
    if (!gridRef.current || isLoading) return;
    const ctx = gsap.context(() => {
      const cards = gridRef.current.querySelectorAll('.election-card');
      gsap.set(cards, { opacity: 0, scale: 0.5, rotateY: 15 });
      ScrollTrigger.create({
        trigger: gridRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1, scale: 1, rotateY: 0,
            duration: 0.7, stagger: 0.08,
            ease: 'elastic.out(1, 0.5)',
          });
        },
        once: true,
      });
    });
    return () => ctx.revert();
  }, [isLoading, filtered]);

  return (
    <PageShell
      title="Elections"
      subtitle="NUESA UNN Election Portal"
      adminLink={isAdmin ? '/admin/elections' : null}
      adminLabel="Manage Elections"
      toolIndex={0}
    >
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`btn-nuesa text-xs !py-1.5 !px-4 ${filter === s ? 'btn-gold' : 'btn-ghost'}`}
          >
            {s === 'all' ? 'All Elections' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--gold)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-vote-yea" />
          <p className="mt-3">No elections found.</p>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(election => {
            const sc = statusColors[election.status] || statusColors.draft;
            return (
              <div key={election.id} className="election-card">
                <Link to={`/elections/${election.id}`} className="block group">
                  <div className="card-nuesa p-5 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {sc.label}
                      </span>
                      {election.position_count && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {election.position_count} positions
                        </span>
                      )}
                    </div>

                    <h6 className="font-bold text-sm mb-1.5 group-hover:text-[var(--emerald)] transition-colors">
                      {election.title}
                    </h6>

                    {election.description && (
                      <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                        {election.description}
                      </p>
                    )}

                    {election.candidate_count > 0 && (
                      <div className="mt-auto pt-3 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <i className="fas fa-users" style={{ color: 'var(--gold)' }} />
                        {election.candidate_count} candidate{election.candidate_count !== 1 ? 's' : ''}
                      </div>
                    )}

                    <div className="mt-3">
                      <span className="text-xs font-medium inline-flex items-center gap-1" style={{ color: 'var(--emerald)' }}>
                        View Details <i className="fas fa-arrow-right text-[10px]" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
