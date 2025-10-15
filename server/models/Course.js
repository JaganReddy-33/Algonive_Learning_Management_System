import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    durationMinutes: { type: Number, default: 0, min: 0 },
    order: { type: Number, required: true },
    isPublished: { type: Boolean, default: false },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lessons: [lessonSchema],
    thumbnail: { type: String },
    category: { type: String, default: 'General' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    duration: { type: Number, default: 0 }, // Total duration in minutes
    price: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    enrolledCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Calculate total duration from lessons
courseSchema.pre('save', function (next) {
  if (this.lessons && this.lessons.length > 0) {
    this.duration = this.lessons.reduce((total, lesson) => total + (lesson.durationMinutes || 0), 0);
  }
  next();
});

export default mongoose.model('Course', courseSchema);