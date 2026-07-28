import { useState } from 'react';
import { motion } from 'framer-motion';
import PageShell from '../components/layout/PageShell';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
  };

  return (
    <PageShell title={`Contact ${'Us'}`} subtitle="Get in touch with NUESA UNN" toolIndex={8}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="page-card p-5 lg:p-6"
          >
            <h5 className="font-bold text-sm mb-4" style={{ color: 'var(--emerald)' }}>Send a Message</h5>
            {sent ? (
              <div className="text-center py-8">
                <i className="fas fa-check-circle text-4xl" style={{ color: 'var(--emerald)' }} />
                <p className="font-semibold mt-3 text-sm">Message sent successfully!</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>We&apos;ll get back to you within 24 hours.</p>
                <button className="btn-nuesa btn-outline text-xs mt-3" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Your Name</label>
                    <input className="form-input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Subject</label>
                  <input className="form-input" required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Message</label>
                  <textarea className="form-textarea" rows={4} required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                </div>
                <button type="submit" className="btn-nuesa btn-primary w-full justify-center text-sm !py-3" disabled={sending}>
                  {sending ? <><span className="spinner-border spinner-border-sm" /> Sending...</> : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {[
            { icon: 'fa-map-marker-alt', title: 'Visit Us', text: 'Faculty of Engineering, University of Nigeria, Nsukka, Enugu State, Nigeria', color: 'var(--emerald)' },
            { icon: 'fa-envelope', title: 'Email', text: 'info@nuesaunn.ng', color: 'var(--gold)' },
            { icon: 'fa-phone', title: 'Phone', text: '+234 800 NUESA UNN', color: 'var(--emerald)' },
            { icon: 'fa-clock', title: 'Office Hours', text: 'Mon–Fri: 9:00 AM – 4:00 PM', color: 'var(--gold)' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="page-card p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
                  <i className={`fas ${item.icon}`} style={{ color: item.color, fontSize: 14 }} />
                </div>
                <div>
                  <h6 className="font-bold text-xs mb-0.5" style={{ color: item.color }}>{item.title}</h6>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
