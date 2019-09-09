const admin = require("./admin")
const teacher = require("./teacher")
const student = require("./student")
const question = require("./question")
const exam = require("./exam")
const answer = require("./answer")
const upload = require("./upload")
const subs = require("./subscription")

const {
  findAdmin,
  findTeachers,
  findTeacher,
  findExams,
  findExam,
  findQuestions,
  findQuestion,
  findStudents,
  findStudent,
  findAnswers,
  findAnswer,
  findResults,
  findResult
} = require("./merger")

const rootResolver = {
  Query: {
    get_all_admins: admin.get_all_admins,
    get_all_teachers: teacher.get_all_teachers,
    get_all_students: student.get_all_students,
    get_assigned_student: student.get_assigned_student,
    get_question_by_exam: question.get_question_by_exam,
    get_all_exams: exam.get_all_exams,
    get_exam_by_id: exam.get_exam_by_id,
    get_teacher_by_id: teacher.get_teacher_by_id,
    get_student_by_id: student.get_student_by_id,
    get_answer_by_students: answer.get_answer_by_students,
    get_logged_in_students: student.get_logged_in_students,
    adminLogin: admin.adminLogin,
    teacherLogin: teacher.teacherLogin,
    studentLogin: student.studentLogin,
    logoutStudent: student.logoutStudent,
    quitExam: student.quitExam,
  },
  Mutation: {
    addAdmin: admin.addAdmin,
    changeAdminPassword: admin.changeAdminPassword,
    changeTeacherPassword: teacher.changeTeacherPassword,
    addTeacher: teacher.addTeacher,
    addMultipleTeacher: teacher.addMultipleTeacher,
    addMultipleStudent: student.addMultipleStudent,
    removeTeacher: teacher.removeTeacher,
    updateTeacher: teacher.updateTeacher,
    updateTeacherStatus: teacher.updateTeacherStatus,
    addStudent: student.addStudent,
    removeStudent: student.removeStudent,
    updateStudent: student.updateStudent,
    assign_students_to_exam: student.assign_students_to_exam,
    restrictStudentByID: student.restrictStudentByID,
    restrictAndSubmitStudentByID: student.restrictAndSubmitStudentByID,
    temporaryRestrictStudentByID: student.temporaryRestrictStudentByID,
    permanentRestrictStudentByID: student.permanentRestrictStudentByID,
    permitStudentByID: student.permitStudentByID,
    updateExam: exam.updateExam,
    changeExamStatus: exam.changeExamStatus,
    addExam: exam.addExam,
    removeExam: exam.removeExam,
    stopExam: exam.stopExam,
    addQuestion: question.addQuestion,
    uploadFile: upload.uploadFile,
    writeAnswer: answer.writeAnswer,
    getAnswer: answer.getAnswer
  },
  Subscription: {
    count: subs.count,
    onExamStop: subs.onExamStop,
    studentLoggedIn: subs.studentLoggedIn,
    studentLoggedOut: subs.studentLoggedOut,
    studentQuitWithoutSubmit: subs.studentQuitWithoutSubmit,
    permanentStudentRestrict: subs.permanentStudentRestrict,
    temporaryStudentRestrict: subs.temporaryStudentRestrict
  },
  Admin: {
    myTeachers(parent) { return findTeachers(parent.myTeachers) }
  },
  Teacher: {
    myAdmin(parent) { return findAdmin(parent.myAdmin) },
    myExams(parent) { return findExams(parent.myExams) },
    myStudents(parent) { return findStudents(parent.myStudents) }
  },
  Exam: {
    students(parent) { return findStudents(parent.students) },
    question(parent) { return findQuestion(parent.question) },
    teacher(parent) { return findTeacher(parent.teacher) },
    result(parent) { return findResult(parent.result) },
    loggedInStudents(parent) { return findStudents(parent.loggedInStudents) },
    restrictedStudents(parent) { return findStudents(parent.restrictedStudents) },
    temporaryRestrictedStudents(parent) { return findStudents(parent.temporaryRestrictedStudents) },
    submittedStudents(parent) { return findStudents(parent.submittedStudents) }
  },
  Student: {
    myExams(parent) { return findExams(parent.myExams) },
    myAnswers(parent) { return findAnswers(parent.myAnswers) },
    myResults(parent) { return findResults(parent.myResults) },
    myTeacher(parent) { return findTeacher(parent.myTeacher) }
  },
  Question: {
    exam(parent) { return findExam(parent.exam) }
  },
  Answer: {
    student(parent) { return findStudent(parent.student) },
    question(parent) { return findQuestion(parent.question) },
    exam(parent) { return findExam(parent.exam) }
  },
  Result: {
    student(parent) { return findStudent(parent.student) },
    exam(parent) { return findExam(parent.exam) }
  }
}

module.exports = rootResolver
