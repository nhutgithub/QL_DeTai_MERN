const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const thesisRegistrationSchema = new Schema({
    ThesisID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Theses",
    },
    StudentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
    },
    GroupLeader: {
        type: Boolean,
        default: false,
    },
    Status: String,
});

const ThesisRegistration = mongoose.model("ThesisRegistration", thesisRegistrationSchema);

module.exports = ThesisRegistration;