import mongoose from 'mongoose';

const habitCompletionSchema = new mongoose.Schema({
  habit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  completed_on: {
    type: Date,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Create unique index on habit_id and completed_on (date only, not time)
habitCompletionSchema.index({ habit_id: 1, completed_on: 1 }, { unique: true });
habitCompletionSchema.index({ user_id: 1, completed_on: 1 });

export default mongoose.model('HabitCompletion', habitCompletionSchema);

