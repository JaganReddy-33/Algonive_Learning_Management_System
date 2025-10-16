import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?._id; // ✅ safer access

    // ✅ Check authentication
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // ✅ Validate course ID
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // ✅ Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // ✅ Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // ✅ Create enrollment
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      progress: 0,
      enrolledAt: new Date(),
    });

    // ✅ Update user and course info atomically
    await Promise.all([
      User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: courseId } }),
      Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } }),
    ]);

    // ✅ Populate course details before sending response
    await enrollment.populate('courseId', 'title description thumbnail category difficulty');

    res.status(201).json({
      message: '✅ Successfully enrolled in course',
      enrollment,
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: '❌ Server error enrolling in course', error });
  }
};

// Unenroll from a course
export const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    await Enrollment.findByIdAndDelete(enrollment._id);

    await Promise.all([
      User.findByIdAndUpdate(userId, { $pull: { enrolledCourses: courseId } }),
      Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: -1 } }),
    ]);

    res.json({ message: '✅ Successfully unenrolled from course' });
  } catch (error) {
    console.error('Unenrollment error:', error);
    res.status(500).json({ message: '❌ Server error unenrolling from course' });
  }
};

// Get user's enrolled courses
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const enrollments = await Enrollment.find({ userId })
      .populate('courseId', 'title description thumbnail instructor category difficulty duration')
      .sort({ enrolledAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: '❌ Server error fetching enrolled courses' });
  }
};

// Get enrollment status for a course
export const getEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const enrollment = await Enrollment.findOne({ userId, courseId });

    res.json({
      enrolled: !!enrollment,
      enrollment: enrollment || null,
    });
  } catch (error) {
    console.error('Get enrollment status error:', error);
    res.status(500).json({ message: '❌ Server error checking enrollment status' });
  }
};

// Update course progress
export const updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    // ✅ Validate progress range
    const safeProgress = Math.min(100, Math.max(0, progress));

    enrollment.progress = safeProgress;
    enrollment.lastAccessed = new Date();

    if (safeProgress >= 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    res.json({
      message: '✅ Progress updated successfully',
      enrollment,
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: '❌ Server error updating progress' });
  }
};
