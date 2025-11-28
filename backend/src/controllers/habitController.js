import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import { toObjectId } from '../utils/objectId.js';

export async function getHabits(req, res) {
  const userId = req.user.id;
  try {
    const habits = await Habit.find({ user_id: toObjectId(userId) })
      .sort({ created_at: -1 })
      .lean();
    
    // Convert MongoDB _id to id for frontend compatibility
    const habitsWithId = habits.map(habit => ({
      ...habit,
      id: habit._id.toString(),
      user_id: habit.user_id.toString(),
    }));
    
    res.json(habitsWithId);
  } catch (e) {
    console.error('Get habits error:', e);
    res.status(500).json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}

export async function createHabit(req, res) {
  const userId = req.user.id;
  const { title, description, frequency, color } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    const habit = new Habit({
      user_id: toObjectId(userId),
      title,
      description: description || '',
      frequency: frequency || 'daily',
      color: color || null,
    });
    
    await habit.save();
    
    // Convert _id to id for frontend compatibility
    const habitObj = habit.toObject();
    res.status(201).json({
      ...habitObj,
      id: habitObj._id.toString(),
      user_id: habitObj.user_id.toString(),
    });
  } catch (e) {
    console.error('Create habit error:', e);
    res.status(500).json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}

export async function updateHabit(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  const { title, description, frequency, color } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: toObjectId(id), user_id: toObjectId(userId) },
      { title, description: description || '', frequency: frequency || 'daily', color: color || null },
      { new: true }
    );

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const habitObj = habit.toObject();
    res.json({
      ...habitObj,
      id: habitObj._id.toString(),
      user_id: habitObj.user_id.toString(),
    });
  } catch (e) {
    console.error('Update habit error:', e);
    res.status(500).json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}

export async function deleteHabit(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  
  try {
    const habit = await Habit.findOneAndDelete({ 
      _id: toObjectId(id), 
      user_id: toObjectId(userId) 
    });
    
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    // Also delete all completions for this habit
    await HabitCompletion.deleteMany({ habit_id: toObjectId(id) });
    
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete habit error:', e);
    res.status(500).json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}

export async function markComplete(req, res) {
  const userId = req.user.id;
  const habitId = req.params.id;
  const { date } = req.body; // date string

  try {
    // Ensure habit belongs to user
    const habit = await Habit.findOne({ 
      _id: toObjectId(habitId), 
      user_id: toObjectId(userId) 
    });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Parse date - if provided as string, convert to Date object (set to start of day)
    let completionDate;
    if (date) {
      completionDate = new Date(date);
      completionDate.setHours(0, 0, 0, 0);
    } else {
      completionDate = new Date();
      completionDate.setHours(0, 0, 0, 0);
    }

    // Use upsert to avoid duplicates (unique index handles this)
    const habitObjectId = toObjectId(habitId);
    const completion = await HabitCompletion.findOneAndUpdate(
      { 
        habit_id: habitObjectId, 
        completed_on: completionDate 
      },
      { 
        habit_id: habitObjectId, 
        completed_on: completionDate 
      },
      { upsert: true, new: true }
    );
    
    res.json({ ok: true, completion });
  } catch (e) {
    if (e.code === 11000) {
      // Duplicate key error - completion already exists
      return res.json({ ok: true, message: 'Already completed' });
    }
    console.error('Mark complete error:', e);
    res.status(500).json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}


