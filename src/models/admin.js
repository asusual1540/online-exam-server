const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20
    },
    password: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    accessType: {
        type: Number,
        default: 1
    },
    myTeachers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher'
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
})

const Admin = mongoose.model("Admin", adminSchema)

module.exports = Admin