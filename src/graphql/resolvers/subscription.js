const Exam = require("../../models/exam")
const Student = require("../../models/student")

module.exports = {
  count: {
    subscribe(parent, args, { pubsub }, info) {
      let count = 0
      setInterval(() => {
        count++
        pubsub.publish("COUNT", {
          count: count
        })
      }, 1000)
      return pubsub.asyncIterator("COUNT")
    }
  },
  studentLoggedIn: {
    async subscribe(parent, { exam_id }, { pubsub }, info) {
      const exam = await Exam.findOne({ _id: exam_id })

      if (!exam) {
        throw new Error("Exam not found")
      }

      return pubsub.asyncIterator(`EXAM ${exam_id}`)
    }
  }
}
