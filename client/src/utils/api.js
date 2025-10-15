import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Course API
export const courseAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  getInstructorCourses: () => api.get('/courses/instructor/my-courses'),
  togglePublishCourse: (id) => api.patch(`/courses/${id}/toggle-publish`),
};

// Enrollment API
export const enrollmentAPI = {
  enrollInCourse: (courseId) => api.post('/enrollments/enroll', { courseId }),
  unenrollFromCourse: (courseId) => api.delete(`/enrollments/unenroll/${courseId}`),
  getEnrolledCourses: () => api.get('/enrollments/my-courses'),
  getEnrollmentStatus: (courseId) => api.get(`/enrollments/status/${courseId}`),
  updateProgress: (courseId, progress) => api.put(`/enrollments/progress/${courseId}`, { progress }),
};

// Quiz API
export const quizAPI = {
  getCourseQuizzes: (courseId) => api.get(`/quizzes/course/${courseId}`),
  getQuiz: (id) => api.get(`/quizzes/${id}`),
  submitQuiz: (id, answers, timeSpent) => api.post(`/quizzes/${id}/submit`, { answers, timeSpent }),
  getQuizResults: (id) => api.get(`/quizzes/${id}/results`),
  createQuiz: (quizData) => api.post('/quizzes', quizData),
  updateQuiz: (id, quizData) => api.put(`/quizzes/${id}`, quizData),
  deleteQuiz: (id) => api.delete(`/quizzes/${id}`),
};

// Progress API
export const progressAPI = {
  updateLessonProgress: (progressData) => api.put('/progress/lesson', progressData),
  getCourseProgress: (courseId) => api.get(`/progress/course/${courseId}`),
  getUserProgress: () => api.get('/progress/my-progress'),
  getProgressAnalytics: (courseId) => api.get(`/progress/analytics/${courseId}`),
};

export default api;

