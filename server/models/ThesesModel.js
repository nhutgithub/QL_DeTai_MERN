const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const thesesSchema = new Schema({
    DepartmentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
    },
    AdvisorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
    },
    ReviewerID1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
    },
    ReviewerID2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
    },
    ReviewerID3: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
    },
    Title: String,
    StartDate: {
        type: Date,
        default: Date.now,
    },
    EndDate: {
        type: Date,
        default: Date.now,
    },
    Description: String,
    Status: String,
});

const Theses = mongoose.model("Theses", thesesSchema);

module.exports = Theses;