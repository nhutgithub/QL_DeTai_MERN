const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RequestsProgressSchema = new Schema({
	ThesisID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Theses",
    },
    AdvisorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
    },
	RequestDescription: String,
	Progress: Number
});

const RequestsProgress = mongoose.model("RequestsProgress", RequestsProgressSchema);

module.exports = RequestsProgress;