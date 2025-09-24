import { verifyJwtToken } from '../utils/jwt.js';

export function authenticateToken(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  const user = verifyJwtToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
  req.user = user;
  next();
}