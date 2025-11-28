import express from 'express';
import auth from '../middleware/auth.js';
import {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
  markComplete,
  reorderHabits,
  getAnalytics,
  getTimeline,
} from '../controllers/habitController.js';

const router = express.Router();

router.use(auth);

router.get('/', getHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/complete', markComplete); // body: {date: 'YYYY-MM-DD'}
router.post('/reorder', reorderHabits);
router.get('/analytics/overview', getAnalytics);
router.get('/analytics/timeline', getTimeline);

export default router;


