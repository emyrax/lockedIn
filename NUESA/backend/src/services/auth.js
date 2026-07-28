import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';
import { sendEmail, generateOtpEmail, generate2faEmail } from '../config/email.js';
import { MATRIC_REGEX, DEPT_CODES, UNN_EMAIL_SUFFIX, LEVELS } from '../config/constants.js';

const OTP_EXPIRY_MINUTES = 10;
const LOGIN_OTP_EXPIRY_MINUTES = 5;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateTokens(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    matric_number: user.matric_number,
    department: user.department,
    full_name: user.full_name,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  return { accessToken };
}

export async function registerStudent({ matric_number, full_name, department, level, phone }) {
  if (!MATRIC_REGEX.test(matric_number)) {
    throw new Error('Invalid matric number format. Expected format: YYYY/NUMBER');
  }

  if (!DEPT_CODES.includes(department)) {
    throw new Error('Invalid department. Must be a Faculty of Engineering department.');
  }

  if (!LEVELS.includes(level)) {
    throw new Error('Invalid level.');
  }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('matric_number', matric_number)
    .maybeSingle();

  if (existing) {
    throw new Error('Matric number already registered');
  }

  const regNumber = matric_number.split('/')[1];
  const nameParts = full_name.toLowerCase().split(' ');
  const firstName = nameParts[0]?.replace(/[^a-z]/g, '') || 'student';
  const lastName = nameParts[nameParts.length - 1]?.replace(/[^a-z]/g, '') || 'unknown';
  const predictedEmail = `${firstName}.${lastName}.${regNumber}${UNN_EMAIL_SUFFIX}`;

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  await supabase.from('registration_otps').insert({
    matric_number,
    email: predictedEmail,
    otp_hash: otp,
    full_name,
    department,
    level,
    phone: phone || null,
    expires_at: otpExpiry,
  });

  try {
    const emailContent = generateOtpEmail(otp, full_name.split(' ')[0]);
    await sendEmail({
      to: predictedEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    throw new Error('Failed to send verification email. Ensure your UNN email is active.');
  }

  return { message: 'OTP sent to your UNN email', email: predictedEmail };
}

export async function verifyStudentOtp({ matric_number, otp }) {
  const { data: record, error } = await supabase
    .from('registration_otps')
    .select('*')
    .eq('matric_number', matric_number)
    .eq('otp_hash', otp)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !record) {
    throw new Error('Invalid or expired OTP');
  }

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: record.email,
    email_confirm: true,
    user_metadata: {
      full_name: record.full_name,
      matric_number: record.matric_number,
      department: record.department,
      role: 'student',
    },
  });

  if (authError) {
    throw new Error('Failed to create account: ' + authError.message);
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: authUser.user.id,
    role: 'student',
    matric_number: record.matric_number,
    department: record.department,
    current_level: record.level,
    full_name: record.full_name,
    email: record.email,
    phone: record.phone,
    is_email_verified: true,
    status: 'pending',
  });

  if (profileError) {
    throw new Error('Failed to create profile: ' + profileError.message);
  }

  await supabase
    .from('registration_otps')
    .delete()
    .eq('id', record.id);

  const tokens = generateTokens({
    id: authUser.user.id,
    email: record.email,
    role: 'student',
    matric_number: record.matric_number,
    department: record.department,
    full_name: record.full_name,
  });

  return {
    message: 'Account created. Awaiting admin approval.',
    user: {
      id: authUser.user.id,
      email: record.email,
      role: 'student',
      full_name: record.full_name,
      matric_number: record.matric_number,
      status: 'pending',
    },
    ...tokens,
  };
}

export async function loginWithPassword({ matric_number, password }) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('matric_number', matric_number)
    .maybeSingle();

  if (!profile) {
    throw new Error('Invalid credentials');
  }

  if (profile.status === 'suspended') {
    throw new Error('Account suspended. Contact admin.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  });

  if (error) {
    throw new Error('Invalid credentials');
  }

  const loginOtp = generateOtp();
  const loginOtpExpiry = new Date(Date.now() + LOGIN_OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  await supabase.from('login_otps').upsert({
    user_id: data.user.id,
    otp_hash: loginOtp,
    expires_at: loginOtpExpiry,
  });

  const emailContent = generate2faEmail(loginOtp, profile.full_name.split(' ')[0]);
  await sendEmail({
    to: profile.email,
    subject: emailContent.subject,
    html: emailContent.html,
  });

  return {
    message: '2FA code sent to your email',
    requires_2fa: true,
    user_id: data.user.id,
  };
}

export async function verifyLoginOtp({ user_id, otp }) {
  const { data: record, error } = await supabase
    .from('login_otps')
    .select('*')
    .eq('user_id', user_id)
    .eq('otp_hash', otp)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error || !record) {
    throw new Error('Invalid or expired 2FA code');
  }

  await supabase.from('login_otps').delete().eq('id', record.id);

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single();

  if (profile.status !== 'active') {
    throw new Error('Account not yet activated. Wait for admin approval.');
  }

  const tokens = generateTokens(profile);
  return { message: 'Login successful', user: profile, ...tokens };
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error('Profile not found');

  const { data: alumniData } = await supabase
    .from('alumni_directory')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return { ...data, alumni_profile: alumniData || null };
}

export async function updateProfile(userId, updates) {
  const allowed = ['full_name', 'phone', 'avatar_url', 'bio', 'linkedin_url', 'twitter_url'];
  const filtered = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) filtered[key] = updates[key];
  }
  filtered.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .update(filtered)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error('Failed to update profile');
  return data;
}
