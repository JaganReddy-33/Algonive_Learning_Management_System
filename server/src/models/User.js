import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // ✅ use bcryptjs (bcrypt can cause build issues in some environments)

// ✅ Schema to track user progress for each course
const progressSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    lastAccessed: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ✅ Main User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false }, // select:false for safety
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    avatarUrl: { type: String },
    bio: { type: String, maxlength: 500 },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    progress: [progressSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error("Password hashing error:", error);
    next(error);
  }
});

// ✅ Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Hide password from API responses
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// ✅ Export model
const User = mongoose.model("User", userSchema);
export default User;
