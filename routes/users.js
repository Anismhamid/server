const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Cart = require("../models/Cart");
const Jwt = require("jsonwebtoken");
const {compareSync, genSaltSync, hashSync} = require("bcryptjs");
const _ = require("lodash");
const auth = require("../middlewares/auth");
const {verifyGoogleToken} = require("../utils/googleAuth");
const {userSchema, loginSchema} = require("../schema/userSchema");
const completeUserSchema = require("../schema/completeUserSchema");
const chalk = require("chalk");

// users role
const roleType = {
	Admin: "Admin",
	Moderator: "Moderator",
	Client: "Client",
};

// for generating token
const generateToken = (user) => {
	return Jwt.sign(
		_.pick(user, [
			"_id",
			"name.first",
			"name.last",
			"email",
			"role",
			"image.url",
			"phone.phone_1",
			"phone.phone_2",
			"address.city",
			"address.street",
			"address.houseNumber",
		]),
		process.env.JWT_SECRET,
	);
};

// ----- רישום משתמש -----

// Register new user
router.post("/", async (req, res) => {
	try {
		// validate the body
		const {error} = userSchema.validate(req.body, {stripUnknown: false});
		if (error) return res.status(400).send(error.details[0].message);

		// check if user exists
		let user = await User.findOne({email: req.body.email}, {password: 0});
		if (user)
			return res.status(400).send("This user already exists. Please try another.");

		user = new User({
			...req.body,
			registrAt: new Date().toLocaleString("he-IL"),
			status: false,
		});

		const salt = genSaltSync(10);
		user.password = hashSync(user.password, salt);

		await user.save();

		// create cart
		const cart = new Cart({
			userId: user._id,
			products: [],
		});

		await cart.save();

		const io = req.app.get("io");
		io.emit("user:registered", {
			userId: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		});

		// creatre token
		const token = generateToken(user);

		// return the token
		res.status(200).send(token);
	} catch (error) {
		res.status(400).send("Internal server error");
	}
});

// ----- התחברות -----

// Login users
router.post("/login", async (req, res) => {
	try {
		// Validate body
		const {error} = loginSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		// Check if user exists and try to compare the users password
		let user = await User.findOne({email: req.body.email});
		if (!user || !compareSync(req.body.password, user.password))
			return res.status(400).send("invalid email or password");

		// push the activity time
		user.activity.push(new Date().toLocaleString());
		user.status = true;
		await user.save();

		const io = req.app.get("io");
		io.emit("user:newUserLoggedIn", {
			userId: user._id,
			email: user.email,
			role: user.role,
		});

		const token = generateToken(user);

		res.status(200).send(token);
	} catch (error) {
		res.status(500).send("Internal server error");
	}
});

// ----- Google OAuth -----

// check if google user exists returns true - false
router.get("/google/verify/:id", async (req, res) => {
	const user = await User.findOne({googleId: req.params.id});
	if (user) return res.send({exists: true});
	res.send({exists: false});
});

// register or login the new google user into database or login
router.post("/google", async (req, res) => {
	try {
		const io = req.app.get("io");

		const {credentialToken} = req.body;
		if (!credentialToken) return res.status(400).send("Missing token");

		const payload = await verifyGoogleToken(credentialToken);
		if (!payload.email_verified) return res.status(401).send("Email not verified");

		if (!payload || !payload.sub || !payload.email) {
			return res.status(400).send("Invalid Google payload");
		}
		// check if user exists
		let user = await User.findOne({email: payload.email});
		if (user) {
			user.activity.push(new Date().toLocaleString("he-IL"));
			user.status = true;

			const token = generateToken(user);

			io.emit("user:newUserLoggedIn", {
				userId: user._id,
				email: user.email,
				role: user.role,
			});
			return res.status(200).send(token);
		}

		// if user not exist create a new one from payload
		user = new User({
			name: {
				first: payload.given_name || "Google",
				last: payload.family_name || "User",
			},
			phone: {
				phone_1: req.body.phone.phone_1 || "",
				phone_2: req.body.phone.phone_2 || "",
			},
			address: {
				city: req.body.address.city || "",
				street: req.body.address.street || "",
				houseNumber: req.body.address.houseNumber || "",
			},
			email: payload.email,
			password: hashSync(payload.sub, 10),
			image: {
				url: payload.picture,
				alt: `${payload.given_name} ${payload.family_name}`,
			},
			role: "Client",
			activity: [new Date().toLocaleString("he-IL")],
			registrAt: new Date().toLocaleString("he-IL"),
			googleId: payload.sub,
			status: false,
		});
		// save the user
		await user.save();

		io.emit("user:registered", {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		});

		// create new cart
		const cart = new Cart({
			userId: user._id,
			products: [],
		});

		// save the new cart
		await cart.save();

		const token = generateToken(user);

		res.status(201).send(token);
	} catch (error) {
		res.status(500).send("Internal server error");
	}
});

// ----- משתמשים -----

// get all users (Admin / moderators)
router.get("/", auth, async (req, res) => {
	try {
		// check if user have permission to get the users
		if (
			req.payload.role !== roleType.Admin &&
			req.payload.role !== roleType.Moderator
		)
			return res
				.status(401)
				.send({error: "You do not have permission to access this resource"});

		const users = await User.find().select("-password");
		if (!users) return res.status(404).send({message: "No users found yet"});

		res.status(200).send(users);
	} catch (error) {
		res.status(500).send("Internal server error");
	}
});

// Get single user (Admin or Moderator or oner user only)
router.get("/:userId", auth, async (req, res) => {
	try {
		const {role, _id} = req.payload;
		const {userId} = req.params;

		// check if user have permission to get the user by id
		if (_id !== userId && role !== roleType.Admin && role !== roleType.Moderator)
			return res
				.status(401)
				.send({error: "You do not have permission to access this resource"});

		const user = await User.findOne({_id: req.params.userId}).select("-password");
		if (!user) return res.status(404).send({message: "user Not Found"});

		res.status(200).send(user);
	} catch (error) {
		res.status(500).send("Internal server error");
	}
});

// Update user role (Admin only)
router.patch("/role/:userEmail", auth, async (req, res) => {
	try {
		// Check permission
		if (req.payload.role !== roleType.Admin)
			return res.status(401).send({error: "Access denied. Admins only"});

		const user = await User.findOneAndUpdate(
			{email: req.params.userEmail},
			{role: req.body.role},
			{new: true},
		);

		// Check if user exists
		if (!user) {
			return res.status(404).send({message: "User not found"});
		}

		res.status(200).send(user);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// compleate user data
router.patch("/compleate/:userId", auth, async (req, res) => {
	try {
		// validate body
		const {error} = completeUserSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const isAdmin = req.payload.role === roleType.Admin;
		const isSelf = req.params.userId === req.payload._id;

		// Check permission
		if (!isAdmin && !isSelf) return res.status(401).send({message: "Unauthorized"});

		const updateData = {
			phone: {
				phone_1: req.body.phone.phone_1,
				phone_2: req.body.phone.phone_2,
			},
			image: {
				url: req.body.image.url,
			},

			address: {
				city: req.body.address.city,
				street: req.body.address.street,
				houseNumber: req.body.address.houseNumber,
			},
		};

		const user = await User.findByIdAndUpdate(req.params.userId, updateData, {
			new: true,
		}).lean();

		// Check if user exists
		if (!user) {
			return res.status(404).send({message: "User not found"});
		}

		const {password, ...safeUser} = user;
		res.status(200).send(safeUser);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// change password
router.patch("/password/:userId", auth, async (req, res) => {
	try {
		const {userId} = req.params;
		const {newPassword} = req.body;
		const isAdmin = req.payload.role === roleType.Admin;
		const isSelf = req.payload._id === userId;

		if (!newPassword || newPassword.length < 6) {
			return res
				.status(400)
				.send({message: "Password must contain at least 6 characters"});
		}

		const user = await User.findById(userId);
		if (!user) return res.status(404).send({message: "User not found"});

		if (!isAdmin && !isSelf) {
			return res.status(403).send({error: "No permission to change password"});
		}

		user.password = hashSync(newPassword, 10);
		await user.save();

		res.status(200).send({success: "Password updated successfully"});
	} catch (err) {
		res.status(500).send({error: "Internal server error"});
	}
});

router.delete("/:userId", auth, async (req, res) => {
	try {
		const isAdmin = req.payload.role === roleType.Admin;
		const isSelf = req.payload._id === req.params.userId;

		if (!isAdmin && !isSelf)
			return res.status(401).send({error: "Unauthorized, Cannot make this change"});

		const user = await User.findByIdAndDelete(req.params.userId);
		res.status(200).send(user);
	} catch (error) {
		res.status(500).send("Internal server error");
	}
});

// update user status online | ofline
router.patch("/status/:userId", async (req, res) => {
	try {
		// 2. Update and return the user
		const updatedUser = await User.findByIdAndUpdate(
			req.params.userId,
			{status: req.body.status},
			{new: true},
		);
		console.log(chalk.red(`user-${updatedUser.name.first} to-${updatedUser.status}`));

		if (!updatedUser) {
			return res.status(404).send("User not found");
		}
		res.status(200).send(updatedUser);
	} catch (error) {
		console.error("Status update error:", error);
		res.status(500).send("Internal server error");
	}
});

module.exports = router;
