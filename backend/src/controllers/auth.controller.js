import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function createToken(userId) {
  return jwt.sign({}, env.jwtSecret, {
    subject: userId.toString(),
    expiresIn: '7d',
  });
}

function sendAuthenticatedUser(res, user, status = 200) {
  res.cookie(env.authCookieName, createToken(user._id), cookieOptions);
  return res.status(status).json({ success: true, user: user.toJSON() });
}

export async function register(req, res) {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : undefined;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }
  if (name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid name and email address.' });
  }
  if (password.length < 6 || password.length > 128) {
    return res.status(400).json({ success: false, message: 'Password must be between 6 and 128 characters.' });
  }
  if (username !== undefined && !/^[a-z0-9_]{3,30}$/.test(username)) {
    return res.status(400).json({ success: false, message: 'Username must be 3-30 characters (letters, numbers, and underscores).'});
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await User.create({ name, email, username, passwordHash });
    return sendAuthenticatedUser(res, user, 201);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with that email or username already exists.' });
    }
    throw error;
  }
}

export async function login(req, res) {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const identifier = typeof body.identifier === 'string'
    ? body.identifier.trim().toLowerCase()
    : typeof body.email === 'string'
      ? body.email.trim().toLowerCase()
      : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Email/username and password are required.' });
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ success: false, message: 'Invalid email/username or password.' });
  }

  return sendAuthenticatedUser(res, user);
}

export async function getCurrentUser(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(401).json({ success: false, message: 'The account for this session no longer exists.' });
  }
  return res.json({ success: true, user: user.toJSON() });
}

export function logout(_req, res) {
  return res.clearCookie(env.authCookieName, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
  }).json({ success: true });
}
