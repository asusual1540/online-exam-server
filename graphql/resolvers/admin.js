const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../../models/admin");

const { findTeachers, findStudents } = require("../resolvers/merger");

module.exports = {
  addAdmin: async args => {
    const name = args.adminInput.name;
    const password = args.adminInput.password;
    try {
      const admin = await Admin.findOne({ name: name });
      if (admin) return new Error("Admin already exists by that name");
      const hashedPassword = await bcrypt.hash(password, 12);
      const newAdmin = new Admin({
        name,
        password: hashedPassword
      });
      const createdAdmin = await newAdmin.save();
      return {
        ...createdAdmin._doc,
        password: null,
        date: new Date(createdAdmin._doc.date).toISOString(),
        myTeachers: findTeachers.bind(this, createdAdmin._doc.myTeachers),
        myStudents: findStudents.bind(this, createdAdmin._doc.myStudents)
      };
    } catch (err) {
      return new Error("Couldnot find an admin from resolver" + err);
    }
  },
  get_all_admins: async () => {
    try {
      const admins = await Admin.find();
      return admins.map(admin => {
        return {
          ...admin._doc,
          password: null,
          date: new Date(admin._doc.date).toISOString(),
          myTeachers: findTeachers.bind(this, admin._doc.myTeachers),
          myStudents: findStudents.bind(this, admin._doc.myStudents)
        };
      });
    } catch (err) {
      return new Error("Couldnot find any admins" + err);
    }
  },
  adminLogin: async ({ name, password }) => {
    const admin = await Admin.findOne({ name: name });
    if (!admin) {
      throw new Error("User does not exists");
    }
    const isEqual = await bcrypt.compare(password, admin.password);
    if (isEqual === false) {
      throw new Error("Password is incorrect");
    }
    const token = jwt.sign(
      { adminID: admin.id, name: admin.name, accessType: admin.accessType },
      process.env.jwtPrivateKey,
      {
        expiresIn: "1h"
      }
    );
    return {
      token: token
    };
  },
  changeAdminPassword: async (args, req) => {
    if (req.isAuth === false || req.accessType !== 1) {
      console.log("Unauthenticated");
      throw new Error("Unauthenticated");
    }
    const prevPassword = args.prevPassword;
    const newPassword = args.newPassword;
    const adminID = args.adminID;

    try {
      if (prevPassword === "" && newPassword === "") {
        throw new Error("Fields are empty");
      }
      const admin = await Admin.findOne({ _id: adminID });
      if (prevPassword !== "" && newPassword !== "") {
        const isEqual = await bcrypt.compare(prevPassword, admin.password);
        if (isEqual === false) {
          throw new Error("Password is incorrect");
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        admin.password = hashedPassword;
      }
      const updatedAdmin = await admin.save();
      return updatedAdmin;
    } catch (err) {
      return new Error("Couldnot change password of admin from resolver" + err);
    }
  }
};
