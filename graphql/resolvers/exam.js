const bcrypt = require('bcrypt')
const Exam = require('../../models/exam')
const Teacher = require('../../models/teacher')
const Student = require('../../models/student')

const { findQuestion, findStudents, findTeacher, findResult } = require('../resolvers/merger')

module.exports = {
    addExam: async (args, req) => {
        if (req.isAuth === false || req.accessType !== 2) {
            throw new Error("Unauthenticated");
        }
        try {
            const {
                title, code, password,
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
                title, code, password, totalMarks, examDate,
                totalTimeInMin, status, course, teacher, semester, year
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
        console.log(semester, year)
        try {
            const exams = await Exam.find({ teacher: teacherID, semester: semester, year: year })
            console.log(exams)
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
    assign_students_to_exam: async () => {
        console.log("Entered assign_students_to_exam")
        try {
            const exam = await Exam.findById("5d0e74cf9c3e8f1f00c2404f")
            if (!exam) {
                console.log("Couldn't find any exam")
                return
            }
            console.log(exam)
            const studentIDs = ["5d0e79445fe5cd1b841d4fee", "5d0e7bf823595f16fc885981"]
            const students = await Student.find({ _id: { $in: studentIDs } })
            if (!students) {
                console.log("Couldn't find any students")
                return
            }
            console.log(students)
            students.map(async (student) => {
                exam.students.push(student.id)
                await exam.save()
                student.myExams.push(exam.id)
                await student.save()
            })
            return {
                ...exam._doc,
                date: new Date(exam._doc.date).toISOString(),
                question: findQuestion.bind(this, exam.question),
                students: findStudents.bind(this, exam.students),
                teacher: findTeacher.bind(this, exam.teacher),
                result: findResult.bind(this, exam.result)
            }
        } catch (err) {
            return new Error("Couldnot assign students " + err)
        }
    },
    removeExam: async ({ examID, teacherID }, req) => {
        if (req.isAuth === false || req.accessType !== 2) {
            throw new Error("Unauthenticated");
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
    updateExam: async ({ examUpdateInput: { _id, title, code, prevPassword, newPassword, status, totalMarks, totalTimeInMin, semester, year, examDate, teacherID, course: { title: courseTitle, code: courseCode } } }, req) => {
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

            if (prevPassword !== "" && newPassword !== "" && prevPassword === newPassword) {
                exam.password = newPassword
            }
            const updatedExam = await exam.save()
            return updatedExam
        } catch (err) {
            throw new Error("server error while updating a Exam" + err)
        }
    }
}
