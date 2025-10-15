import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true }, // Index of correct option
    points: { type: Number, default: 1 },
    explanation: { type: String },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    timeSpent: { type: Number, default: 0 }, // in seconds
    answers: [{ type: Number }], // User's answers
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String },
    questions: [questionSchema],
    timeLimit: { type: Number, default: 30 }, // in minutes
    maxAttempts: { type: Number, default: 3 },
    passingScore: { type: Number, default: 70 }, // percentage
    isPublished: { type: Boolean, default: false },
    results: [resultSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);

