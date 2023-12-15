const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
    UserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    DepartmentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
    },
    FullName: String,
    DateOfBirth: {
        type: Date,
        default: Date.now,
    },
    Email: String,
    Phone: String,
    Address: String,
    Position: String,
});

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;