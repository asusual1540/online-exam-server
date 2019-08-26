const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const isAuth = require("../../middleware/is-auth")

const Teacher = require("../../models/teacher")
const Admin = require("../../models/admin")

const { findAdmin, findExams, findStudents } = require("./merger")

module.exports = {
  get_all_teachers: async (parent, args, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 1) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const teachers = await Teacher.find({ myAdmin: args.adminID })
      return teachers.map(teacher => {
        return {
          ...teacher._doc,
          _id: teacher.id
        }
      })
    } catch (err) {
      return new Error("Couldnot find Teachers " + err)
    }
  },
  addTeacher: async (parent, args, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 1) {
      throw new Error("You Dont Have The Permission")
    }
    const { name, password, deptCode, adminID, status } = args.teacherInput
    try {
      const teacher = new Teacher({
        name,
        password,
        deptCode,
        myAdmin: adminID,
        status
      })
      const createdTeacher = await teacher.save()
      const admin = await Admin.findById(adminID)
      await admin.myTeachers.push(createdTeacher)
      await admin.save()
      return {
        ...createdTeacher._doc,
        _id: createdTeacher.id
      }
    } catch (err) {
      return new Error("Couldnot find an teacher from resolver" + err)
    }
  },
  teacherLogin: async (parent, { name, password }, ctx, info) => {
    const teacher = await Teacher.findOne({ name: name })
    if (!teacher) {
      throw new Error("Teacher does not exists")
    }
    if (password !== teacher.password) {
      throw new Error("Password is incorrect")
    }
    if (teacher.status === false) {
      throw new Error("You were deactivated")
    }
    const token = jwt.sign(
      {
        teacherID: teacher.id,
        name: teacher.name,
        accessType: teacher.accessType
      },
      "Iamkira1540",
      {
        expiresIn: "3h"
      }
    )
    return {
      token: token
    }
  },
  removeTeacher: async (parent, { teacherID, adminID }, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 1) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const teacher = await Teacher.findById(teacherID)
      const admin = await Admin.findById(adminID)
      if (!teacher.myAdmin.equals(admin._id)) {
        throw new Error("This Teacher doesnt belongs to you")
      }
      admin.myTeachers.pop(teacher)
      await admin.save()
      const removedTeacher = await Teacher.findByIdAndRemove(teacherID)
      return removedTeacher
    } catch (err) {
      throw new Error("server error " + err)
    }
  },
  updateTeacher: async (parent, args, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 1) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const teacher = await Teacher.findById(args.teacherUpdateInput._id)
      const admin = await Admin.findById(args.teacherUpdateInput.adminID)
      if (!teacher.myAdmin.equals(admin._id)) {
        throw new Error("This Teacher doesnt belongs to you")
      }
      const {
        name,
        status,
        deptCode,
        newPassword,
        prevPassword
      } = args.teacherUpdateInput
      teacher.name = name
      teacher.status = status
      teacher.deptCode = deptCode
      if (
        prevPassword !== "" &&
        newPassword !== "" &&
        prevPassword === newPassword
      ) {
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        teacher.password = hashedPassword
      }
      const updatedTeacher = await teacher.save()
      return updatedTeacher
    } catch (err) {
      throw new Error("server error " + err)
    }
  },
  changeTeacherPassword: async (parent, args, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 2) {
      throw new Error("You Dont Have The Permission")
    }
    const prevPassword = args.prevPassword
    const newPassword = args.newPassword
    const teacherID = args.teacherID

    try {
      if (prevPassword === "" && newPassword === "") {
        throw new Error("Fields are empty")
      }
      const teacher = await Teacher.findOne({ _id: teacherID })
      if (prevPassword !== "" && newPassword !== "") {
        if (prevPassword !== newPassword) {
          throw new Error("Password mismatched")
        }
        teacher.password = newPassword
      }
      const updatedTeacher = await teacher.save()
      return updatedTeacher
    } catch (err) {
      return new Error(
        "Couldnot change password of Teacher from resolver" + err
      )
    }
  },
  get_teacher_by_id: async (parent, { teacherID }, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    try {
      const teacher = await Teacher.findById(teacherID)
      return teacher
    } catch (ex) {
      throw new Error("Teacher not found")
    }
  },
  updateTeacherStatus: async (parent, { status, teacherID }, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 1) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const teacher = await Teacher.findById(teacherID)
      if (!teacher) return false
      teacher.status = status
      await teacher.save()
      return true
    } catch (ex) {
      throw new Error("Error updating status of teacher")
    }
  },
  addMultipleTeacher: async (parent, { adminID, multipleTeacherInput }, ctx, info) => {
    const authData = isAuth(ctx.request)
    if (!authData) {
      throw new Error("Not Authorized")
    }
    if (authData.accessType !== 1) {
      throw new Error("You Dont Have The Permission")
    }
    try {
      const teachers = multipleTeacherInput.map(t => {
        return {
          name: t.name,
          password: t.password,
          deptCode: t.deptCode,
          status: t.status,
          myAdmin: adminID
        }
      })
      const data = await Teacher.insertMany(teachers);
      const admin = await Admin.findById(adminID)
      data.map(t => {
        admin.myTeachers.push(t)
      })
      await admin.save()
      return data
    } catch (ex) {
      throw new Error("Couldn't add multiple teachers" + ex)
    }
  }
}
