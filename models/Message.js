const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
	{
		from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Users",
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
			enum: ["sent", "delivered", "seen"],
			default: "sent",
		},
		roomId: {
			type: String,
			required: true,
			index: true,
		},
	},
	{timestamps: true},
);

messageSchema.index({to: 1, status: 1});
messageSchema.index({from: 1, to: 1});
messageSchema.index({roomId: 1,createdAt:1});

module.exports = mongoose.model("Message", messageSchema);
