const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	UserName: String,
	Password: String,
	Role: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;