const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const academicYearSchema = new Schema({
	YearName: String,
	StartDate: {
		type: Date,
		default: Date.now,
	},
	EndDate: {
		type: Date,
		default: Date.now,
	},
});

const AcademicYear = mongoose.model("AcademicYear", academicYearSchema);

module.exports = AcademicYear;