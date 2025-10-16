import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be below 0'],
      max: [100, 'Progress cannot exceed 100'],
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate enrollment per user-course
enrollmentSchema.index(
  { userId: 1, courseId: 1 },
  { unique: true, sparse: true } // sparse ensures no null duplicates
);

// ✅ Pre-save validation to avoid null entries
enrollmentSchema.pre('save', function (next) {
  if (!this.userId || !this.courseId) {
    return next(new Error('Both userId and courseId are required for enrollment.'));
  }
  next();
});

export default mongoose.model('Enrollment', enrollmentSchema);
