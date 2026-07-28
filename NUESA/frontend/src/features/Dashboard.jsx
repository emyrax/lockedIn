import { useAuth } from '../stores/auth';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const quickActions = [
  { icon: 'fa-lightbulb', label: 'Submit Project', to: '/projects/submit', color: 'var(--gold)' },
  { icon: 'fa-vote-yea', label: 'Vote in Elections', to: '/elections', color: 'var(--emerald)' },
  { icon: 'fa-calendar', label: 'Upcoming Events', to: '/events', color: 'var(--gold)' },
  { icon: 'fa-user-graduate', label: 'Alumni Directory', to: '/alumni', color: 'var(--emerald)' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 lg:p-5 mb-6 text-white"
          style={{ background: 'linear-gradient(135deg, var(--gold), #f59e0b)', borderRadius: 20 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 700,
              }}
            >
              {user?.full_name?.charAt(0) || 'U'}
            </motion.div>
            <div>
              <h4 className="font-bold text-base mb-0.5">Welcome, {user?.full_name?.split(' ')[0]}</h4>
              <p className="mb-0 text-xs opacity-90">
                {user?.department} &bull; Level {user?.current_level}
                {user?.role === 'alumnus' && ` &bull; Alumni ${user?.graduation_year}`}
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ms-2 ${user?.status === 'active' ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'}`}>
                  {user?.status}
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h5 className="font-bold text-sm mb-3" style={{ color: 'var(--emerald)' }}>Quick Actions</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                >
                  <Link to={action.to} className="block no-underline">
                    <div className="card-nuesa p-4 text-center">
                      <i className={`fas ${action.icon}`} style={{ fontSize: 32, color: action.color }} />
                      <p className="text-xs font-semibold mt-2 mb-0" style={{ color: 'var(--text)' }}>{action.label}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-bold text-sm mb-3" style={{ color: 'var(--gold)' }}>Profile</h5>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="page-card p-3"
            >
              <div className="flex justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Matric</span>
                <span className="text-xs font-semibold">{user?.matric_number}</span>
              </div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Email</span>
                <span className="text-xs font-semibold">{user?.email}</span>
              </div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Role</span>
                <span className="text-xs font-semibold capitalize">{user?.role}</span>
              </div>
              <Link to="/profile" className="btn-nuesa btn-outline w-full justify-center text-xs mt-2 !py-2">Edit Profile</Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
