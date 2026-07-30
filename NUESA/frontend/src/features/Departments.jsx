import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DepartmentsGrid from '../components/sections/DepartmentsGrid';

export default function Departments() {
  return (
    <div className="py-5">
      <div className="container text-center mb-4">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="section-title mx-auto" style={{ color: '#007f00' }}>All Departments</h2>
          <p className="text-muted mt-3">Explore the 10 engineering departments under the Faculty of Engineering, UNN.</p>
        </motion.div>
      </div>
      <DepartmentsGrid />
    </div>
  );
}
