import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';

export default function NewsDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNewsEvent(slug).then(setItem).catch(() => setItem(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="page-container"><div className="loading-state"><div className="spinner-border" style={{ color: 'var(--orange)' }} /></div></div>;
  if (!item) return <div className="page-container"><div className="empty-state"><p>Article not found.</p><Link to="/news" className="btn-nuesa btn-outline">Back to News</Link></div></div>;

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link to="/news" className="btn-nuesa btn-outline btn-sm mb-3">&larr; Back to News</Link>

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
        <h1 className="fw-bold mb-3">{item.title}</h1>

        <div className="d-flex gap-3 text-muted small mb-4">
          <span><i className="far fa-calendar me-1" />{new Date(item.published_at || item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          {item.profiles?.full_name && <span><i className="far fa-user me-1" />{item.profiles.full_name}</span>}
        </div>

        {item.excerpt && <p className="lead" style={{ color: 'var(--text-muted)' }}>{item.excerpt}</p>}

        <div className="page-card p-4 mt-3" style={{ lineHeight: 1.8, fontSize: 16, whiteSpace: 'pre-wrap' }}>{item.content}</div>
      </motion.div>
    </div>
  );
}