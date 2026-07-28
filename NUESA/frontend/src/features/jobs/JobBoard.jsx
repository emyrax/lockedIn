import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';
import PageShell from '../../components/layout/PageShell';

export default function JobBoard() {
  const [search, setSearch] = useState('');
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.get('/jobs'),
  });

  const allJobs = jobs || [];
  const filtered = search
    ? allJobs.filter(j => j.title?.toLowerCase().includes(search.toLowerCase()) || j.company?.toLowerCase().includes(search.toLowerCase()))
    : allJobs;

  return (
    <PageShell title="Job Board" subtitle="Find opportunities from our industry partners and alumni network" toolIndex={5}>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          className="form-input text-xs flex-1 min-w-[200px]"
          placeholder="Search jobs by title or company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--gold)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-briefcase" />
          <p className="mt-3">No jobs found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
            >
              <Link to={`/jobs/${job.id}`} className="block group">
                <div className="card-nuesa p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h6 className="font-bold text-sm mb-0.5 group-hover:text-[var(--emerald)] transition-colors">{job.title}</h6>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-building" style={{ color: 'var(--emerald)' }} />{job.company}
                        </span>
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-map-marker-alt" style={{ color: 'var(--gold)' }} />{job.location}
                          </span>
                        )}
                        {job.job_type && (
                          <span className="badge-nuesa">{job.job_type}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs flex-shrink-0" style={{ color: 'var(--text-light)' }}>
                      {job.created_at && <span>{new Date(job.created_at).toLocaleDateString()}</span>}
                      <i className="fas fa-chevron-right" style={{ color: 'var(--emerald)', fontSize: 10 }} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
