import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';
import PageShell from '../../components/layout/PageShell';

export default function News() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data: news, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: () => api.get('/news'),
  });

  const allNews = news || [];
  const categories = [...new Set(allNews.map(n => n.category).filter(Boolean))];

  const filtered = allNews.filter(n => {
    const matchSearch = !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || n.category === category;
    return matchSearch && matchCat;
  });

  return (
    <PageShell title="News & Updates" subtitle="Latest from the Faculty of Engineering, UNN" toolIndex={6}>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          className="form-input text-xs flex-1 min-w-[200px]"
          placeholder="Search news..."
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
          <i className="fas fa-newspaper" />
          <p className="mt-3">No news articles found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/news/${article.slug}`} className="block group">
                <div className="card-nuesa h-full overflow-hidden">
                  <div className="relative h-44 overflow-hidden" style={{ background: 'var(--bg-alt)' }}>
                    <img
                      src={article.image || article.cover_image || `https://via.placeholder.com/400x250/e2e8f0/64748b?text=News`}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={e => { e.target.src = `https://via.placeholder.com/400x250/e2e8f0/64748b?text=News`; }}
                    />
                    {article.featured && (
                      <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--gold)' }}>
                        <i className="fas fa-star me-1" />Featured
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      {article.category && <span className="badge-nuesa">{article.category}</span>}
                      {article.created_at && (
                        <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h6 className="font-bold text-sm mb-1 group-hover:text-[var(--emerald)] transition-colors">{article.title}</h6>
                    {article.excerpt && (
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>{article.excerpt}</p>
                    )}
                    <div className="mt-3 text-xs font-medium inline-flex items-center gap-1" style={{ color: 'var(--emerald)' }}>
                      Read More <i className="fas fa-arrow-right text-[10px]" />
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
