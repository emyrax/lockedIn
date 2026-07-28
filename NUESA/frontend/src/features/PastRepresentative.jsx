import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import PageShell from '../components/layout/PageShell';

const pastReps = [
  { name: 'Engr. John Okafor', title: 'NUESA President', session: '2022/23', dept: 'Civil Engineering', email: 'john.okafor@unn.edu.ng', image: '' },
  { name: 'Engr. Amaka Nwosu', title: 'NUESA President', session: '2021/22', dept: 'Electrical Engineering', email: 'amaka.nwosu@unn.edu.ng', image: '' },
  { name: 'Engr. Bello Yusuf', title: 'NUESA President', session: '2020/21', dept: 'Mechanical Engineering', email: 'bello.yusuf@unn.edu.ng', image: '' },
  { name: 'Engr. Chidi Okafor', title: 'Vice President', session: '2022/23', dept: 'Electronic Engineering', email: 'chidi.okafor@unn.edu.ng', image: '' },
  { name: 'Engr. Fatima Mohammed', title: 'Secretary General', session: '2021/22', dept: 'Mechatronics Engineering', email: 'fatima.mohammed@unn.edu.ng', image: '' },
  { name: 'Engr. Emeka Nwankwo', title: 'NUESA President', session: '2019/20', dept: 'Civil Engineering', email: 'emeka.nwankwo@unn.edu.ng', image: '' },
  { name: 'Engr. Yetunde Balogun', title: 'Vice President', session: '2020/21', dept: 'Biomedical Engineering', email: 'yetunde.balogun@unn.edu.ng', image: '' },
  { name: 'Engr. Ifeanyi Okeke', title: 'Secretary General', session: '2019/20', dept: 'Agricultural Engineering', email: 'ifeanyi.okeke@unn.edu.ng', image: '' },
  { name: 'Engr. Ngozi Eze', title: 'NUESA President', session: '2018/19', dept: 'Electrical Engineering', email: 'ngozi.eze@unn.edu.ng', image: '' },
  { name: 'Engr. Tunde Adeyemi', title: 'NUESA President', session: '2017/18', dept: 'Mechanical Engineering', email: 'tunde.adeyemi@unn.edu.ng', image: '' },
  { name: 'Engr. Chinwe Umeh', title: 'Vice President', session: '2018/19', dept: 'Electronic Engineering', email: 'chinwe.umeh@unn.edu.ng', image: '' },
  { name: 'Engr. Musa Idris', title: 'Secretary General', session: '2017/18', dept: 'Metallurgical Engineering', email: 'musa.idris@unn.edu.ng', image: '' },
];

const depts = [...new Set(pastReps.map(r => r.dept))].sort();
const sessions = [...new Set(pastReps.map(r => r.session))].sort().reverse();
const titles = [...new Set(pastReps.map(r => r.title))];

const initials = (name) => name.split(' ').filter(w => w.length > 1).map(w => w[0]).join('').slice(0, 2).toUpperCase();

export default function PastRepresentative() {
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [filterTitle, setFilterTitle] = useState('');

  const filtered = useMemo(() => {
    return pastReps.filter(r => {
      const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.dept.toLowerCase().includes(search.toLowerCase());
      const matchDept = !filterDept || r.dept === filterDept;
      const matchSession = !filterSession || r.session === filterSession;
      const matchTitle = !filterTitle || r.title === filterTitle;
      return matchSearch && matchDept && matchSession && matchTitle;
    });
  }, [search, filterDept, filterSession, filterTitle]);

  const clearFilters = () => {
    setSearch('');
    setFilterDept('');
    setFilterSession('');
    setFilterTitle('');
  };

  const hasFilters = search || filterDept || filterSession || filterTitle;

  return (
    <PageShell title="Past NUESA Representatives" subtitle="Former leaders of the Faculty of Engineering, UNN" toolIndex={7}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }} />
            <input className="form-input !pl-8 text-xs" placeholder="Search by name or department..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select text-xs w-auto" value={filterTitle} onChange={e => setFilterTitle(e.target.value)}>
            <option value="">All Positions</option>
            {titles.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="form-select text-xs w-auto" value={filterSession} onChange={e => setFilterSession(e.target.value)}>
            <option value="">All Sessions</option>
            {sessions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select text-xs w-auto" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Depts</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-nuesa btn-ghost text-xs !py-2 !px-3">
              <i className="fas fa-times me-1" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        {filtered.length} of {pastReps.length} representatives
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-users-slash" />
          <p className="mt-3">No representatives match your filters.</p>
          <button onClick={clearFilters} className="btn-nuesa btn-outline text-xs mt-3">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((person, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="card-nuesa text-center p-4 lg:p-5 group"
              style={{ cursor: 'default' }}
            >
              <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center font-bold text-white mb-3 transition-transform duration-300 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, var(--emerald), var(--gold))' }}>
                {initials(person.name)}
              </div>
              <h6 className="font-bold text-sm mb-0.5">{person.name}</h6>
              <p className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>{person.title}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{person.dept}</p>
              <div className="flex items-center justify-center gap-3 mt-2 text-[10px]" style={{ color: 'var(--text-light)' }}>
                <span className="flex items-center gap-1"><i className="fas fa-calendar" style={{ color: 'var(--emerald)' }} />{person.session}</span>
                {person.email && (
                  <a href={`mailto:${person.email}`} className="flex items-center gap-1 hover:text-[var(--gold)] transition-colors no-underline" style={{ color: 'var(--text-light)' }}>
                    <i className="fas fa-envelope" style={{ color: 'var(--emerald)' }} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
