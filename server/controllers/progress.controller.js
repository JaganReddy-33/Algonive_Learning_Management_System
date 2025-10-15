import Progress from '../models/Progress.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import mongoose from 'mongoose';

// Update lesson progress
export const updateLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonId, completed, timeSpent, notes } = req.body;
    const userId = req.user._id;

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Update or create progress record
    const progress = await Progress.findOneAndUpdate(
      { userId, courseId, lessonId },
      {
        completed,
        timeSpent: timeSpent || 0,
        lastAccessed: new Date(),
        notes,
      },
      { upsert: true, new: true }
    );

    // Calculate overall course progress
    const course = await Course.findById(courseId);
    const totalLessons = course.lessons.length;
    const completedLessons = await Progress.countDocuments({
      userId,
      courseId,
      completed: true,
    });

    const courseProgress = Math.round((completedLessons / totalLessons) * 100);

    // Update enrollment progress
    enrollment.progress = courseProgress;
    enrollment.lastAccessed = new Date();

    if (courseProgress >= 100) {
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    res.json({
      message: 'Progress updated successfully',
      progress,
      courseProgress,
    });
  } catch (error) {
    console.error('Update lesson progress error:', error);
    res.status(500).json({ message: 'Server error updating progress' });
  }
};

// Get course progress
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Get enrollment info
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Get detailed lesson progress
    const lessonProgress = await Progress.find({ userId, courseId })
      .sort({ lastAccessed: -1 });

    // Get course info
    const course = await Course.findById(courseId).select('title lessons');

    res.json({
      enrollment,
      lessonProgress,
      course,
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ message: 'Server error fetching course progress' });
  }
};

// Get user's overall progress
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all enrollments with progress
    const enrollments = await Enrollment.find({ userId })
      .populate('courseId', 'title thumbnail duration')
      .sort({ lastAccessed: -1 });

    // Calculate overall statistics
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress === 100).length;
    const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
    const notStartedCourses = enrollments.filter(e => e.progress === 0).length;

    const totalTimeSpent = await Progress.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalTime: { $sum: '$timeSpent' } } },
    ]);

    res.json({
      enrollments,
      statistics: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        notStartedCourses,
        totalTimeSpent: totalTimeSpent[0]?.totalTime || 0,
      },
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ message: 'Server error fetching user progress' });
  }
};

// Get progress analytics (for instructors)
export const getProgressAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Check if user is instructor of this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view analytics for this course' });
    }

    // Get enrollment statistics
    const totalEnrollments = await Enrollment.countDocuments({ courseId });
    const completedEnrollments = await Enrollment.countDocuments({ courseId, progress: 100 });
    const averageProgress = await Enrollment.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
      { $group: { _id: null, avgProgress: { $avg: '$progress' } } },
    ]);

    // Get lesson completion rates
    const lessonStats = await Progress.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: '$lessonId',
          completed: { $sum: { $cond: ['$completed', 1, 0] } },
          total: { $sum: 1 },
        },
      },
    ]);

    res.json({
      course: {
        title: course.title,
        totalLessons: course.lessons.length,
      },
      statistics: {
        totalEnrollments,
        completedEnrollments,
        completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
        averageProgress: Math.round(averageProgress[0]?.avgProgress || 0),
      },
      lessonStats,
    });
  } catch (error) {
    console.error('Get progress analytics error:', error);
    res.status(500).json({ message: 'Server error fetching progress analytics' });
  }
};

