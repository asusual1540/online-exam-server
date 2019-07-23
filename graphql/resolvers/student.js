const bcrypt = require('bcrypt')

const Student = require('../../models/student')
const Teacher = require('../../models/teacher')

const { findExams, findAnswers, findResults, findTeacher } = require('../resolvers/merger')

module.exports = {
    addStudent: async (args, req) => {
        // if (req.isAuth === false || req.accessType !== 2) {
        //     console.log("Unauthenticated")
        //     throw new Error("Unauthenticated")
        // }
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
    get_all_students: async (args) => {
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
    updateStudent: async ({ studentUpdateInput: { _id, teacherID, name, studentID, prevPassword, newPassword, status } }, req) => {
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
            if (prevPassword !== "" && newPassword !== "" && prevPassword === newPassword) {
                student.password = newPassword
            }
            const updatedStudent = await student.save()
            return updatedStudent
        } catch (err) {
            throw new Error("server error while updating a student" + err)
        }
    }
}