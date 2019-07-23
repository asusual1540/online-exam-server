const Question = require('../../models/question')
const Exam = require('../../models/exam')

const {findTeacher, findExam} = require('../resolvers/merger')

module.exports = {
    addQuestion: async (args) => {
        const courseTitle = args.questionInput.courseTitle
        const courseCode = args.questionInput.courseCode
        const questions = args.questionInput.questions
        try {
            const question = new Question({
                courseTitle,
                courseCode,
                questions,
                exam : "5d0e74cf9c3e8f1f00c2404f"
            })
            const createdQuestion = await question.save()
            await Exam.updateOne ({_id: "5d0e74cf9c3e8f1f00c2404f"}, {
                "$set" : {
                    question: createdQuestion
                }
            })
            return {
                ...createdQuestion._doc,
                date: new Date(createdQuestion._doc.date).toISOString(),
                exam: findExam.bind(this, createdQuestion.exam)
            }
        } catch (ex) {
            return new Error ("Couldnot add any question" + ex)
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
                    teacher: findTeacher.bind(this, question.teacher),
                    exam: findExam.bind(this, question.exam)
                }
            })
        } catch (err) {
            return new Error ("Couldnot find Questions" + err)
        }
    }
}
    