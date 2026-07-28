import { motion } from 'framer-motion';

export default function InfiniteMarquee({ items, speed = 30, height = 72 }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden relative w-full" style={{ maskImage: 'linear-gradient(90deg, transparent, black 5%, black 95%, transparent)' }}>
      <motion.div className="flex items-center gap-6" style={{ width: 'max-content' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}>
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{ minWidth: 130, height, filter: 'grayscale(0.8)', opacity: 0.55 }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0)'; e.currentTarget.style.opacity = '1' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(0.8)'; e.currentTarget.style.opacity = '0.55' }}>
            {item.startsWith('http') || item.startsWith('/') ? (
              <img src={item} alt="" className="max-h-full" style={{ maxWidth: 110, maxHeight: height - 10, objectFit: 'contain' }}
                onError={e => { e.currentTarget.style.display = 'none' }} />
            ) : (
              <span className="font-semibold tracking-tight" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item}</span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
