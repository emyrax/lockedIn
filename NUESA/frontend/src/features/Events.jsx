import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import PageShell from '../components/layout/PageShell';

export default function Events() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => api.get('/events'),
  });

  const allEvents = events || [];
  const categories = [...new Set(allEvents.map(e => e.category).filter(Boolean))];

  const filtered = allEvents.filter(e => {
    const matchSearch = !search || e.title?.toLowerCase().includes(search.toLowerCase()) || e.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || e.category === category;
    return matchSearch && matchCat;
  });

  const featured = filtered.filter(e => e.featured || e.is_featured);
  const upcoming = filtered.filter(e => !featured.includes(e));

  return (
    <PageShell title="Events" subtitle="Stay connected with the NUESA UNN community" toolIndex={8}>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          className="form-input text-xs flex-1 min-w-[200px]"
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="form-select text-xs w-auto" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="loading-state"><div className="spinner-border" style={{ color: 'var(--gold)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-calendar-times" />
          <p className="mt-3">No events found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {featured.length > 0 && (
            <div>
              <h5 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
                <i className="fas fa-star" />Featured Events
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.slice(0, 3).map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div>
            {featured.length > 0 && <h5 className="font-bold text-sm mb-4" style={{ color: 'var(--text-muted)' }}>All Events</h5>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcoming.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function EventCard({ event }) {
  const date = event.date ? new Date(event.date) : null;

  return (
    <Link to={`/events/${event.id}`} className="block group">
      <div className="card-nuesa h-full overflow-hidden">
        <div className="relative h-44 overflow-hidden" style={{ background: 'var(--bg-alt)' }}>
          <img
            src={event.image || event.cover_image || `https://via.placeholder.com/400x250/e2e8f0/64748b?text=${encodeURIComponent(event.title?.slice(0, 20) || 'Event')}`}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { e.target.src = `https://via.placeholder.com/400x250/e2e8f0/64748b?text=Event`; }}
          />
          {event.featured && (
            <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--gold)', color: 'white' }}>
              <i className="fas fa-star me-1" />Featured
            </span>
          )}
          {date && (
            <div className="absolute bottom-2 left-2 text-center px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.95)' }}>
              <div className="font-bold text-xs" style={{ color: 'var(--emerald)' }}>{date.toLocaleDateString('en-US', { month: 'short' })}</div>
              <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>{date.getDate()}</div>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1.5">
            {event.category && <span className="badge-nuesa">{event.category}</span>}
            {event.type && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{event.type}</span>}
          </div>
          <h6 className="font-bold text-sm mb-1 group-hover:text-[var(--emerald)] transition-colors">{event.title}</h6>
          {event.description && (
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>{event.description}</p>
          )}
          {event.location && (
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--text-light)' }}>
              <i className="fas fa-map-marker-alt" style={{ color: 'var(--emerald)' }} />{event.location}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
