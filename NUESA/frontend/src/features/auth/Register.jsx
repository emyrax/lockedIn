import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../stores/auth';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const DEPARTMENTS = [
  { code: 'ABE', name: 'Agricultural & Bioresources Engineering' },
  { code: 'CVE', name: 'Civil Engineering' },
  { code: 'EEE', name: 'Electrical Engineering' },
  { code: 'ELE', name: 'Electronic Engineering' },
  { code: 'MCE', name: 'Mechanical Engineering' },
  { code: 'MME', name: 'Metallurgical & Materials Engineering' },
  { code: 'MTE', name: 'Mechatronics Engineering' },
  { code: 'BME', name: 'Biomedical Engineering' },
  { code: 'PEE', name: 'Polymer & Textile Engineering' },
  { code: 'FWT', name: 'Forestry & Wood Technology' },
];

const LEVELS = ['100', '200', '300', '400', '500', 'PG'];

export default function Register() {
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('register');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    matric_number: '',
    full_name: '',
    department: '',
    level: '',
    phone: '',
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('OTP sent to your UNN email');
      setStep('otp');
      setTimeout(() => document.getElementById('reg-otp-0')?.focus(), 100);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp({ matric_number: form.matric_number, otp: otp.join('') });
      toast.success('Account created! Awaiting admin approval.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i, val) => {
    if (val.length > 1) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) document.getElementById(`reg-otp-${i + 1}`)?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`reg-otp-${i - 1}`)?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 70% 30%, #059669 2px, transparent 2px), radial-gradient(circle at 30% 70%, #D97706 1px, transparent 1px)',
          backgroundSize: '60px 60px, 40px 40px',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(5,150,105,0.08) 0%, transparent 60%)',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl mx-4 relative"
      >
        <div className="glass-card-dark p-6 lg:p-8 relative overflow-hidden group transition-all duration-300"
          style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(5,150,105,0.08), 0 0 40px rgba(5,150,105,0.05)' }}>
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, var(--emerald), var(--gold), transparent)' }} />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 150, delay: 0.15 }}
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(217,119,6,0.1))', border: '2px solid rgba(5,150,105,0.15)' }}
          >
            <img src="/images/logo.png" alt="NUESA" className="h-10 w-auto brightness-0 invert opacity-90" onError={e => { e.target.style.display = 'none' }} />
          </motion.div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase mb-3" style={{ background: 'rgba(5,150,105,0.1)', color: '#34d399' }}>
            Student Portal — Registration
          </span>

          <div className="flex items-center justify-center gap-2 mb-5">
            {['Details', 'Verify'].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300"
                  style={{ background: step === 'register' && i === 0 ? 'var(--gold)' : step === 'otp' && i === 0 ? 'var(--emerald)' : i < 1 ? 'var(--emerald)' : 'rgba(255,255,255,0.06)', color: i <= 0 ? 'white' : 'rgba(255,255,255,0.3)' }}>
                  {i === 0 && step === 'otp' ? <i className="fas fa-check text-[10px]" /> : i + 1}
                </div>
                <span className="text-[11px] font-medium" style={{ color: i <= 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}>{s}</span>
                {i === 0 && <div className="w-6 h-px" style={{ background: step === 'otp' ? 'var(--emerald)' : 'rgba(255,255,255,0.06)' }} />}
              </div>
            ))}
          </div>

          {step === 'register' ? (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleRegister}
              className="text-start"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="auth-label">Full Name</label>
                  <div className="relative">
                    <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }} />
                    <input className="auth-input" placeholder="e.g. Okonkwo Emmanuel" value={form.full_name} onChange={handleChange('full_name')} required />
                  </div>
                </div>
                <div>
                  <label className="auth-label">Matric Number</label>
                  <div className="relative">
                    <i className="fas fa-id-card absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }} />
                    <input className="auth-input" placeholder="e.g. 2024/123456" value={form.matric_number} onChange={handleChange('matric_number')} required />
                  </div>
                </div>
                <div>
                  <label className="auth-label">Level</label>
                  <select className="auth-select" value={form.level} onChange={handleChange('level')} required>
                    <option value="">Select level</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="auth-label">Department</label>
                  <select className="auth-select" value={form.department} onChange={handleChange('department')} required>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="auth-label">Phone Number</label>
                  <div className="relative">
                    <i className="fas fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }} />
                    <input className="auth-input" placeholder="e.g. 08012345678" value={form.phone} onChange={handleChange('phone')} />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-nuesa w-full justify-center text-sm !py-3 font-semibold mt-5"
                type="submit" disabled={loading}
                style={{ background: 'linear-gradient(135deg, var(--emerald), #10B981)', color: 'white', boxShadow: '0 4px 16px rgba(5,150,105,0.25)' }}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="fas fa-user-plus me-2" />}
                Create Account
              </motion.button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} /></div>
                <div className="relative flex justify-center"><span className="text-[10px] px-3" style={{ background: 'rgba(15,23,42,0.85)', color: 'rgba(255,255,255,0.25)' }}>Already registered?</span></div>
              </div>

              <Link to="/login" className="btn-nuesa w-full justify-center text-xs !py-2.5 font-semibold" style={{ background: 'transparent', color: 'var(--gold)', border: '1px solid rgba(217,119,6,0.3)' }}>
                <i className="fas fa-arrow-left me-1.5" /> Sign In
              </Link>
            </motion.form>
          ) : (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleVerify}
              className="mt-2 space-y-5"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="relative inline-flex mb-3"
                >
                  <i className="fas fa-envelope-open-text" style={{ fontSize: 48, color: 'var(--gold)' }} />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: '2px solid rgba(217,119,6,0.2)' }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Enter the 6-digit code sent to <span className="font-semibold text-white/60">your UNN email</span></p>
              </div>

              <div className="flex items-center justify-center gap-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`reg-otp-${i}`}
                    className="digit-slot"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-nuesa w-full justify-center text-sm !py-3 font-semibold"
                type="submit" disabled={loading || otp.join('').length !== 6}
                style={{ background: 'linear-gradient(135deg, var(--gold), #f59e0b)', color: 'white', boxShadow: '0 4px 16px rgba(217,119,6,0.25)' }}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="fas fa-check-circle me-2" />}
                Verify & Complete
              </motion.button>

              <button type="button" onClick={() => { setStep('register'); setOtp(['', '', '', '', '', '']) }}
                className="w-full text-center text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <i className="fas fa-arrow-left me-1" /> Back to registration
              </button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
