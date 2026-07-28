import { useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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

export default function ElectionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const candidatesRef = useRef(null);

  const { data: election, isLoading } = useQuery({
    queryKey: ['election', id],
    queryFn: () => api.getElection(id),
  });

  useEffect(() => {
    if (!candidatesRef.current || !election?.positions?.length) return;
    const ctx = gsap.context(() => {
      const cards = candidatesRef.current.querySelectorAll('.candidate-card');
      gsap.set(cards, { opacity: 0, scale: 0.5, rotation: gsap.utils.random(-3, 3) });
      ScrollTrigger.create({
        trigger: candidatesRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1, scale: 1, rotation: 0,
            duration: 0.6, stagger: 0.05, ease: 'back.out(1.7)',
          });
        },
        once: true,
      });
    });
    return () => ctx.revert();
  }, [election]);

  if (isLoading) return <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--gold)' }} /></div>;
  if (!election) return <PageShell title="Not Found"><p style={{ color: 'var(--text-muted)' }}>Election not found.</p></PageShell>;

  const sc = statusColors[election.status] || { bg: '#eee', text: '#666', label: election.status };
  const isVoter = user && ['student', 'alumnus'].includes(user.role);
  const isAdmin = user && ['electo', 'super_admin'].includes(user.role);
  const canVote = election.status === 'voting' && isVoter;
  const canApply = election.status === 'nomination' && isVoter;

  return (
    <PageShell title={election.title} subtitle="Election Details" toolIndex={7}>
      <Link to="/elections" className="inline-flex items-center gap-1.5 text-sm font-medium mb-4 transition-colors" style={{ color: 'var(--emerald)' }}>
        <i className="fas fa-arrow-left text-xs" /> All Elections
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: sc.bg, color: sc.text, textTransform: 'capitalize' }}>
            {sc.label}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{election.election_type}</span>
        </div>
        {isAdmin && (
          <Link to={`/admin/elections/${election.id}`} className="btn-nuesa btn-primary text-xs">
            <i className="fas fa-cog" /> Admin Panel
          </Link>
        )}
      </div>

      {election.description && (
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>{election.description}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Type', value: election.election_type },
          { label: 'Nomination', value: `${new Date(election.nomination_start).toLocaleDateString()} - ${new Date(election.nomination_end).toLocaleDateString()}` },
          { label: 'Voting', value: `${new Date(election.voting_start).toLocaleDateString()} - ${new Date(election.voting_end).toLocaleDateString()}` },
          { label: 'Results', value: election.results_published ? 'Published' : 'Pending' },
        ].map((info, i) => (
          <div key={i} className="page-card p-3">
            <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--gold)' }}>{info.label}</div>
            <div className="text-xs" style={{ color: 'var(--text)' }}>{info.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {canApply && (
          <Link to={`/elections/${id}/apply`} className="btn-nuesa btn-primary text-sm">
            <i className="fas fa-user-plus" /> Apply as Candidate
          </Link>
        )}
        {canVote && (
          <Link to={`/elections/${id}/vote`} className="btn-nuesa btn-gold text-sm">
            <i className="fas fa-check-circle" /> Cast Your Vote
          </Link>
        )}
        {(election.status === 'voting' || election.status === 'completed') && election.results_published && (
          <>
            <button onClick={() => navigate(`/elections/${id}/verify`)} className="btn-nuesa btn-outline text-sm">
              <i className="fas fa-shield-alt" /> Verify Vote
            </button>
            <button onClick={() => navigate(`/elections/${id}`)} className="btn-nuesa btn-ghost text-sm">
              <i className="fas fa-chart-bar" /> View Results
            </button>
          </>
        )}
      </div>

      <h3 className="font-heading font-bold text-lg mb-5" style={{ color: 'var(--emerald)' }}>Positions & Candidates</h3>

      {(!election.positions || election.positions.length === 0) ? (
        <div className="empty-state">
          <i className="fas fa-users" />
          <p className="mt-2">No positions have been set up yet.</p>
        </div>
      ) : (
        <div ref={candidatesRef} className="space-y-5">
          {election.positions.map(pos => (
            <div key={pos.id} className="page-card p-5">
              <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{pos.title}</h4>
              {pos.description && <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{pos.description}</p>}

              {(!pos.candidates || pos.candidates.length === 0) ? (
                <p className="text-xs" style={{ color: 'var(--text-light)' }}>No candidates for this position</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pos.candidates.map(cand => (
                    <div key={cand.id} className="candidate-card card-nuesa p-3 flex items-start gap-3" style={{ cursor: 'default' }}>
                      <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: 'var(--emerald-light)', color: 'var(--emerald-dark)' }}>
                        {cand.photo_url ? (
                          <img src={cand.photo_url} alt="" className="w-full h-full rounded-full object-cover"
                            onError={e => { e.target.style.display = 'none'; e.target.parentElement.textContent = cand.profiles?.full_name?.[0] || '?' }} />
                        ) : (cand.profiles?.full_name?.[0] || '?')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{cand.profiles?.full_name || 'Unknown'}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {cand.profiles?.department}{cand.profiles?.level && ` • ${cand.profiles.level}`}
                        </div>
                        {cand.manifesto && (
                          <details className="mt-2">
                            <summary className="text-xs font-medium cursor-pointer" style={{ color: 'var(--emerald)' }}>View Manifesto</summary>
                            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{cand.manifesto}</p>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
