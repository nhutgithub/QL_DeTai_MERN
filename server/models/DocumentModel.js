const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
    RequestID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RequestsProgress",
    },
    DocumentPath: String,
    Type: String
});

const Document = mongoose.model("Document", DocumentSchema);

module.exports = Document;