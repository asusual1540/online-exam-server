const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  studentID: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100
  },
  status: {
    type: Boolean,
    default: false
  },
  submitStatus: {
    type: Boolean,
    default: false
  },
  accessType: {
    type: Number,
    default: 3
  },
  myExams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam"
    }
  ],
  myAnswers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer"
    }
  ],
  myResults: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Result"
    }
  ],
  myTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher"
  },
  date: {
    type: Date,
    default: Date.now
  }
})

const Student = mongoose.model("Student", studentSchema)

module.exports = Student
