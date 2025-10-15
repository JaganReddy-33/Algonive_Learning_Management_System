import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      userId,
      courseId,
    });

    await enrollment.save();

    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });

    // Increment course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledCount: 1 },
    });

    await enrollment.populate('courseId', 'title description thumbnail');

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment,
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Server error enrolling in course' });
  }
};

// Unenroll from a course
export const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Remove enrollment
    await Enrollment.findByIdAndDelete(enrollment._id);

    // Remove course from user's enrolled courses
    await User.findByIdAndUpdate(userId, {
      $pull: { enrolledCourses: courseId },
    });

    // Decrement course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledCount: -1 },
    });

    res.json({ message: 'Successfully unenrolled from course' });
  } catch (error) {
    console.error('Unenrollment error:', error);
    res.status(500).json({ message: 'Server error unenrolling from course' });
  }
};

// Get user's enrolled courses
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const enrollments = await Enrollment.find({ userId })
      .populate('courseId', 'title description thumbnail instructor category difficulty duration')
      .sort({ enrolledAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Server error fetching enrolled courses' });
  }
};

// Get enrollment status for a course
export const getEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    
    if (!enrollment) {
      return res.json({ enrolled: false });
    }

    res.json({
      enrolled: true,
      enrollment,
    });
  } catch (error) {
    console.error('Get enrollment status error:', error);
    res.status(500).json({ message: 'Server error checking enrollment status' });
  }
};

// Update course progress
export const updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress } = req.body;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    enrollment.progress = Math.min(100, Math.max(0, progress));
    enrollment.lastAccessed = new Date();

    if (progress >= 100) {
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    res.json({
      message: 'Progress updated successfully',
      enrollment,
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error updating progress' });
  }
};

