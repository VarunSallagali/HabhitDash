import express from 'express';
import auth from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controllers/userController.js';

const router = express.Router();

router.use(auth);
router.get('/me', getProfile);
router.put('/me', updateProfile);

export default router;


