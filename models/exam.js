const mongoose = require('mongoose')

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    code: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 10
    },
    password: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    totalMarks: {
        type: Number,
        min: 1,
        max: 500
    },
    examDate: {
        type: String
    },
    totalTimeInMin: {
        type: Number
    },
    status: {
        type: Boolean,
        default: false
    },
    course:
    {
        title: String,
        code: String
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
    },
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        }
    ],
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    result: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Result"
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Exam = mongoose.model("Exam", examSchema)

module.exports = Exam