const mongoose = require('mongoose')

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam"
    },
    myResult: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Result = mongoose.model("Result", resultSchema)


module.exports = Result