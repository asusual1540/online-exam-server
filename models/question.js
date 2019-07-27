const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam"
    },
    questions: [
        {
            id: Number,
            text: String,
            mark: Number,
            options: [
                {
                    text: String,
                    id: Number,
                    answer: {
                        type: Boolean,
                        default: false
                    }
                }
            ]
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
})

const Question = mongoose.model("Question", questionSchema)



module.exports = Question