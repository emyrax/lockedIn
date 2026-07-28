import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { supabase } from '../config/database.js';
import { ROLES, DEPT_CODES } from '../config/constants.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', authenticate, requireRole(ROLES.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { search, role, department, status, page = 1, limit = 20 } = req.query;
    let query = supabase.from('profiles').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,matric_number.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (role) query = query.eq('role', role);
    if (department) query = query.eq('department', department);
    if (status) query = query.eq('status', status);

    query = query.range((page - 1) * limit, page * limit - 1).order('created_at', { ascending: false });

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({ users: data, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, requireRole(ROLES.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'User not found' });
    res.json(data);
  } catch (err) { next(err); }
});

const updateUserSchema = z.object({
  role: z.enum(['student', 'alumnus', 'electo', 'super_admin', 'staff']).optional(),
  status: z.enum(['pending', 'active', 'suspended']).optional(),
  department: z.string().refine(d => DEPT_CODES.includes(d), { message: 'Invalid department' }).optional(),
});

router.patch('/:id', authenticate, requireRole(ROLES.SUPER_ADMIN), validate(updateUserSchema), async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('profiles').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) return res.status(404).json({ error: 'User not found' });
    res.json(data);
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, requireRole(ROLES.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { error } = await supabase.from('profiles').update({ deleted_at: new Date().toISOString(), status: 'suspended' }).eq('id', req.params.id);
    if (error) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
});

export default router;
