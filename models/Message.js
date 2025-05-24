const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
	{
		from: {type: String, ref: "User", required: true},
		to: {
			type: String,
			ref: "User",
			required: true,
		},
		message: {type: String, required: true, min: 2, max: 500},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		warning: {type: Boolean, default: false},
		replyTo: {
			type: String,
			ref: "message",
		},
		isImportant: {type: Boolean, default: false},
		status: {
			type: String,
			enum: ["sent", "read", "delivered"],
			default: "sent",
		},
	},
	{timestamps: true},
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
