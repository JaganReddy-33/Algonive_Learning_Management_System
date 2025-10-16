import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiUsers, FiAward, FiTrendingUp, FiClock, FiStar } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { courseAPI, progressAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/button';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (user.role === 'teacher') {
        const res = await courseAPI.getInstructorCourses();

        // Optionally, fetch analytics per course
        const coursesWithAnalytics = await Promise.all(
          res.data.map(async (course) => {
            try {
              const analyticsRes = await progressAPI.getProgressAnalytics(course._id);
              return { ...course, analytics: analyticsRes.data };
            } catch (err) {
              console.error(`Failed to fetch analytics for course ${course._id}:`, err);
              return { ...course, analytics: null };
            }
          })
        );

        setCourses(coursesWithAnalytics);

        setStats({
          totalCourses: res.data.length,
          publishedCourses: res.data.filter(c => c.isPublished).length,
          unpublishedCourses: res.data.filter(c => !c.isPublished).length,
        });
      } else {
        const progressRes = await progressAPI.getUserProgress();
        const progressData = progressRes.data;
        setStats({
          totalCourses: progressData.statistics.totalCourses,
          completedCourses: progressData.statistics.completedCourses,
          inProgressCourses: progressData.statistics.inProgressCourses,
          totalTimeSpent: progressData.statistics.totalTimeSpent,
        });
        setCourses(progressData.enrollments.slice(0, 6).map(e => e.courseId));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await courseAPI.togglePublishCourse(id);
      toast.success(res.data.message);
      fetchDashboardData();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to toggle publish status');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${user.name}! 👋`}
        </h1>
        <p className="text-gray-600">
          {user.role === 'teacher'
            ? 'Manage your courses and track student progress'
            : 'Continue your learning journey and discover new courses'}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {user.role === 'teacher' ? (
          <>
            <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </motion.div>
            <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedCourses}</p>
            </motion.div>
            <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <p className="text-sm font-medium text-gray-600">Unpublished</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unpublishedCourses}</p>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </motion.div>
            <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
            </motion.div>
            <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgressCourses}</p>
            </motion.div>
            <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <p className="text-sm font-medium text-gray-600">Time Spent</p>
              <p className="text-2xl font-bold text-gray-900">{Math.floor(stats.totalTimeSpent / 3600)}h {Math.floor((stats.totalTimeSpent % 3600) / 60)}m</p>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Courses Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {courses.length > 0 ? (
          courses.map(course => (
            <motion.div
              key={course._id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.description}</p>
                </div>

                {user.role === 'teacher' && (
                  <Button
                    onClick={() => handleTogglePublish(course._id)}
                    variant={course.isPublished ? 'destructive' : 'outline'}
                  >
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                )}
              </div>

              {/* Teacher Analytics */}
              {user.role === 'teacher' && course.analytics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <FiUsers className="w-4 h-4" />
                    <span>{course.analytics.enrolledCount} students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiTrendingUp className="w-4 h-4" />
                    <span>Avg Progress: {course.analytics.averageProgress}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiStar className="w-4 h-4" />
                    <span>Avg Rating: {course.analytics.averageRating?.toFixed(1) || 0}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 col-span-full">
            <FiBookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {user.role === 'teacher'
                ? 'No courses yet. Create your first course!'
                : 'No courses yet. Start learning today!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
