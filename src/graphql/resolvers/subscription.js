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

      return pubsub.asyncIterator(`LOGIN ${exam_id}`)
    }
  },
  studentLoggedOut: {
    async subscribe(parent, { exam_id }, { pubsub }, info) {
      const exam = await Exam.findOne({ _id: exam_id })

      if (!exam) {
        throw new Error("Exam not found")
      }

      return pubsub.asyncIterator(`LOGOUT ${exam_id}`)
    }
  },
  permanentStudentRestrict: {
    async subscribe(parent, { exam_id, studentID }, { pubsub }, info) {
      const exam = await Exam.findOne({ _id: exam_id })
      const student = await Student.findOne({ _id: studentID })
      if (!exam) {
        throw new Error("Exam not found")
      }
      if (!student) {
        throw new Error("Student not found")
      }
      if (!exam.students.includes(student._id)) {
        throw new Error("Student isnt yours to kick")
      }

      return pubsub.asyncIterator(`RESTRICT_PERMANENT ${student._id}`)
    }
  },
  temporaryStudentRestrict: {
    async subscribe(parent, { exam_id, studentID }, { pubsub }, info) {
      const exam = await Exam.findOne({ _id: exam_id })
      const student = await Student.findOne({ _id: studentID })
      if (!exam) {
        throw new Error("Exam not found")
      }
      if (!student) {
        throw new Error("Student not found")
      }
      if (!exam.students.includes(student._id)) {
        throw new Error("Student isnt yours to kick")
      }

      return pubsub.asyncIterator(`RESTRICT_TEMPORARY ${student._id}`)
    }
  },
  studentQuitWithoutSubmit: {
    async subscribe(parent, { exam_id }, { pubsub }, info) {
      const exam = await Exam.findOne({ _id: exam_id })

      if (!exam) {
        throw new Error("Exam not found")
      }

      return pubsub.asyncIterator(`QUIT ${exam_id}`)
    }
  },
  onExamStop: {
    async subscribe(parent, { exam_id }, { pubsub }, info) {
      const exam = await Exam.findOne({ _id: exam_id })

      if (!exam) {
        throw new Error("Exam not found")
      }

      return pubsub.asyncIterator(`STOP_EXAM ${exam_id}`)
    }
  }
}
