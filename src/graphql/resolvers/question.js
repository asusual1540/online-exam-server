const Question = require("../../models/question")
const Exam = require("../../models/exam")
const isAuth = require("../../middleware/is-auth")

const { findExam } = require("./merger")

module.exports = {
  addQuestion: async (parent, args, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }
    const examID = args.questionInput.exam
    const IncomingQuestions = [...args.questionInput.questions]
    const existingQuestion = await Question.findOne({ exam: examID })
    let question = {}
    try {
      if (existingQuestion) {
        existingQuestion.set({
          questions: IncomingQuestions
        })
        question = await existingQuestion.save()
      } else {
        const newQuestion = new Question({
          exam: examID,
          questions: IncomingQuestions
        })
        question = await newQuestion.save()
        await Exam.updateOne(
          { _id: examID },
          {
            $set: {
              question: question
            }
          }
        )
      }
      return {
        ...question._doc,
        _id: question.id,
        date: new Date(question._doc.date).toISOString(),
        exam: findExam.bind(this, question._doc.exam)
      }
    } catch (ex) {
      return new Error("Couldnot add any question " + ex)
    }
  },
  get_question_by_exam: async (parent, args, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const question = await Question.findOne({ exam: args.examID })
      if (question) {
        return {
          ...question._doc,
          _id: question.id,
          date: new Date(question._doc.date).toISOString(),
          exam: findExam.bind(this, question._doc.exam)
        }
      }
    } catch (err) {
      return new Error("Couldnot find Questions from resolver" + err)
    }
  }
}
