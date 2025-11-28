import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  frequency: {
    type: String,
    default: 'daily',
  },
  color: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Habit', habitSchema);

