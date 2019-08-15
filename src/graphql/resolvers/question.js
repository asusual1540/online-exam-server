const Question = require("../../models/question")
const Exam = require("../../models/exam")

const { findExam } = require("./merger")

module.exports = {
  addQuestion: async (args, req) => {
    if (req.isAuth === false || req.accessType !== 2) {
      throw new Error("Unauthenticated")
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
  get_question_by_exam: async (args, req) => {
    if (req.isAuth === false || req.accessType !== 2) {
      console.log("Unauthenticated")
      throw new Error("Unauthenticated")
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
