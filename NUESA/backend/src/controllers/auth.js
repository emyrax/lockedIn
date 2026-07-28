import * as authService from '../services/auth.js';

export async function register(req, res, next) {
  try {
    const result = await authService.registerStudent(req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err.message.includes('Matric number already registered')) {
      return res.status(409).json({ error: err.message });
    }
    if (err.message.includes('Invalid')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const result = await authService.verifyStudentOtp(req.body);
    res.json(result);
  } catch (err) {
    if (err.message.includes('Invalid or expired OTP')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.loginWithPassword(req.body);
    res.json(result);
  } catch (err) {
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({ error: err.message });
    }
    if (err.message.includes('suspended')) {
      return res.status(403).json({ error: err.message });
    }
    next(err);
  }
}

export async function verifyLoginOtp(req, res, next) {
  try {
    const result = await authService.verifyLoginOtp(req.body);
    res.json(result);
  } catch (err) {
    if (err.message.includes('Invalid or expired 2FA code')) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message.includes('not yet activated')) {
      return res.status(403).json({ error: err.message });
    }
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const profile = await authService.getProfile(req.user.sub);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const profile = await authService.updateProfile(req.user.sub, req.body);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}
