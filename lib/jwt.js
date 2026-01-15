import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function signJwt(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
