const bcrypt = require("bcrypt")
const Exam = require("../../models/exam")
const Teacher = require("../../models/teacher")
const Student = require("../../models/student")
const isAuth = require("../../middleware/is-auth")

module.exports = {
  addExam: async (parent, args, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
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
        date: new Date(createdExam._doc.date).toISOString()
      }
    } catch (ex) {
      return new Error("Couldnot add any exams " + ex)
    }
  },
  get_all_exams: async (parent, { teacherID, semester, year }, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const exams = await Exam.find({
        teacher: teacherID
      })
      return exams.map(exam => {
        return {
          ...exam._doc,
          _id: exam.id,
          date: new Date(exam._doc.date).toISOString()
        }
      })
    } catch (err) {
      return new Error("Couldnot find a Exam " + err)
    }
  },
  get_exam_by_id: async (parent, { examID }, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    try {
      const exam = await Exam.findById(examID)
      return {
        ...exam._doc,
        _id: exam.id,
        date: new Date(exam._doc.date).toISOString()
      }
    } catch (err) {
      return new Error("Couldnot find a Exam " + err)
    }
  },
  removeExam: async (parent, { examID, teacherID }, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
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
    parent,
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
    ctx,
    info
  ) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
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
  changeExamStatus: async (parent, { status, examID }, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const exam = await Exam.find({ _id: examID })
      if (!exam) return
      exam[0].status = status
      await exam[0].save()
      return true
    } catch (ex) {
      throw new Error("Could not change status of the exam" + ex)
    }
  },
  stopExam: async (parent, { examID, teacherID }, { request, pubsub }, info) => {
    const authData = isAuth(request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const exam = await Exam.findById(examID)
      const teacher = await Teacher.findById(teacherID)
      if (!exam.teacher.equals(teacher._id)) {
        throw new Error("This Exam doesnt belongs to you")
      }
      exam.status = false
      await exam.save()

      pubsub.publish(`STOP_EXAM ${exam.id}`, {
        onExamStop: true
      })

      return true
    } catch (err) {
      throw new Error("Could not stop the Exam" + err)
    }
  }
}
