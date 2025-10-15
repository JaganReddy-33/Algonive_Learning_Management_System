import express from 'express';
import {
  updateLessonProgress,
  getCourseProgress,
  getUserProgress,
  getProgressAnalytics,
} from '../controllers/progress.controller.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Student routes
router.put('/lesson', updateLessonProgress);
router.get('/course/:courseId', getCourseProgress);
router.get('/my-progress', getUserProgress);

// Instructor/Admin routes
router.get('/analytics/:courseId', requireInstructor, getProgressAnalytics);

export default router;

