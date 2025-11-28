import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export default function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'No token' });

  const token = h.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Store user id as string - Mongoose will convert it when needed
    req.user = {
      ...payload,
      id: payload.id, // Keep as string, Mongoose handles conversion in queries
    };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}


