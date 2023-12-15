const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    UserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    YearID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicYear",
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
    Address: String
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;