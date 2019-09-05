const jwt = require("jsonwebtoken")

const Student = require("../../models/student")
const Teacher = require("../../models/teacher")
const Answer = require("../../models/answer")
const Question = require("../../models/question")
const Exam = require("../../models/exam")
const isAuth = require("../../middleware/is-auth")

module.exports = {
  addStudent: async (parent, args, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }
    const { name, password, studentID, teacherID, status } = args.studentInput
    try {
      const s = new Student({
        name,
        status,
        password,
        studentID,
        myTeacher: teacherID
      })
      const student = await s.save()
      const teacher = await Teacher.findById(teacherID)
      await teacher.myStudents.push(student)
      await teacher.save()
      return {
        ...student._doc,
        _id: student.id,
        date: new Date(student._doc.date).toISOString()
      }
    } catch (ex) {
      return new Error("Couldnot find any Students " + ex)
    }
  },
  get_all_students: async (parent, args, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const students = await Student.find({ myTeacher: args.teacherID })
      return students.map(student => {
        return {
          ...student._doc,
          _id: student.id,
          date: new Date(student._doc.date).toISOString()
        }
      })
    } catch (err) {
      return new Error("Couldnot find a Student " + err)
    }
  },
  get_assigned_student: async (parent, { teacherID, examID }, ctx, info) => {
    console.log("reached get assigned students")
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const teacher = await Teacher.findOne({ _id: teacherID })
      const exam = await Exam.findOne({ _id: examID })
      const assignedStudents = await Student.find({ _id: { $in: exam["students"] } })
      return assignedStudents.map(student => {
        return {
          ...student._doc,
          _id: student.id,
          date: new Date(student._doc.date).toISOString()
        }
      })
    } catch (err) {
      return new Error("Couldnot find a Student " + err)
    }
  },
  removeStudent: async (parent, { studentID, teacherID }, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const student = await Student.findById(studentID)
      const teacher = await Teacher.findById(teacherID)
      if (!student.myTeacher.equals(teacher._id)) {
        throw new Error("This Student doesnt belongs to you")
      }
      teacher.myStudents.pop(student)
      await teacher.save()
      const removedStudent = await Student.findByIdAndRemove(studentID)
      return removedStudent
    } catch (err) {
      throw new Error("server error while deleting a student" + err)
    }
  },
  updateStudent: async (
    parent,
    {
      studentUpdateInput: {
        _id,
        teacherID,
        name,
        studentID,
        prevPassword,
        newPassword,
        status
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
      const student = await Student.findById(_id)
      const teacher = await Teacher.findById(teacherID)
      if (!student.myTeacher.equals(teacher._id)) {
        throw new Error("This Student doesnt belongs to you")
      }
      student.name = name
      student.studentID = studentID
      student.status = status
      if (
        prevPassword !== "" &&
        newPassword !== "" &&
        prevPassword === newPassword
      ) {
        student.password = newPassword
      }
      const updatedStudent = await student.save()
      return updatedStudent
    } catch (err) {
      throw new Error("server error while updating a student" + err)
    }
  },
  assign_students_to_exam: async (
    parent,
    { assignInput: { examID, teacherID, studentIDs } },
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
      const exam = await Exam.findById(examID)
      if (!exam) {
        return new Error("Couldn't find any exam")
      }
      const students = await Student.find({
        _id: { $in: studentIDs }
      })
      if (!students) {
        return new Error("Could not find any students")
      }
      exam.students = undefined
      await exam.save()
      exam.students = studentIDs
      await exam.save()
      return true
    } catch (err) {
      return new Error("Couldnot assign students " + err)
    }
  },
  studentLogin: async (
    parent,
    { examCode, examPassword, studentID, studentPassword },
    { pubsub },
    info
  ) => {
    try {
      const exam = await Exam.findOne({ code: examCode })
      const student = await Student.findOne({ studentID: studentID })

      if (!student) {
        throw new Error("Student does not exists")
      }
      if (!exam) {
        throw new Error("Exam does not exists")
      }

      if (studentPassword !== student.password) {
        throw new Error("Student Password is incorrect")
      }
      if (examPassword !== exam.password) {
        throw new Error("Exam Password is incorrect")
      }
      if (!exam.students.includes(student._id)) {
        return new Error("You are not permitted for this exam")
      }
      if (exam.restrictedStudents.includes(student._id)) {
        return new Error("You were restricted for this exam")
      }
      if (exam.temporaryRestrictedStudents.includes(student._id)) {
        return new Error(`You were temporarily restricted for this exam.
                          Request teacher to permit you again`)
      }
      if (exam.submittedStudents.includes(student._id)) {
        return new Error("You have already taken this exam")
      }
      exam.loggedInStudents.push(student)
      await exam.save()
      const token = jwt.sign(
        {
          studentID: student.id,
          name: student.name,
          exam_id: exam.id,
          accessType: student.accessType
        },
        "Iamkira1540",
        {
          expiresIn: "3h"
        }
      )
      pubsub.publish(`LOGIN ${exam.id}`, {
        studentLoggedIn: student
      })
      return {
        token: token
      }
    } catch (ex) {
      throw new Error(ex)
    }
  },
  get_student_by_id: async (parent, { studentID }, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 3) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      let student = await Student.findOne({ _id: studentID })
      return {
        ...student._doc,
        _id: student.id,
        password: null,
        date: new Date(student._doc.date).toISOString()
      }
    } catch (ex) {
      throw new Error("Can not get any students" + ex)
    }
  },
  logoutStudent: async (parent, { studentID, examID }, { request, pubsub }, info) => {
    const authData = isAuth(request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 3) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const student = await Student.findOne({ _id: studentID })
      const exam = await Exam.findOne({ _id: examID })
      exam.loggedInStudents.pop(student)
      exam.submittedStudents.push(student)
      await exam.save()
      const answer = await Answer.findOne({ student: studentID, exam: examID })
      const question = await Question.findById(exam.question)
      const answers = answer.answers
      const questions = question.questions
      let marks = 0
      for (let i = 0; i < questions.length; i++) {
        for (let j = 0; j < 4; j++) {
          if (questions[i]["options"][j]["answer"] === true) {
            for (let k = 0; k < answers.length; k++) {
              if (answers[k]["questionIndex"] === questions[i]["id"]
                && answers[k]["studentAnswer"] === (j + 1)) {
                marks += questions[i]["mark"]
              }
            }
          }
        }
      }
      answer.myMarks = marks
      await answer.save()
      pubsub.publish(`LOGOUT ${exam.id}`, {
        studentLoggedOut: student
      })
      return true
    } catch (ex) {
      throw new Error("Error Logging you out " + ex)
    }
  },
  get_logged_in_students: async (parent, { examID }, ctx, info) => { },
  addMultipleStudent: async (parent, { teacherID, examID, multipleStudentInput }, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const students = multipleStudentInput.map(t => {
        return {
          name: t.name,
          password: t.password,
          studentID: t.studentID,
          status: t.status,
          myTeacher: teacherID,
          myExams: [examID]
        }
      })
      const newStudents = await Student.insertMany(students);
      const teacher = await Teacher.findById(teacherID)
      newStudents.map(s => {
        teacher.myStudents.push(s)
      })
      await teacher.save()
      return newStudents
    } catch (ex) {
      throw new Error("Couldn't add multiple students" + ex)
    }
  },
  restrictStudentByID: async (parent, { studentID, teacherID, examID }, { request, pubsub }, info) => {
    const authData = isAuth(request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }

    try {
      const student = await Student.findOne({ _id: studentID })
      const teacher = await Teacher.findOne({ _id: teacherID })
      const exam = await Exam.findOne({ _id: examID })
      if (!teacher.myStudents.includes(student._id)) {
        throw new Error("Student Doesnt belong to you")
      }
      if (!exam.students.includes(student._id)) {
        throw new Error("Student was not assigned to this exam")
      }
      if (exam.restrictedStudents.includes(student._id)) {
        throw new Error("Student was restricted to this exam earlier")
      }
      if (exam.loggedInStudents.includes(student._id)) {
        exam.loggedInStudents.pop(student)
      }
      exam.restrictedStudents.push(student)
      await exam.save()
      return true
    } catch (ex) {
      throw new Error("Couldnot restrict the student" + ex)
    }
  },
  permitStudentByID: async (parent, { studentID, teacherID, examID }, { request }, info) => {
    const authData = isAuth(request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }

    try {
      const student = await Student.findOne({ _id: studentID })
      const teacher = await Teacher.findOne({ _id: teacherID })
      const exam = await Exam.findOne({ _id: examID })
      if (!teacher.myStudents.includes(student._id)) {
        throw new Error("Student Doesnt belong to you")
      }
      if (!exam.students.includes(student._id)) {
        throw new Error("Student was not assigned to this exam")
      }
      if (exam.restrictedStudents.includes(student._id)) {
        exam.restrictedStudents.pop(student)
      }
      if (exam.temporaryRestrictedStudents.includes(student._id)) {
        exam.temporaryRestrictedStudents.pop(student)
      }
      if (exam.submittedStudents.includes(student._id)) {
        exam.submittedStudents.pop(student)
      }
      await exam.save()
      return true
    } catch (ex) {
      throw new Error("Couldnot permit the student" + ex)
    }
  },
  // case 2
  restrictAndSubmitStudentByID: async (parent, { studentID, teacherID, examID }, { request, pubsub }, info) => {
    const authData = isAuth(request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const student = await Student.findOne({ _id: studentID })
      const teacher = await Teacher.findOne({ _id: teacherID })
      const exam = await Exam.findOne({ _id: examID })
      if (!teacher.myStudents.includes(student._id)) {
        throw new Error("Student Doesnt belong to you")
      }
      if (!exam.students.includes(student._id)) {
        throw new Error("Student was not assigned to this exam")
      }
      if (exam.restrictedStudents.includes(student._id)) {
        throw new Error("Student was restricted to this exam earlier")
      }
      if (exam.loggedInStudents.includes(student._id)) {
        exam.loggedInStudents.pop(student)
      }
      exam.restrictedStudents.push(student)
      pubsub.publish(`RESTRICT_TEMPORARY ${student._id}`, {
        temporaryStudentRestrict: student
      })
      await exam.save()
      return true
    } catch (ex) {
      throw new Error("Couldnot restrict and submit the student" + ex)
    }
  },
  // case 1
  temporaryRestrictStudentByID: async (parent, { studentID, teacherID, examID }, { request, pubsub }, info) => {
    const authData = isAuth(request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const student = await Student.findOne({ _id: studentID })
      const teacher = await Teacher.findOne({ _id: teacherID })
      const exam = await Exam.findOne({ _id: examID })
      if (!teacher.myStudents.includes(student._id)) {
        throw new Error("Student Doesnt belong to you")
      }
      if (!exam.students.includes(student._id)) {
        throw new Error("Student was not assigned to this exam")
      }
      if (exam.restrictedStudents.includes(student._id)) {
        throw new Error("Student was restricted to this exam earlier")
      }
      if (exam.loggedInStudents.includes(student._id)) {
        exam.loggedInStudents.pop(student)
      }
      exam.temporaryRestrictedStudents.push(student)
      await exam.save()
      pubsub.publish(`RESTRICT_TEMPORARY ${student._id}`, {
        temporaryStudentRestrict: student
      })
      return true
    } catch (ex) {
      throw new Error("Couldnot temporary restrict the student" + ex)
    }
  },
  // case 3
  permanentRestrictStudentByID: async (parent, { studentID, teacherID, examID }, { request, pubsub }, info) => {
    const authData = isAuth(request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const student = await Student.findOne({ _id: studentID })
      const teacher = await Teacher.findOne({ _id: teacherID })
      const exam = await Exam.findOne({ _id: examID })
      if (!teacher.myStudents.includes(student._id)) {
        throw new Error("Student Doesnt belong to you")
      }
      if (!exam.students.includes(student._id)) {
        throw new Error("Student was not assigned to this exam")
      }
      if (exam.restrictedStudents.includes(student._id)) {
        throw new Error("Student was restricted to this exam earlier")
      }
      if (exam.loggedInStudents.includes(student._id)) {
        exam.loggedInStudents.pop(student)
      }
      if (exam.submittedStudents.includes(student._id)) {
        exam.submittedStudents.pop(student)
      }
      if (exam.temporaryRestrictedStudents.includes(student._id)) {
        exam.temporaryRestrictedStudents.pop(student)
      }
      exam.restrictedStudents.push(student)
      await exam.save()
      pubsub.publish(`RESTRICT_PERMANENT ${student._id}`, {
        permanentStudentRestrict: student
      })
      return true
    } catch (ex) {
      throw new Error("Couldnot temporary restrict the student" + ex)
    }
  },
  quitExam: async (parent, { examID, studentID }, { request, pubsub }, info) => {
    const authData = isAuth(request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 3) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const student = await Student.findOne({ _id: studentID })
      const exam = await Exam.findOne({ _id: examID })
      const answer = await Answer.findOne({ student: studentID, exam: examID })
      if (!exam) throw new Error("exam not found")
      if (!student) throw new Error("student not found")
      exam.loggedInStudents.pop(student)
      student["myAnswers"].pop(answer)
      await student.save()
      await Answer.findByIdAndRemove(answer.id)
      await exam.save()
      pubsub.publish(`QUIT ${exam.id}`, {
        studentQuitWithoutSubmit: student
      })
      return true
    } catch (ex) {
      throw new Error("Error Logging you out " + ex)
    }
  }
}
