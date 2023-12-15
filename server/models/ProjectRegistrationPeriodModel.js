const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectRegistrationPeriodSchema = new Schema({
    YearID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicYear",
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
});

const ProjectRegistrationPeriod = mongoose.model("ProjectRegistrationPeriod", projectRegistrationPeriodSchema);

module.exports = ProjectRegistrationPeriod;