import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookOpen, FiUsers, FiClock, FiStar, FiPlay, FiCheck, FiLock } from 'react-icons/fi';
import { courseAPI, enrollmentAPI, progressAPI } from '../utils/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await courseAPI.getCourse(id);
      setCourse(courseResponse.data);
      
      // Check enrollment status
      try {
        const enrollmentResponse = await enrollmentAPI.getEnrollmentStatus(id);
        if (enrollmentResponse.data.enrolled) {
          setEnrollment(enrollmentResponse.data.enrollment);
          
          // Fetch progress if enrolled
          const progressResponse = await progressAPI.getCourseProgress(id);
          setProgress(progressResponse.data);
        }
      } catch (error) {
        console.warn('Not enrolled in this course:', error);
        // Not enrolled
        setEnrollment(null);
      }
      
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course details');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await enrollmentAPI.enrollInCourse(id);
      toast.success('Successfully enrolled in course!');
      fetchCourseData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getLessonProgress = (lessonId) => {
    if (!progress?.lessonProgress) return 0;
    const lessonProgress = progress.lessonProgress.find(lp => lp.lessonId === lessonId);
    return lessonProgress?.completed ? 100 : 0;
  };

  if (loading) {
    return <LoadingSpinner text="Loading course details..." />;
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
          <button
            onClick={() => navigate('/courses')}
            className="text-primary-600 hover:text-primary-700"
          >
            Back to courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Course Header */}
      <motion.div
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="md:flex">
          {/* Course Image */}
          <div className="md:w-1/2">
            <div className="relative h-64 md:h-full bg-gradient-to-r from-primary-500 to-primary-700">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FiBookOpen className="w-24 h-24 text-white opacity-50" />
                </div>
              )}
            </div>
          </div>

          {/* Course Info */}
          <div className="md:w-1/2 p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                {course.category}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <FiStar className="w-4 h-4 text-yellow-400 mr-1" />
                {course.rating.toFixed(1)} ({course.enrolledCount} students)
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-gray-600 mb-6">{course.description}</p>

            <div className="flex items-center space-x-6 mb-6 text-sm text-gray-500">
              <div className="flex items-center">
                <FiUsers className="w-4 h-4 mr-2" />
                {course.enrolledCount} students
              </div>
              <div className="flex items-center">
                <FiClock className="w-4 h-4 mr-2" />
                {formatDuration(course.duration)}
              </div>
              <div className="flex items-center">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {course.difficulty}
                </span>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center space-x-3 mb-6">
              <img
                src={course.instructor.avatarUrl || '/default-avatar.png'}
                alt={course.instructor.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-sm text-gray-500">Instructor</p>
                <p className="font-medium text-gray-900">{course.instructor.name}</p>
              </div>
            </div>

            {/* Action Button */}
            {enrollment ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-800 font-medium">Enrolled</span>
                    <span className="text-green-600 text-sm">{enrollment.progress}% Complete</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/courses/${id}/learn`)}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <FiPlay className="w-5 h-5 mr-2" />
                  Continue Learning
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Content */}
        <div className="lg:col-span-2">
          {/* Lessons */}
          <motion.div
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
            <div className="space-y-4">
              {course.lessons.map((lesson, index) => {
                const lessonProgress = getLessonProgress(lesson._id || index.toString());
                const isCompleted = lessonProgress === 100;
                
                return (
                  <motion.div
                    key={lesson._id || index}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <FiCheck className="w-4 h-4 text-green-600" />
                        </div>
                      ) : enrollment ? (
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <FiPlay className="w-4 h-4 text-primary-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <FiLock className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                      <p className="text-sm text-gray-600">{lesson.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500">
                          {formatDuration(lesson.durationMinutes)}
                        </span>
                        {enrollment && (
                          <span className="text-sm text-primary-600">
                            {isCompleted ? 'Completed' : 'Not started'}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Stats */}
          <motion.div
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Course Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">{formatDuration(course.duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lessons</span>
                <span className="font-medium">{course.lessons.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Students</span>
                <span className="font-medium">{course.enrolledCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rating</span>
                <span className="font-medium">{course.rating.toFixed(1)}/5</span>
              </div>
            </div>
          </motion.div>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <motion.div
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

