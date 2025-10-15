import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lessonId: { type: String, required: true }, // Lesson identifier
    completed: { type: Boolean, default: false },
    timeSpent: { type: Number, default: 0 }, // in seconds
    lastAccessed: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

// Ensure unique progress per user-course-lesson
progressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);

