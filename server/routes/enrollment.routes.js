import express from 'express';
import {
  enrollInCourse,
  unenrollFromCourse,
  getEnrolledCourses,
  getEnrollmentStatus,
  updateProgress,
} from '../controllers/enrollment.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/enroll', enrollInCourse);
router.delete('/unenroll/:courseId', unenrollFromCourse);
router.get('/my-courses', getEnrolledCourses);
router.get('/status/:courseId', getEnrollmentStatus);
router.put('/progress/:courseId', updateProgress);

export default router;

