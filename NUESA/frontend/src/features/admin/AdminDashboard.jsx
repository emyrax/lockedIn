import { useAuth } from '../../stores/auth';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import SectionManager from './SectionManager';
import AdminProjects from './AdminProjects';
import AdminElections from '../elections/AdminElections';
import AdminElectionDetail from '../elections/AdminElectionDetail';
import AdminAlumni from '../alumni/AdminAlumni';
import AdminJobs from '../jobs/AdminJobs';
import AdminNewsEvents from './AdminNewsEvents';

const navItems = [
  { icon: 'fa-chart-simple', label: 'Overview', path: '/admin' },
  { icon: 'fa-file-lines', label: 'Sections', path: '/admin/sections' },
  { icon: 'fa-users', label: 'Users', path: '/admin/users' },
  { icon: 'fa-lightbulb', label: 'Projects', path: '/admin/projects' },
  { icon: 'fa-vote-yea', label: 'Elections', path: '/admin/elections' },
  { icon: 'fa-newspaper', label: 'News & Events', path: '/admin/news' },
  { icon: 'fa-graduation-cap', label: 'Alumni', path: '/admin/alumni' },
  { icon: 'fa-briefcase', label: 'Jobs', path: '/admin/jobs' },
  { icon: 'fa-clipboard-list', label: 'Audit Log', path: '/admin/audit' },
  { icon: 'fa-gear', label: 'Settings', path: '/admin/settings' },
];

function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="d-flex flex-column" style={{ width: 240, minHeight: 'calc(100vh - 76px)', borderRight: '1px solid #e0e0e0' }}>
      <div className="p-3" style={{ borderBottom: '1px solid #e0e0e0' }}>
        <h6 className="fw-bold mb-1" style={{ color: 'var(--green)' }}>Admin Panel</h6>
        <small className="text-muted text-capitalize">{user?.role?.replace('_', ' ')}</small>
      </div>
      <nav className="flex-grow-1 p-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className="d-flex align-items-center gap-2 px-3 py-2 rounded text-decoration-none mb-1"
              style={{
                background: isActive ? 'var(--green)' : 'transparent',
                color: isActive ? 'white' : 'var(--text)',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-alt)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <i className={`fas ${item.icon}`} style={{ width: 20, textAlign: 'center' }} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Overview() {
  const { user } = useAuth();
  return (
    <div>
      <h4 className="fw-bold mb-4" style={{ color: 'var(--green)' }}>Dashboard Overview</h4>
      <div className="row g-4">
        {[
          { icon: 'fa-users', label: 'Total Users', value: '-', color: 'var(--orange)' },
          { icon: 'fa-clock', label: 'Pending Approvals', value: '-', color: 'var(--green)' },
          { icon: 'fa-vote-yea', label: 'Active Elections', value: '-', color: 'var(--orange)' },
          { icon: 'fa-file-lines', label: 'Sections Live', value: '8', color: 'var(--green)' },
        ].map((card, i) => (
          <div className="col-md-3" key={i}>
            <div className="page-card p-3">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted small mb-1">{card.label}</p>
                  <h3 className="fw-bold mb-0" style={{ color: card.color }}>{card.value}</h3>
                </div>
                <i className={`fas ${card.icon}`} style={{ fontSize: 32, color: card.color, opacity: 0.5 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4" style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 76px)' }}>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="sections/*" element={<SectionManager />} />
          <Route path="users" element={<div className="text-muted p-5 text-center">User Manager — Coming in Phase 2</div>} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="elections" element={<AdminElections />} />
          <Route path="elections/:id" element={<AdminElectionDetail />} />
          <Route path="news" element={<AdminNewsEvents />} />
          <Route path="alumni" element={<AdminAlumni />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="audit" element={<div className="text-muted p-5 text-center">Audit Log — Coming in Phase 5</div>} />
          <Route path="settings" element={<div className="text-muted p-5 text-center">Settings — Coming in Phase 5</div>} />
        </Routes>
      </div>
    </div>
  );
}