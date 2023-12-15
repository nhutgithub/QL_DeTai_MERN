const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
	DepartmentName: String,
	Description: String,
});

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;