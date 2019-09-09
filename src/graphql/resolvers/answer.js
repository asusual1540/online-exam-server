const Question = require("../../models/question")
const Answer = require("../../models/answer")
const Student = require("../../models/student")
const Exam = require("../../models/exam")
const isAuth = require("../../middleware/is-auth")


module.exports = {
    writeAnswer: async (parent, { studentID, examID, question_index, question_answer }, ctx, info) => {
        const authData = isAuth(ctx.request)
        if (!authData) {
            throw new Error("Not Authorized")
        }
        if (authData.accessType !== 3) {
            throw new Error("You Dont Have The Permission")
        }
        try {
            const answer = await Answer.findOne({ student: studentID, exam: examID })
            answer["answers"].map((ans, ind) => {
                if (ans.questionIndex === question_index + 1) {
                    return ans.studentAnswer = question_answer
                }
            })
            await answer.save()
            return true
        } catch (ex) {
            throw new Error("Could not write your answer" + ex)
        }
    },
    getAnswer: async (parent, { studentID, examID }, ctx, info) => {
        const authData = isAuth(ctx.request)
        if (!authData) {
            throw new Error("Not Authorized")
        }
        if (authData.accessType !== 3) {
            throw new Error("You Dont Have The Permission")
        }
        try {
            const student = await Student.findById(studentID)
            console.log(student)
            const exam = await Exam.findById(examID)
            const question = await Question.findById(exam.question)
            const questions = [...question.questions]
            const answer = await Answer.findOne({ student: studentID, exam: examID })
            if (answer) {
                return {
                    ...answer._doc,
                    _id: answer.id,
                    date: new Date(answer._doc.date).toISOString()
                }
            } else {
                let studentAnswers = []
                for (let i = 0; i < questions.length; i++) {
                    studentAnswers.push({
                        questionIndex: i + 1,
                        studentAnswer: 1
                    })
                }
                const answer = new Answer({
                    student: studentID,
                    exam: examID,
                    question: exam.question,
                    answers: studentAnswers,
                    myMarks: 0
                })
                await answer.save()
                student["myAnswers"].push(answer)
                await student.save()
                console.log(student)
                return {
                    ...answer._doc,
                    _id: answer.id,
                    date: new Date(answer._doc.date).toISOString()
                }
            }


        } catch (ex) {
            throw new Error("Could not initiate your answer" + ex)
        }
    },
    get_answer_by_students: async (parent, { studentIDs }, ctx, info) => {
        const authData = isAuth(ctx.request)
        if (!authData) {
            throw new Error("Not Authorized")
        }
        if (authData.accessType !== 2) {
            throw new Error("You Dont Have The Permission")
        }
        try {
            const answers = await Answer.find({ student: { $in: studentIDs } })
            return answers.map(answer => {
                return {
                    ...answer._doc,
                    _id: answer.id,
                    date: new Date(answer._doc.date).toISOString()
                }
            })
        } catch (err) {
            throw new Error("Couldn't find answers" + err)
        }
    }
}


