# Learning Management System (LMS)

A complete, production-ready Learning Management System built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Student, Teacher, Admin)
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### Course Management
- Create, read, update, delete courses
- Course categories and difficulty levels
- Lesson management with content and duration
- Course enrollment and progress tracking
- Instructor dashboard for course management

### Learning Features
- Interactive quiz system with timed quizzes
- Progress tracking and analytics
- Course enrollment and unenrollment
- Real-time progress updates
- Student and instructor dashboards

### User Experience
- Modern, responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Toast notifications for user feedback
- Loading states and error handling
- Mobile-first responsive design

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Learning_System
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (client + server)
npm run install:all
```

### 3. Environment Setup

Create a `.env` file in the `server` directory:
```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/learning_system
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
CLIENT_URL=http://localhost:5173
```

### 4. Start the Application
```bash
# Start both client and server concurrently
npm run dev

# Or start individually:
npm run dev:client  # Frontend on http://localhost:5173
npm run dev:server  # Backend on http://localhost:8080
```

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['student', 'teacher', 'admin'],
  avatarUrl: String,
  bio: String,
  enrolledCourses: [ObjectId],
  progress: [{
    courseId: ObjectId,
    completionPercentage: Number,
    lastAccessed: Date
  }]
}
```

### Course Model
```javascript
{
  title: String,
  description: String,
  instructor: ObjectId (ref: User),
  lessons: [{
    title: String,
    content: String,
    durationMinutes: Number,
    order: Number
  }],
  thumbnail: String,
  category: String,
  difficulty: ['beginner', 'intermediate', 'advanced'],
  duration: Number,
  price: Number,
  isPublished: Boolean,
  enrolledCount: Number,
  rating: Number,
  tags: [String]
}
```

### Enrollment Model
```javascript
{
  userId: ObjectId (ref: User),
  courseId: ObjectId (ref: Course),
  enrolledAt: Date,
  completedAt: Date,
  progress: Number (0-100),
  lastAccessed: Date,
  isActive: Boolean
}
```

### Quiz Model
```javascript
{
  courseId: ObjectId (ref: Course),
  title: String,
  description: String,
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    points: Number,
    explanation: String
  }],
  timeLimit: Number (minutes),
  maxAttempts: Number,
  passingScore: Number,
  isPublished: Boolean,
  results: [{
    userId: ObjectId,
    score: Number,
    percentage: Number,
    timeSpent: Number,
    answers: [Number],
    completedAt: Date
  }]
}
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Courses
- `GET /api/courses` - Get all courses (with filters)
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (instructor/admin)
- `PUT /api/courses/:id` - Update course (instructor/admin)
- `DELETE /api/courses/:id` - Delete course (instructor/admin)
- `GET /api/courses/instructor/my-courses` - Get instructor's courses
- `PATCH /api/courses/:id/toggle-publish` - Toggle course publish status

### Enrollments
- `POST /api/enrollments/enroll` - Enroll in course
- `DELETE /api/enrollments/unenroll/:courseId` - Unenroll from course
- `GET /api/enrollments/my-courses` - Get enrolled courses
- `GET /api/enrollments/status/:courseId` - Check enrollment status
- `PUT /api/enrollments/progress/:courseId` - Update course progress

### Quizzes
- `GET /api/quizzes/course/:courseId` - Get course quizzes
- `GET /api/quizzes/:id` - Get quiz details
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `GET /api/quizzes/:id/results` - Get quiz results
- `POST /api/quizzes` - Create quiz (instructor/admin)
- `PUT /api/quizzes/:id` - Update quiz (instructor/admin)
- `DELETE /api/quizzes/:id` - Delete quiz (instructor/admin)

### Progress
- `PUT /api/progress/lesson` - Update lesson progress
- `GET /api/progress/course/:courseId` - Get course progress
- `GET /api/progress/my-progress` - Get user progress
- `GET /api/progress/analytics/:courseId` - Get progress analytics (instructor)

## 🎨 UI Components

### Pages
- **Home** - Landing page with features and CTA
- **Login/Register** - Authentication forms with validation
- **Dashboard** - Role-specific dashboards with stats
- **Courses** - Course listing with filters and search
- **Course Detail** - Course information and enrollment
- **Quiz** - Interactive quiz interface with timer
- **Profile** - User profile management
- **Create/Edit Course** - Course creation and editing

### Components
- **Navbar** - Navigation with user menu
- **Footer** - Site footer with links
- **LoadingSpinner** - Loading states
- **AuthContext** - Authentication state management

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Protected API routes
- Secure password requirements

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `client/dist`
4. Deploy

### Backend (Render/Heroku)
1. Create a new web service
2. Connect your GitHub repository
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables
6. Deploy

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get connection string
4. Update MONGO_URI in environment variables

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Video lesson support
- [ ] Discussion forums
- [ ] Certificate generation
- [ ] Payment integration
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@learnhub.com or create an issue in the repository.

---

Built with ❤️ using the MERN stack

