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
        console.log("existing question found")
        console.log(existingQuestion)
        console.log("exists block ran")
        const fuka = IncomingQuestions.map((q, i) => {
          if (existingQuestion.questions[i]) {
            return {
              id: q.id,
              text: q.text,
              mark: q.mark,
              options: q.options,
              image: existingQuestion.questions[i].image
            }
          } else {
            return {
              id: q.id,
              text: q.text,
              mark: q.mark,
              options: q.options,
              image: ""
            }
          }
        })
        existingQuestion.set({
          questions: fuka
        })
        question = await existingQuestion.save()
      } else {
        console.log("else block ran")
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
        date: new Date(question._doc.date).toISOString()
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
        console.log(question)
        return {
          ...question._doc,
          _id: question.id,
          date: new Date(question._doc.date).toISOString()
        }
      }
    } catch (err) {
      return new Error("Couldnot find Questions from resolver" + err)
    }
  }
}
