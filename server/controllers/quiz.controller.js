import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';

// Create a new quiz (instructor/admin only)
export const createQuiz = async (req, res) => {
  try {
    const { courseId, title, description, questions, timeLimit, maxAttempts, passingScore } = req.body;

    // Check if course exists and user is instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create quiz for this course' });
    }

    const quiz = new Quiz({
      courseId,
      title,
      description,
      questions,
      timeLimit,
      maxAttempts,
      passingScore,
    });

    await quiz.save();

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz,
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error creating quiz' });
  }
};

// Get quizzes for a course
export const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;

    const quizzes = await Quiz.find({ courseId, isPublished: true })
      .select('-questions.options -questions.correctAnswer')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    console.error('Get course quizzes error:', error);
    res.status(500).json({ message: 'Server error fetching quizzes' });
  }
};

// Get single quiz (for taking)
export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .select('-questions.correctAnswer -results');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!quiz.isPublished) {
      return res.status(403).json({ message: 'Quiz is not published' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error fetching quiz' });
  }
};

// Submit quiz answers
export const submitQuiz = async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;
    const quizId = req.params.id;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user has exceeded max attempts
    const userAttempts = quiz.results.filter(result => result.userId.toString() === userId.toString());
    if (userAttempts.length >= quiz.maxAttempts) {
      return res.status(400).json({ message: 'Maximum attempts exceeded' });
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = correctAnswers;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Create result
    const result = {
      userId,
      score,
      totalQuestions,
      percentage,
      timeSpent,
      answers,
    };

    quiz.results.push(result);
    await quiz.save();

    res.json({
      message: 'Quiz submitted successfully',
      result: {
        score,
        totalQuestions,
        percentage,
        passed: percentage >= quiz.passingScore,
        timeSpent,
      },
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error submitting quiz' });
  }
};

// Get quiz results for a user
export const getQuizResults = async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const userResults = quiz.results.filter(result => result.userId.toString() === userId.toString());

    res.json({
      quiz: {
        title: quiz.title,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
      },
      results: userResults,
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ message: 'Server error fetching quiz results' });
  }
};

// Update quiz (instructor/admin only)
export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is instructor or admin
    const course = await Course.findById(quiz.courseId);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this quiz' });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Quiz updated successfully',
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: 'Server error updating quiz' });
  }
};

// Delete quiz (instructor/admin only)
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is instructor or admin
    const course = await Course.findById(quiz.courseId);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Server error deleting quiz' });
  }
};

