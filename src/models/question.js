const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam"
    },
    questions: [
        {
            _id: false,
            id: Number,
            image: String,
            text: String,
            mark: Number,
            options: [
                {
                    _id: false,
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