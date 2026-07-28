import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function AlumniList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const industry = searchParams.get('industry') || '';
  const [input, setInput] = useState(search);

  const { data, isLoading } = useQuery({
    queryKey: ['alumni', search, industry],
    queryFn: () => api.listAlumni({ search, industry }),
  });

  const alumni = data?.alumni || [];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="page-header"
      >
        <h1>Alumni <span style={{ color: 'var(--green)' }}>Directory</span></h1>
        <p className="text-muted">Connect with distinguished alumni from the Faculty of Engineering</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="d-flex gap-2 mb-4"
      >
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setSearchParams(s => { s.set('search', input); return s; })}
          placeholder="Search by name, company, or position..."
          className="form-control" style={{ maxWidth: 400 }} />
        <button onClick={() => setSearchParams(s => { s.set('search', input); return s; })}
          className="btn-nuesa btn-green">
          Search
        </button>
      </motion.div>

      {isLoading ? (
        <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--green)' }} /></div>
      ) : alumni.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-user-graduate" />
          <p>No alumni found matching your criteria.</p>
        </div>
      ) : (
        <motion.div
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="row g-3"
        >
          {alumni.map((a, i) => (
            <motion.div key={a.id} className="col-md-6 col-lg-4" {...staggerItem} transition={{ duration: 0.5, delay: i * 0.03 }}>
              <Link to={`/alumni/${a.user_id}`} className="text-decoration-none">
                <div className="card-nuesa d-flex gap-3 p-3">
                  <div className="flex-shrink-0" style={{
                    width: 56, height: 56, borderRadius: '50%', overflow: 'hidden',
                    border: '2px solid var(--green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 20, color: 'var(--text-muted)', background: 'var(--bg-alt)',
                  }}>
                    {a.profiles?.avatar_url ? (
                      <img src={a.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; e.target.parentElement.textContent = a.profiles?.full_name?.[0] || '?'; }} />
                    ) : (a.profiles?.full_name?.[0] || '?')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="fw-bold" style={{ color: 'var(--text)' }}>{a.profiles?.full_name || 'Unknown'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{a.current_position}{a.current_position && a.current_company ? ' at ' : ''}{a.current_company}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', opacity: 0.7, marginTop: 4 }}>
                      {a.graduation_year} • {a.industry || 'N/A'}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}