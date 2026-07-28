import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../stores/auth';
import { motion } from 'framer-motion';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [rsvpCounts, setRsvpCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpResponse, setRsvpResponse] = useState('');

  useEffect(() => {
    api.getNewsEvent(id).then(setItem).catch(() => setItem(null)).finally(() => setLoading(false));
    api.getRsvpCount(id).then(setRsvpCounts).catch(() => {});
  }, [id]);

  async function handleRsvp(response) {
    try {
      await api.rsvpEvent(id, response);
      setRsvpResponse(response);
      const counts = await api.getRsvpCount(id);
      setRsvpCounts(counts);
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="page-container"><div className="loading-state"><div className="spinner-border" style={{ color: 'var(--green)' }} /></div></div>;
  if (!item) return <div className="page-container"><div className="empty-state"><p>Event not found.</p><Link to="/events" className="btn-nuesa btn-outline">Back to Events</Link></div></div>;

  const isPast = item.event_date && new Date(item.event_date) < new Date();

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link to="/events" className="btn-nuesa btn-outline btn-sm mb-3">&larr; Back to Events</Link>

        {item.cover_image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4" style={{ borderRadius: 12, overflow: 'hidden', maxHeight: 400 }}
          >
            <img src={item.cover_image} alt={item.title} className="w-100" style={{ objectFit: 'cover' }} />
          </motion.div>
        )}

        <span className="badge-nuesa mb-2 d-inline-block">{item.category || 'General'}</span>
        {isPast && <span className="badge bg-secondary ms-2">Past Event</span>}

        <h1 className="fw-bold mb-3">{item.title}</h1>

        <div className="d-flex flex-wrap gap-3 text-muted small mb-4">
          {item.event_date && (
            <span>
              <i className="far fa-calendar me-1" />
              {new Date(item.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {item.event_end_date && ` — ${new Date(item.event_end_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
            </span>
          )}
          {item.location && <span><i className="fas fa-map-marker-alt me-1" />{item.location}</span>}
        </div>

        {item.excerpt && <p className="lead" style={{ color: 'var(--text-muted)' }}>{item.excerpt}</p>}

        <div className="page-card p-4 mt-3 mb-4" style={{ lineHeight: 1.8, fontSize: 16, whiteSpace: 'pre-wrap' }}>{item.content}</div>

        {item.rsvp_enabled && !isPast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="page-card p-4"
          >
            <h5 className="fw-bold mb-3" style={{ color: 'var(--green)' }}><i className="fas fa-check-circle me-2" />RSVP</h5>
            {user ? (
              <div className="d-flex gap-2">
                {['yes', 'maybe', 'no'].map(r => (
                  <button
                    key={r}
                    className={`btn-nuesa ${rsvpResponse === r ? 'btn-green' : 'btn-outline'} btn-sm text-capitalize`}
                    onClick={() => handleRsvp(r)}
                  >
                    {r === 'yes' ? 'Attending' : r === 'maybe' ? 'Maybe' : 'Not Attending'}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted small mb-0"><Link to="/login" style={{ color: 'var(--green)' }}>Log in</Link> to RSVP.</p>
            )}
            {rsvpCounts && (
              <div className="mt-3 d-flex gap-3 small text-muted">
                <span><strong style={{ color: 'var(--green)' }}>{rsvpCounts.yes}</strong> Attending</span>
                <span><strong style={{ color: 'var(--orange)' }}>{rsvpCounts.maybe}</strong> Maybe</span>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}