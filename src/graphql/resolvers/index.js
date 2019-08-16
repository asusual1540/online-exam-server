const admin = require("./admin")
const teacher = require("./teacher")
const student = require("./student")
const question = require("./question")
const exam = require("./exam")
const answer = require("./answer")

const rootResolver = {
  Query: {
    get_all_admins: admin.get_all_admins,
    get_all_teachers: teacher.get_all_teachers,
    get_all_students: student.get_all_students,
    get_question_by_exam: question.get_question_by_exam,
    get_all_exams: exam.get_all_exams,
    get_exam_by_code: exam.get_exam_by_code,
    adminLogin: admin.adminLogin,
    teacherLogin: teacher.teacherLogin,
    studentLogin: student.studentLogin
  },
  Mutation: {
    addAdmin: admin.addAdmin,
    changeAdminPassword: admin.changeAdminPassword,
    changeTeacherPassword: teacher.changeTeacherPassword,
    addTeacher: teacher.addTeacher,
    removeTeacher: teacher.removeTeacher,
    updateTeacher: teacher.updateTeacher,
    addStudent: student.addStudent,
    removeStudent: student.removeStudent,
    updateStudent: student.updateStudent,
    assign_students_to_exam: student.assign_students_to_exam,
    updateExam: exam.updateExam,
    changeExamStatus: exam.changeExamStatus,
    addExam: exam.addExam,
    removeExam: exam.removeExam,
    addQuestion: question.addQuestion
  }
}

module.exports = rootResolver
