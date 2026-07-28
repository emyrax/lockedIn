import { ROLE_HIERARCHY } from '../config/constants.js';

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        yourRole: req.user.role,
      });
    }

    next();
  };
}

export function requireMinimumRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        minimumRole: minRole,
        yourRole: req.user.role,
      });
    }

    next();
  };
}

export function requireOwnership(entityUserIdField = 'user_id') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role === 'super_admin') {
      return next();
    }

    const resourceUserId = req.params[entityUserIdField] || req.body[entityUserIdField];
    if (resourceUserId && resourceUserId !== req.user.sub) {
      return res.status(403).json({ error: 'You do not own this resource' });
    }

    next();
  };
}
