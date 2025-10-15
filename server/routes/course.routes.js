import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  togglePublishCourse,
} from '../controllers/course.controller.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Protected routes
router.use(authenticateToken);

// Instructor/Admin routes
router.post('/', requireInstructor, createCourse);
router.get('/instructor/my-courses', requireInstructor, getInstructorCourses);
router.put('/:id', requireInstructor, updateCourse);
router.delete('/:id', requireInstructor, deleteCourse);
router.patch('/:id/toggle-publish', requireInstructor, togglePublishCourse);

export default router;

