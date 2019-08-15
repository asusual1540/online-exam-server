const bcrypt = require("bcrypt")
const Exam = require("../../models/exam")
const Teacher = require("../../models/teacher")
const Student = require("../../models/student")

const {
  findQuestion,
  findStudents,
  findTeacher,
  findResult
} = require("../resolvers/merger")

module.exports = {
  addExam: async (args, req) => {
    if (req.isAuth === false || req.accessType !== 2) {
      throw new Error("Unauthenticated")
    }
    try {
      const {
        title,
        code,
        password,
        totalMarks: totalMarks = 0,
        examDate: examDate = "",
        totalTimeInMin: totalTimeInMin = 0,
        status: status = false,
        course: course = {},
        teacher: teacher = "",
        semester: semester = "SPRING",
        year: year = 2019
      } = args.examInput || {}
      const exam = new Exam({
        title,
        code,
        password,
        totalMarks,
        examDate,
        totalTimeInMin,
        status,
        course,
        teacher,
        semester,
        year
      })
      const newTeacher = await Teacher.findById(teacher)
      if (!newTeacher) {
        throw new Error("No teacher")
      }
      const createdExam = await exam.save()
      await newTeacher.myExams.push(createdExam)
      await newTeacher.save()
      return {
        ...createdExam._doc,
        _id: createdExam.id,
        date: new Date(createdExam._doc.date).toISOString(),
        question: findQuestion.bind(this, createdExam._doc.question),
        students: findStudents.bind(this, createdExam._doc.students),
        teacher: findTeacher.bind(this, createdExam._doc.teacher),
        result: findResult.bind(this, createdExam._doc.result)
      }
    } catch (ex) {
      return new Error("Couldnot add any exams " + ex)
    }
  },
  get_all_exams: async ({ teacherID, semester, year }) => {
    try {
      const exams = await Exam.find({
        teacher: teacherID,
        semester: semester,
        year: year
      })
      return exams.map(exam => {
        return {
          ...exam._doc,
          date: new Date(exam._doc.date).toISOString(),
          question: findQuestion.bind(this, exam.question),
          students: findStudents.bind(this, exam.students),
          teacher: findTeacher.bind(this, exam.teacher),
          result: findResult.bind(this, exam.result)
        }
      })
    } catch (err) {
      return new Error("Couldnot find a Exam " + err)
    }
  },
  removeExam: async ({ examID, teacherID }, req) => {
    if (req.isAuth === false || req.accessType !== 2) {
      throw new Error("Unauthenticated")
    }
    try {
      const exam = await Exam.findById(examID)
      const teacher = await Teacher.findById(teacherID)
      if (!exam.teacher.equals(teacher._id)) {
        throw new Error("This Exam doesnt belongs to you")
      }
      const removedExam = await Exam.findByIdAndRemove(examID)
      return removedExam
    } catch (err) {
      throw new Error("server error while removing an Exam" + err)
    }
  },
  updateExam: async (
    {
      examUpdateInput: {
        _id,
        title,
        code,
        prevPassword,
        newPassword,
        status,
        totalMarks,
        totalTimeInMin,
        semester,
        year,
        examDate,
        teacherID,
        course: { title: courseTitle, code: courseCode }
      }
    },
    req
  ) => {
    if (req.isAuth === false || req.accessType !== 2) {
      throw new Error("Unauthenticated")
    }
    try {
      const exam = await Exam.findById(_id)
      const teacher = await Teacher.findById(teacherID)
      if (!exam.teacher.equals(teacher._id)) {
        throw new Error("This Exam doesnt belongs to you")
      }
      exam.title = title
      exam.code = code
      exam.examDate = examDate
      exam.totalMarks = totalMarks
      exam.totalTimeInMin = totalTimeInMin
      exam.status = status
      exam.semester = semester
      exam.year = year
      exam.course.code = courseCode
      exam.course.title = courseTitle

      if (
        prevPassword !== "" &&
        newPassword !== "" &&
        prevPassword === newPassword
      ) {
        exam.password = newPassword
      }
      const updatedExam = await exam.save()
      return updatedExam
    } catch (err) {
      throw new Error("server error while updating a Exam" + err)
    }
  },
  changeExamStatus: async ({ status, examID }, req) => {
    if (req.isAuth === false || req.accessType !== 2) {
      throw new Error("Unauthenticated")
    }
    try {
      const exam = await Exam.find({ _id: examID })
      console.log(exam)
      if (!exam) return
      exam[0].status = status
      await exam[0].save()
      return true
    } catch (ex) {
      throw new Error("Could not change status of the exam" + ex)
    }
  },
  get_exam_by_code: async ({ examCode }, req) => {
    // if (req.isAuth === false || req.accessType !== 2) {
    //   throw new Error("Unauthenticated")
    // }
    try {
      let exam = await Exam.find({ code: examCode })
      exam = exam[0]
      console.log(exam)
      return {
        ...exam._doc,
        date: new Date(exam._doc.date).toISOString(),
        question: findQuestion.bind(this, exam.question),
        students: findStudents.bind(this, exam.students),
        teacher: findTeacher.bind(this, exam.teacher),
        result: findResult.bind(this, exam.result)
      }
    } catch (ex) {
      throw new Error("Could not find any exam " + ex)
    }
  }
}
