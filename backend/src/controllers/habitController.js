import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import { toObjectId } from '../utils/objectId.js';

const formatDateKey = (date) =>
  new Date(date).toISOString().slice(0, 10);

export async function getHabits(req, res) {
  const userId = req.user.id;
  try {
    const habits = await Habit.find({ user_id: toObjectId(userId) })
      .sort({ order: 1, created_at: -1 })
      .lean();

    const habitsWithId = habits.map((habit) => ({
      ...habit,
      id: habit._id.toString(),
      user_id: habit.user_id.toString(),
    }));

    res.json(habitsWithId);
  } catch (e) {
    console.error('Get habits error:', e);
    res
      .status(500)
      .json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}

export async function createHabit(req, res) {
  const userId = req.user.id;
  const {
    title,
    description,
    frequency,
    color,
    schedule_days,
    reminder_time,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const highestOrder = await Habit.findOne({ user_id: toObjectId(userId) })
      .sort({ order: -1 })
      .select('order')
      .lean();
    const nextOrder = highestOrder ? highestOrder.order + 1 : 0;

    const habit = new Habit({
      user_id: toObjectId(userId),
      title,
      description: description || '',
      frequency: frequency || 'daily',
      color: color || '#6366f1',
      schedule_days: Array.isArray(schedule_days) ? schedule_days : [],
      reminder_time: reminder_time || null,
      order: nextOrder,
    });

    await habit.save();

    const habitObj = habit.toObject();
    res.status(201).json({
      ...habitObj,
      id: habitObj._id.toString(),
      user_id: habitObj.user_id.toString(),
    });
  } catch (e) {
    console.error('Create habit error:', e);
    res
      .status(500)
      .json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}

export async function updateHabit(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  const {
    title,
    description,
    frequency,
    color,
    schedule_days,
    reminder_time,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: toObjectId(id), user_id: toObjectId(userId) },
      {
        title,
        description: description || '',
        frequency: frequency || 'daily',
        color: color || '#6366f1',
        schedule_days: Array.isArray(schedule_days) ? schedule_days : [],
        reminder_time: reminder_time || null,
      },
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
    res
      .status(500)
      .json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}

export async function reorderHabits(req, res) {
  const userId = req.user.id;
  const { order } = req.body; // array of habit ids

  if (!Array.isArray(order)) {
    return res.status(400).json({ error: 'Order must be an array' });
  }

  try {
    await Promise.all(
      order.map((habitId, index) =>
        Habit.updateOne(
          { _id: toObjectId(habitId), user_id: toObjectId(userId) },
          { order: index }
        )
      )
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('Reorder habits error:', e);
    res
      .status(500)
      .json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}

export async function deleteHabit(req, res) {
  const userId = req.user.id;
  const id = req.params.id;

  try {
    const habit = await Habit.findOneAndDelete({
      _id: toObjectId(id),
      user_id: toObjectId(userId),
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    await HabitCompletion.deleteMany({ habit_id: toObjectId(id) });

    res.json({ ok: true });
  } catch (e) {
    console.error('Delete habit error:', e);
    res
      .status(500)
      .json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}

export async function markComplete(req, res) {
  const userId = req.user.id;
  const habitId = req.params.id;
  const { date } = req.body;

  try {
    const habit = await Habit.findOne({
      _id: toObjectId(habitId),
      user_id: toObjectId(userId),
    });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    let completionDate;
    if (date) {
      completionDate = new Date(date);
      completionDate.setHours(0, 0, 0, 0);
    } else {
      completionDate = new Date();
      completionDate.setHours(0, 0, 0, 0);
    }

    const habitObjectId = toObjectId(habitId);
    const completion = await HabitCompletion.findOneAndUpdate(
      {
        habit_id: habitObjectId,
        user_id: toObjectId(userId),
        completed_on: completionDate,
      },
      {
        habit_id: habitObjectId,
        user_id: toObjectId(userId),
        completed_on: completionDate,
      },
      { upsert: true, new: true }
    );

    res.json({ ok: true, completion });
  } catch (e) {
    if (e.code === 11000) {
      return res.json({ ok: true, message: 'Already completed' });
    }
    console.error('Mark complete error:', e);
    res
      .status(500)
      .json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}

export async function getAnalytics(req, res) {
  const userId = req.user.id;
  const userObjectId = toObjectId(userId);
  const today = new Date();
  const last7Start = new Date(today);
  last7Start.setDate(today.getDate() - 6);
  last7Start.setHours(0, 0, 0, 0);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  try {
    const [totalHabits, completionsLast7, completionsThisMonth, topHabitsRaw, recentCompletions] =
      await Promise.all([
        Habit.countDocuments({ user_id: userObjectId }),
        HabitCompletion.aggregate([
          {
            $match: {
              user_id: userObjectId,
              completed_on: { $gte: last7Start },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$completed_on' },
              },
              count: { $sum: 1 },
            },
          },
        ]),
        HabitCompletion.countDocuments({
          user_id: userObjectId,
          completed_on: { $gte: monthStart },
        }),
        HabitCompletion.aggregate([
          { $match: { user_id: userObjectId } },
          {
            $group: {
              _id: '$habit_id',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'habits',
              localField: '_id',
              foreignField: '_id',
              as: 'habit',
            },
          },
          { $unwind: '$habit' },
          {
            $project: {
              id: '$habit._id',
              title: '$habit.title',
              color: '$habit.color',
              count: 1,
            },
          },
        ]),
        HabitCompletion.find({
          user_id: userObjectId,
          completed_on: { $gte: new Date(today.getTime() - 1000 * 60 * 60 * 24 * 30) },
        })
          .select('completed_on')
          .lean(),
      ]);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(last7Start);
      d.setDate(last7Start.getDate() + i);
      return formatDateKey(d);
    });

    const completionsMap = completionsLast7.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const last7Series = last7Days.map((day) => ({
      date: day,
      count: completionsMap[day] || 0,
    }));

    const completionDates = new Set(
      recentCompletions.map((c) => formatDateKey(c.completed_on))
    );
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      if (completionDates.has(key)) {
        streak += 1;
      } else {
        break;
      }
    }

    const completionRate =
      totalHabits > 0
        ? Math.round(
            ((completionsThisMonth || 0) / (totalHabits * today.getDate())) * 100
          )
        : 0;

    res.json({
      totalHabits,
      streak,
      completionRate,
      completionsThisMonth,
      last7Series,
      topHabits: topHabitsRaw.map((item) => ({
        id: item.id.toString(),
        title: item.title,
        color: item.color,
        count: item.count,
      })),
    });
  } catch (e) {
    console.error('Analytics error:', e);
    res
      .status(500)
      .json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}

export async function getTimeline(req, res) {
  const userId = req.user.id;
  try {
    const events = await HabitCompletion.find({ user_id: toObjectId(userId) })
      .sort({ completed_on: -1 })
      .limit(15)
      .populate('habit_id', 'title color')
      .lean();

    const formatted = events.map((event) => ({
      id: event._id.toString(),
      habitId: event.habit_id?._id?.toString(),
      habitTitle: event.habit_id?.title,
      color: event.habit_id?.color || '#6366f1',
      completed_on: event.completed_on,
    }));

    res.json(formatted);
  } catch (e) {
    console.error('Timeline error:', e);
    res
      .status(500)
      .json({ error: 'Server error: ' + (e.message || 'Unknown error') });
  }
}


