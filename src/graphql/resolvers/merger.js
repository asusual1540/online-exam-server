const Admin = require("../../models/admin")
const Teacher = require("../../models/teacher")
const Exam = require("../../models/exam")
const Question = require("../../models/question")
const Answer = require("../../models/answer")
const Result = require("../../models/result")
const Student = require("../../models/student")

async function findAdmin(adminID) {
  try {
    const admin = await Admin.findById(adminID)
    return {
      ...admin._doc,
      _id: admin.id,
      password: null,
      myTeachers: findTeachers.bind(this, admin._doc.myTeachers)
    }
  } catch (err) {
    return new Error("Couldnot find an admin from Merger" + err)
  }
}

async function findTeachers(teacherIDS) {
  try {
    const teachers = await Teacher.find({ _id: { $in: teacherIDS } })
    return teachers.map(teacher => {
      return {
        ...teacher._doc,
        _id: teacher.id,
        date: new Date(teacher._doc.date).toISOString(),
        myAdmin: findAdmin.bind(this, teacher._doc.myAdmin),
        myExams: findExams.bind(this, teacher._doc.myExams),
        myStudents: findStudents.bind(this, teacher._doc.myStudents)
      }
    })
  } catch (err) {
    return new Error("Couldnot find an Teachers " + err)
  }
}

async function findTeacher(teacherID) {
  try {
    const teacher = await Teacher.findById(teacherID)
    return {
      ...teacher._doc,
      _id: teacher.id,
      myAdmin: findAdmin.bind(this, teacher._doc.myAdmin),
      myExams: findExams.bind(this, teacher._doc.myExams),
      myStudents: findStudents.bind(this, teacher._doc.myStudents)
    }
  } catch (err) {
    return new Error("Couldnot find an Teacher from merger **" + err)
  }
}

async function findExams(examIDs) {
  try {
    const exams = await Exam.find({ _id: { $in: examIDs } })
    return exams.map(exam => {
      return {
        ...exam._doc,
        _id: exam.id,
        date: new Date(exam._doc.date).toISOString(),
        question: findQuestion.bind(this, exam._doc.question),
        students: findStudents.bind(this, exam._doc.students),
        teacher: findTeacher.bind(this, exam._doc.teacher),
        result: findResult.bind(this, exam._doc.result)
      }
    })
  } catch (err) {
    return new Error("Couldnot find an exams " + err)
  }
}
async function findExam(examID) {
  try {
    const exam = await Exam.findById(examID)
    return {
      ...exam._doc,
      _id: exam.id,
      question: findQuestion.bind(this, exam._doc.question),
      teacher: findTeacher.bind(this, exam._doc.teacher),
      result: findResult.bind(this, exam._doc.result),
      students: findStudents.bind(this, exam._doc.students)
    }
  } catch (err) {
    return new Error("Couldnot find an exam " + err)
  }
}

async function findQuestions(questionIDs) {
  try {
    const questions = await Question.find({ _id: { $in: questionIDs } })
    return questions.map(question => {
      return {
        ...question._doc,
        _id: question.id,
        date: new Date(question._doc.date).toISOString(),
        exam: findExam.bind(this, question.exam)
      }
    })
  } catch (err) {
    return new Error("Couldnot find Questions " + err)
  }
}

async function findQuestion(questionID) {
  try {
    const question = await Question.findById(questionID)
    return {
      ...question._doc,
      _id: question.id,
      exam: findExam.bind(this, question._doc.exam)
    }
  } catch (err) {
    return new Error("Couldnot find a question " + err)
  }
}

async function findStudents(studentIDs) {
  try {
    const students = await Student.find({ _id: { $in: studentIDs } })
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
    return new Error("Couldnot find students " + err)
  }
}

async function findStudent(studentID) {
  try {
    const student = await Student.findById(studentID)
    return {
      ...student._doc,
      _id: student.id,
      date: new Date(student._doc.date).toISOString(),
      myExams: findExams.bind(this, student._doc.myExams),
      myAnswers: findAnswers.bind(this, student._doc.myAnswers),
      myResults: findResults.bind(this, student._doc.myResults),
      myTeacher: findTeacher.bind(this, student._doc.myTeacher)
    }
  } catch (err) {
    return new Error("Couldnot find a student " + err)
  }
}

async function findAnswers(answerIDs) {
  try {
    const answers = await Answer.find({ _id: { $in: answerIDs } })
    return answers.map(answer => {
      return {
        ...answer._doc,
        _id: answer.id,
        date: new Date(answer._doc.date).toISOString(),
        student: findStudent.bind(this, answer._doc.student),
        question: findQuestion.bind(this, answer._doc.question),
        exam: findExam.bind(this, answer._doc.exam)
      }
    })
  } catch (err) {
    return new Error("Couldnot find an answers " + err)
  }
}

async function findAnswer(answerID) {
  try {
    const answer = await Answer.findById(answerID)
    return {
      ...answer._doc,
      _id: answer.id,
      date: new Date(answer._doc.date).toISOString(),
      student: findStudent.bind(this, answer._doc.student),
      question: findQuestion.bind(this, answer._doc.question),
      exam: findExam.bind(this, answer._doc.exam)
    }
  } catch (err) {
    return new Error("Couldnot find an exam " + err)
  }
}

async function findResults(resultIDs) {
  try {
    const results = await Result.find({ _id: { $in: resultIDs } })
    return results.map(result => {
      return {
        ...result._doc,
        _id: result.id,
        date: new Date(result._doc.date).toISOString(),
        student: findStudent.bind(this, result._doc.student),
        exam: findExam.bind(this, result._doc.exam)
      }
    })
  } catch (err) {
    return new Error("Couldnot find Results " + err)
  }
}

async function findResult(resultID) {
  try {
    const result = await Result.findById(resultID)
    return {
      ...result._doc,
      _id: result.id,
      date: new Date(result._doc.date).toISOString(),
      student: findStudent.bind(this, result._doc.student),
      exam: findExam.bind(this, result._doc.exam)
    }
  } catch (err) {
    return new Error("Couldnot find a Result " + err)
  }
}

module.exports = {
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
}
