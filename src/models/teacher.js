const mongoose = require('mongoose')

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    password: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    accessType: {
        type: Number,
        default: 2
    },
    status: {
        type: Boolean
    },
    deptCode: {
        type: String,
        required: true
    },
    myAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    myExams: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam',
        }
    ],
    myStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
        }
    ]
})

const Teacher = mongoose.model("Teacher", teacherSchema)

module.exports = Teacher