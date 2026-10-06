import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

function readCookie(cookieHeader, name) {
  const cookie = cookieHeader
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

export function authenticate(req, res, next) {
  const authorization = req.get('authorization');
  const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  let cookieToken;
  try {
    cookieToken = readCookie(req.get('cookie'), env.authCookieName);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid authentication cookie.' });
  }

  const token = cookieToken || bearerToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
    }
    req.user = { id: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}
