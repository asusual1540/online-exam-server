const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam"
    },
    answers: [{
        _id: false,
        questionIndex: Number,
        studentAnswer: Number
    }],
    myMarks: Number,
    date: {
        type: Date,
        default: Date.now
    }
})

const Answer = mongoose.model("Answer", answerSchema)

module.exports = Answer