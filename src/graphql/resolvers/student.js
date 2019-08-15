const jwt = require("jsonwebtoken")

const Student = require("../../models/student")
const Teacher = require("../../models/teacher")
const Exam = require("../../models/exam")

const {
  findExams,
  findAnswers,
  findResults,
  findTeacher,
  findStudents
} = require("../resolvers/merger")

module.exports = {
  addStudent: async (args, req) => {
    if (req.isAuth === false || req.accessType !== 2) {
      console.log("Unauthenticated")
      throw new Error("Unauthenticated")
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
        date: new Date(student._doc.date).toISOString(),
        myExams: findExams.bind(this, student._doc.myExams),
        myAnswers: findAnswers.bind(this, student._doc.myAnswers),
        myResults: findResults.bind(this, student._doc.myResults),
        myTeacher: findTeacher.bind(this, student._doc.myTeacher)
      }
    } catch (ex) {
      return new Error("Couldnot find any Students " + ex)
    }
  },
  get_all_students: async args => {
    try {
      const students = await Student.find({ myTeacher: args.teacherID })
      return students.map(student => {
        return {
          ...student._doc,
          _id: student.id,
          date: new Date(student._doc.date).toISOString(),
          myExams: findExams.bind(this, student._doc.myExams),
          myAnswers: findAnswers.bind(this, student._doc.myAnswers),
          myResults: findResults.bind(this, student._doc.myResults),
          myTeacher: findTeacher.bind(this, student._doc.myTeacher)
        }
      })
    } catch (err) {
      return new Error("Couldnot find a Student " + err)
    }
  },
  removeStudent: async ({ studentID, teacherID }, req) => {
    try {
      if (req.isAuth === false || req.accessType !== 2) {
        throw new Error("Unauthenticated")
      }
      const student = await Student.findById(studentID)
      const teacher = await Teacher.findById(teacherID)
      if (!student.myTeacher.equals(teacher._id)) {
        throw new Error("This Student doesnt belongs to you")
      }
      const removedStudent = await Student.findByIdAndRemove(studentID)
      return removedStudent
    } catch (err) {
      throw new Error("server error while deleting a student" + err)
    }
  },
  updateStudent: async (
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
    req
  ) => {
    try {
      if (req.isAuth === false || req.accessType !== 2) {
        throw new Error("Unauthenticated")
      }
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
    { assignInput: { examID, teacherID, studentIDs } },
    req
  ) => {
    if (req.isAuth === false || req.accessType !== 2) {
      throw new Error("Unauthenticated")
    }
    try {
      const exam = await Exam.findById(examID)
      if (!exam) {
        console.log("Couldn't find any exam")
        return
      }
      const teacher = await Teacher.find({ _id: teacherID })
      const students_of_teacher = await Student.find({
        _id: { $in: teacher[0].myStudents }
      })
      await Promise.all(
        students_of_teacher.map(model => {
          if (studentIDs.includes(`${model._id}`)) {
            model.status = true
            if (!model.myExams.includes(exam._id)) {
              model.myExams.push(exam)
            } else {
              console.log("Already assigned this student")
            }
          } else {
            model.status = false
          }
          return model.save()
        })
      )
      return true
    } catch (err) {
      return new Error("Couldnot assign students " + err)
    }
  },
  studentLogin: async ({
    examCode,
    examPassword,
    studentID,
    studentPassword
  }) => {
    try {
      const student = await Student.findOne({ studentID: studentID })
      const exam = await Exam.findOne({ code: examCode })
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
      const token = jwt.sign(
        {
          studentID: student.id,
          examCode: exam.code,
          accessType: student.accessType
        },
        "Iamkira1540",
        {
          expiresIn: "2h"
        }
      )
      return {
        token: token
      }
    } catch (ex) {
      throw new Error(ex)
    }
  }
}
