import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../stores/auth';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import GearDecoration from '../../components/common/GearDecoration';
import EngineeringToolReveal from '../../components/common/EngineeringToolReveal';

export default function Login() {
  const { login, verify2fa } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [step, setStep] = useState('login');
  const [matric, setMatric] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(matric, password);
      if (result.step === '2fa') {
        setUserId(result.user_id);
        setStep('2fa');
        setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
        toast.success('Verification code sent to your email');
      } else {
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handle2fa = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verify2fa(userId, otp.join(''));
      toast.success('Welcome back!');
      navigate(from, { replace: true });
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
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #030712 0%, #0F172A 50%, #022c22 100%)' }}>
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(circle at 20% 30%, #059669 1px, transparent 1px), radial-gradient(circle at 80% 70%, #D97706 1px, transparent 1px)',
        backgroundSize: '40px 40px, 32px 32px',
      }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 25% 20%, rgba(5,150,105,0.06) 0%, transparent 60%), radial-gradient(ellipse at 75% 80%, rgba(217,119,6,0.05) 0%, transparent 50%)' }} />

      <GearDecoration size="xxl" color="var(--emerald)" className="absolute -top-12 -left-12 opacity-10" />
      <GearDecoration size="xl" color="var(--gold)" className="absolute -bottom-8 -right-8 opacity-10" />
      <GearDecoration size="large" color="var(--emerald)" className="absolute top-1/3 right-4 opacity-8" />
      <GearDecoration size="medium" color="var(--gold)" className="absolute bottom-1/4 left-6 opacity-12" />
      <GearDecoration size="small" color="var(--emerald)" className="absolute top-1/4 left-1/3 opacity-15" />

      <EngineeringToolReveal index={2} style={{ top: '10%', right: '5%' }} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-4"
      >
        <div className="glass-card-dark p-6 lg:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), var(--emerald), transparent)' }} />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 150, delay: 0.15 }}
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(217,119,6,0.1))', border: '2px solid rgba(217,119,6,0.15)' }}
          >
            <img src="/images/logo.png" alt="NUESA" className="h-10 w-auto brightness-0 invert opacity-90" onError={e => { e.target.style.display = 'none' }} />
          </motion.div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase mb-3" style={{ background: 'rgba(234,88,12,0.1)', color: '#fb923c' }}>
            Faculty of Engineering — UNN
          </span>

          <h4 className="font-bold text-xl text-white">Welcome Back</h4>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Sign in to your NUESA account</p>

          {step === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleLogin}
              className="mt-6 space-y-4 text-start"
            >
              <div>
                <label className="auth-label">Matric Number</label>
                <div className="relative">
                  <i className="fas fa-id-card absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input className="auth-input" placeholder="e.g. 2024/123456" value={matric} onChange={e => setMatric(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="auth-label">Password</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input type="password" className="auth-input" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="btn-nuesa w-full justify-center text-sm !py-3 font-semibold"
                type="submit" disabled={loading}
                style={{ background: 'linear-gradient(135deg, var(--gold), #f59e0b)', color: 'white', boxShadow: '0 4px 16px rgba(217,119,6,0.25)' }}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="fas fa-arrow-right-to-bracket me-2" />}
                Sign In
              </motion.button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} /></div>
                <div className="relative flex justify-center"><span className="text-[10px] px-3" style={{ background: 'rgba(15,23,42,0.85)', color: 'rgba(255,255,255,0.25)' }}>New to NUESA?</span></div>
              </div>

              <Link to="/register" className="btn-nuesa w-full justify-center text-xs !py-2.5 font-semibold" style={{ background: 'transparent', color: 'var(--emerald)', border: '1px solid rgba(5,150,105,0.3)' }}>
                Create an Account <i className="fas fa-arrow-right ms-1.5" />
              </Link>
            </motion.form>
          ) : (
            <motion.form
              key="2fa"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handle2fa}
              className="mt-6 space-y-5"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="relative inline-flex mb-3"
                >
                  <i className="fas fa-shield-halved" style={{ fontSize: 48, color: 'var(--emerald)' }} />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: '2px solid rgba(5,150,105,0.2)' }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Enter the 6-digit code sent to your email</p>
              </div>

              <div className="flex items-center justify-center gap-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    className="digit-slot"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="btn-nuesa w-full justify-center text-sm !py-3 font-semibold"
                type="submit" disabled={loading || otp.join('').length !== 6}
                style={{ background: 'linear-gradient(135deg, var(--emerald), #10B981)', color: 'white', boxShadow: '0 4px 16px rgba(5,150,105,0.25)' }}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="fas fa-check-circle me-2" />}
                Verify Code
              </motion.button>

              <button type="button" onClick={() => { setStep('login'); setOtp(['', '', '', '', '', '']) }}
                className="w-full text-center text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <i className="fas fa-arrow-left me-1" /> Back to login
              </button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
