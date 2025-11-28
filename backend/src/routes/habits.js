import express from 'express';
import auth from '../middleware/auth.js';
import {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
  markComplete,
} from '../controllers/habitController.js';

const router = express.Router();

router.use(auth);

router.get('/', getHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/complete', markComplete); // body: {date: 'YYYY-MM-DD'}

export default router;


