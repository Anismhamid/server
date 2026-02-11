const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
	{
		from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Users", // مهم جداً مطابق لاسم الموديل
			required: true,
		},
		to: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Users",
			required: true,
		},
		message: {
			type: String,
			required: true,
			maxlength: 1000,
		},
		warning: {type: Boolean, default: false},
		isImportant: {type: Boolean, default: false},
		replyTo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Users",
		},
		status: {
			type: String,
			default: "delivered",
		},
	},
	{timestamps: true},
);

module.exports = mongoose.model("Message", messageSchema);
