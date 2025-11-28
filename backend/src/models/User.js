import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  avatar_url: {
    type: String,
  },
  bio: {
    type: String,
    maxlength: 240,
  },
  theme_preference: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('User', userSchema);

