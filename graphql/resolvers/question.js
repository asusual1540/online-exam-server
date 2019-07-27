const Question = require('../../models/question')
const Exam = require('../../models/exam')

const { findExam } = require("./merger")

module.exports = {
    addQuestion: async (args, req) => {
        // if (req.isAuth === false || req.accessType !== 2) {
        //     console.log("Unauthenticated")
        //     throw new Error("Unauthenticated")
        // }
        const examID = args.questionInput.exam
        const questions = [...args.questionInput.questions]
        try {
            const question = new Question({
                exam: examID,
                questions
            })
            const createdQuestion = await question.save()
            await Exam.updateOne({ _id: examID }, {
                "$set": {
                    question: createdQuestion
                }
            })
            return {
                ...createdQuestion._doc,
                date: new Date(createdQuestion._doc.date).toISOString(),
                exam: findExam.bind(this, createdQuestion._doc.exam)
            }
        } catch (ex) {
            return new Error("Couldnot add any question " + ex)
        }
    },
    get_all_questions: async () => {
        try {
            const questions = await Question.find()
            return questions.map(question => {
                return {
                    ...question._doc,
                    _id: question.id,
                    date: new Date(question._doc.date).toISOString(),
                    exam: findExam.bind(this, question._doc.exam)
                }
            })
        } catch (err) {
            return new Error("Couldnot find Questions" + err)
        }
    }
}
