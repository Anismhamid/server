const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const User = require("../models/User");
const Message = require("../models/Message");
const {body, validationResult} = require("express-validator");

// role messaging permissions
const messagePermissions = {
	Client: ["Moderator"],
	Moderator: ["Client", "Admin"],
	Admin: ["Client", "Moderator", "Admin"], // Admins can message anyone including other Admins
};

// Validate message sending permissions
function canSendMessage(fromRole, toRole) {
	return messagePermissions[fromRole]?.includes(toRole) || false;
}

// Message creation endpoint with validation
router.post(
	"/",
	auth,
	[
		body("toUserId").notEmpty().isString().withMessage("Recipient ID is required"),
		body("message")
			.notEmpty()
			.isString()
			.isLength({min: 1, max: 1000})
			.withMessage("Message must be between 1-1000 characters"),
		body("warning").optional().isBoolean(),
		body("isImportant").optional().isBoolean(),
		body("replyTo").optional().isString(),
	],
	async (req, res) => {
		try {
			// Validate body
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({errors: errors.array()});
			}

			const {
				toUserId,
				message,
				warning = false,
				isImportant = false,
				replyTo,
			} = req.body;
			const fromUserId = req.payload._id;
			const fromRole = req.payload.role;

			// Check if recipient exists
			const toUser = await User.findById(toUserId).select("-password");
			if (!toUser) {
				return res.status(404).json({error: "Recipient user not found"});
			}

			// Verify messaging permissions
			if (!canSendMessage(fromRole, toUser.role)) {
				return res.status(403).json({
					error: `Not authorized to send messages to ${toUser.role}s`,
				});
			}

			// Prevent self-messaging
			if (fromUserId === toUserId) {
				return res.status(400).json({error: "Cannot send message to yourself"});
			}

			// Create and save message
			const newMessage = new Message({
				from: fromUserId,
				to: toUserId,
				message,
				warning,
				isImportant,
				replyTo,
				status: "delivered",
			});

			await newMessage.save();

			// Emit socket event with minimal data
			const io = req.app.get("io");
			io.to(toUserId).emit("message:received", {
				id: newMessage._id,
				from: fromUserId,
				preview: message.substring(0, 50),
				isImportant,
				createdAt: newMessage.createdAt,
			});

			res.status(201).json({
				message: "Message sent successfully",
				messageId: newMessage._id,
			});
		} catch (error) {
			console.error("Message send error:", error);
			res.status(500).json({
				error: "Failed to send message",
				details:
					process.env.NODE_ENV === "development" ? error.message : undefined,
			});
		}
	},
);

// Get messages endpoint with pagination
router.get("/:userId", auth, async (req, res) => {
	try {
		// Verify user can access these messages
		if (req.params.userId !== req.payload._id) {
			return res.status(403).json({error: "Unauthorized access"});
		}

		// Pagination parameters
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const skip = (page - 1) * limit;

		// Get messages with pagination
		const messages = await Message.find({
			$or: [{from: req.params.userId}, {to: req.params.userId}],
		})
			.sort({createdAt: -1})
			.skip(skip)
			.limit(limit)
			.populate("from", "name email")
			.populate("to", "name email");

		// Get total count for pagination metadata
		const total = await Message.countDocuments({
			$or: [{from: req.params.userId}, {to: req.params.userId}],
		});

		if (!messages.length) {
			return res.status(200).json({
				messages: [],
				total: 0,
				pages: 0,
			});
		}

		res.json({
			messages,
			pagination: {
				total,
				pages: Math.ceil(total / limit),
				currentPage: page,
				perPage: limit,
			},
		});
	} catch (error) {
		console.error("Get messages error:", error);
		res.status(500).json({
			error: "Failed to retrieve messages",
			details: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
});

module.exports = router;
