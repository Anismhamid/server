const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Users = require("../models/User");
const Message = require("../models/Message");
const {body, validationResult} = require("express-validator");

// Permissions
const messagePermissions = {
	Client: ["Client", "Admin", "Moderator"],
	Moderator: ["Client", "Admin", "Moderator"],
	Admin: ["Client", "Moderator", "Admin"],
};

function canSendMessage(fromRole, toRole) {
	return messagePermissions[fromRole]?.includes(toRole) || false;
}

// ====== Send Message ======
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
			const errors = validationResult(req);
			if (!errors.isEmpty()) return res.status(400).json(errors.array());

			const {
				toUserId,
				message,
				warning = false,
				isImportant = false,
				replyTo,
			} = req.body;
			const fromUserId = req.payload._id;
			const fromRole = req.payload.role;

			if (fromUserId === toUserId)
				return res.status(400).send("Cannot message yourself");

			const toUser = await Users.findById(toUserId).select("-password");
			if (!toUser) return res.status(404).send("Recipient not found");

			if (!canSendMessage(fromRole, toUser.role))
				return res
					.status(403)
					.send(`Not allowed to send messages to ${toUser.role}`);

			// Room ID
			const roomId = [fromUserId, toUserId].sort().join("_");

			const newMessage = new Message({
				from: fromUserId,
				to: toUserId,
				message,
				warning,
				isImportant,
				replyTo: replyTo || null,
				roomId,
				status: "delivered",
			});

			await newMessage.save();

			// Populated message
			const populatedMessage = await Message.findById(newMessage._id)
				.populate("from", "name email role")
				.populate("to", "name email role")
				.populate("replyTo", "message from to");

			const io = req.app.get("io");
			const connectedUsers = req.app.get("connectedUsers");

			// Send to all sockets of recipient
			(connectedUsers.get(toUserId) || []).forEach((id) =>
				io.to(id).emit("message:received", populatedMessage),
			);

			// Send to all sockets of sender
			(connectedUsers.get(fromUserId) || []).forEach((id) =>
				io.to(id).emit("message:sent", populatedMessage),
			);

			// Update unread count
			const unreadCount = await Message.countDocuments({
				to: toUserId,
				status: {$ne: "seen"},
			});
			(connectedUsers.get(toUserId) || []).forEach((id) =>
				io.to(id).emit("message:unreadCount", {
					userId: fromUserId,
					count: unreadCount,
				}),
			);

			res.status(201).json(populatedMessage);
		} catch (err) {
			console.error(err);
			res.status(500).send(
				process.env.NODE_ENV === "development" ? err.message : "Server error",
			);
		}
	},
);

// ====== Get Conversation ======
router.get("/conversation/:otherUserId", auth, async (req, res) => {
	try {
		const userId = req.payload._id;
		const otherUserId = req.params.otherUserId;

		const roomId = [userId, otherUserId].sort().join("_");
		const messages = await Message.find({roomId})
			.sort({createdAt: 1})
			.populate("from", "name email role")
			.populate("to", "name email role")
			.populate("replyTo", "message from to");

		const unreadCount = await Message.countDocuments({
			to: userId,
			status: {$ne: "seen"},
		});

		res.json({messages, unreadCount});
	} catch (err) {
		console.error(err);
		res.status(500).send("Failed to get conversation");
	}
});

// ====== Mark as Seen ======
router.patch("/mark-as-seen/:fromUserId", auth, async (req, res) => {
	try {
		const toUserId = req.payload._id;
		const fromUserId = req.params.fromUserId;

		const io = req.app.get("io");
		const connectedUsers = req.app.get("connectedUsers");

		await Message.updateMany(
			{
				roomId: [fromUserId, toUserId].sort().join("_"),
				from: fromUserId,
				to: toUserId,
				status: {$ne: "seen"},
			},
			{status: "seen"},
		);

		const unreadCount = await Message.countDocuments({
			to: toUserId,
			from: fromUserId,
			status: {$ne: "seen"},
		});

		(connectedUsers.get(toUserId) || [])
			.forEach((id) =>
				io.to(id).emit("message:unreadCount", {
					userId: fromUserId,
					count: unreadCount,
				}),
			)(
				// Notify sender
				connectedUsers.get(fromUserId) || [],
			)
			.forEach((id) => io.to(id).emit("message:seen", {by: toUserId}));

		res.sendStatus(200);
	} catch (err) {
		console.error(err);
		res.status(500).send("Failed to mark messages as seen");
	}
});

// ====== Get All Conversations ======
router.get("/conversations", auth, async (req, res) => {
	try {
		if (!req.payload || !req.payload._id) {
			return res.status(401).json({message: "Unauthorized"});
		}

		const userId = req.payload._id.toString();

		const messages = await Message.find({
			$or: [{from: userId}, {to: userId}],
		})
			.sort({createdAt: -1})
			.populate("from", "name email role")
			.populate("to", "name email role");

		const conversationsMap = {};

		messages.forEach((msg) => {
			if (!msg.from || !msg.to) return; // حماية إضافية

			const otherUser = msg.from._id.toString() === userId ? msg.to : msg.from;

			const otherId = otherUser._id.toString();

			if (!conversationsMap[otherId]) {
				conversationsMap[otherId] = {
					user: otherUser,
					lastMessage: msg,
					unreadCount:
						msg.to._id.toString() === userId && msg.status !== "seen" ? 1 : 0,
				};
			} else {
				if (msg.createdAt > conversationsMap[otherId].lastMessage.createdAt) {
					conversationsMap[otherId].lastMessage = msg;
				}

				if (msg.to._id.toString() === userId && msg.status !== "seen") {
					conversationsMap[otherId].unreadCount += 1;
				}
			}
		});

		res.json({conversations: Object.values(conversationsMap)});
	} catch (err) {
		console.error("Conversations error:", err);
		res.status(500).json({message: err.message});
	}
});


module.exports = router;
