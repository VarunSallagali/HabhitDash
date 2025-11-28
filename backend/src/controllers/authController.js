import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT = 10;

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const hashed = await bcrypt.hash(password, SALT);
  try {
    const user = new User({
      name: name || '',
      email: email.toLowerCase().trim(),
      password_hash: hashed,
    });
    await user.save();
    
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      user: { id: user._id.toString(), name: user.name, email: user.email },
      token,
    });
  } catch (e) {
    if (e.code === 11000 || e.name === 'MongoServerError') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    if (e.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error: ' + Object.values(e.errors).map(err => err.message).join(', ') });
    }
    console.error('Registration error:', e);
    res.status(500).json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  
  console.log('Login attempt for:', email); // Debug log
  
  if (!email || !password) {
    console.log('Login failed: Missing email or password');
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    
    if (!ok) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const response = {
      user: { id: user._id.toString(), name: user.name, email: user.email },
      token,
    };
    
    console.log('Login successful for:', email);
    res.json(response);
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}


