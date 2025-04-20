const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Cart = require("../models/Cart");
const Jwt = require("jsonwebtoken");
const {compareSync, genSaltSync, hashSync} = require("bcryptjs");
const _ = require("lodash");
const Joi = require("joi");
const auth = require("../middlewares/auth");
const chalk = require("chalk");

// for generating token
const generateToken = (user) => {
	return Jwt.sign(
		_.pick(user, ["_id", "name.first", "name.last", "email", "role", "image.url"]),
		process.env.JWT_SECRET,
	);
};

const userSchema = Joi.object({
	name: Joi.object({
		first: Joi.string().min(3).max(50).required(),
		last: Joi.string().min(2).max(50).required(),
	}),
	phone: Joi.object({
		phone_1: Joi.string().min(9).max(10).required(),
		phone_2: Joi.string().allow(""),
	}),
	address: Joi.object({
		city: Joi.string().min(2).max(20).allow(""),
		street: Joi.string().min(2).max(20).allow(""),
		houseNumber: Joi.string().allow(""),
	}),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	image: Joi.object({
		url: Joi.string()
			.uri()
			.allow("")
			.default("https://cdn-icons-png.flaticon.com/512/64/64572.png"),
		alt: Joi.string().allow(""),
	}),
	role: Joi.string().valid("Admin", "Moderator", "Client").default("Client"),
	activity: Joi.array(),
	registrAt: Joi.string(),
	terms: Joi.boolean().required(),
});

const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(8).max(60).required(),
});

const roleType = {
	Admin: "Admin",
	Moderator: "Moderator",
	Client: "Client",
};

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
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		});

		// creatre token
		const token = generateToken(user);

		// return the token
		res.status(200).send(token);
	} catch (error) {
		res.status(400).send(error.message);
	}
});
// check if user exists
router.get("/google/verify/:id", async (req, res) => {
	const user = await User.findOne({googleId: req.params.id});
	if (user) return res.send({exists: true});
	res.send({exists: false});
});

// register the new google user into database
router.post("/google", async (req, res) => {
	try {
		// check if user exists
		let user = await User.findOne({email: req.body.email});
		if (user) {
			const token = generateToken(user);

			return res.status(200).send(token);
		}

		// if user not exist create a new
		user = new User(req.body);

		// save the user
		await user.save();

		// create new cart
		const cart = new Cart({
			userId: user._id,
			products: [],
		});

		// save the new cart
		await cart.save();

		const io = req.app.get("io");
		io.emit("user:registered", {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		});

		const token = generateToken(user);

		res.status(201).send(token);
	} catch (error) {
		res.status(500).send(error);
	}
});

// Login users
router.post("/login", async (req, res) => {
	try {
		// Validate body
		const {error} = loginSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		// Check if user have permission to get the users
		let user = await User.findOne({email: req.body.email});
		if (!user)
			return res.status(400).send("invalid email or password please try again");

		// Check password
		const compare = compareSync(req.body.password, user.password);
		if (!compare) {
			console.log(chalk.red("invalid email or password please try again"));

			return res.status(400).send("invalid email or password please try again");
		}

		// push the activity time
		user.activity.push(new Date().toLocaleString());

		await user.save();

		const io = req.app.get("io");
		io.emit("user:newUserLoggedIn", {
			email: user.email,
			role: user.role,
		});

		const token = generateToken(user);

		res.status(200).send(token);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// get all users (Admin only)
router.get("/", auth, async (req, res) => {
	try {
		// check if user have permission to get the users
		if (req.payload.role !== roleType.Admin)
			return res
				.status(401)
				.send("You do not have permission to access this resource");

		const users = await User.find().select("-password");
		if (!users) return res.status(404).send("No users found yet");

		res.status(200).send(users);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// Get single user (Admin or Moderator or oner user only)
router.get("/:userId", auth, async (req, res) => {
	try {
		// check if user have permission to get the user by id
		if (
			req.payload._id !== req.params.userId &&
			req.payload.role !== roleType.Admin &&
			req.payload.role !== roleType.Moderator
		)
			return res
				.status(401)
				.send("You do not have permission to access this resource");

		const user = await User.findOne({_id: req.params.userId}).select("-password");
		if (!user) return res.status(404).send("user Not Found");

		res.status(200).send(user);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// Update user role (Admin only)
router.patch("/role/:userEmail", auth, async (req, res) => {
	try {
		// Check permission
		if (req.payload.role !== roleType.Admin)
			return res.status(401).send("Access denied. Admins only");

		// Prevent non-admins from assigning admin role
		if (req.body.role === roleType.Admin && req.payload.role !== roleType.Admin) {
			return res.status(403).send("You are not allowed to assign Admin role.");
		}

		const user = await User.findOneAndUpdate(
			{email: req.params.userEmail},
			{role: req.body.role},
			{new: true},
		);

		// Check if user exists
		if (!user) {
			return res.status(404).send("User not found");
		}

		res.status(200).send(user);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// compleate user data
router.patch("/compleate/:userId", auth, async (req, res) => {
	try {
		// Check permission
		if (req.payload.role !== roleType.Admin && req.params.userId !== req.payload._id)
			return res.status(401).send("Access denied. Admins or oner user only");

		const updateData = {
			phone: {
				phone_1: req.body.phone.phone_1,
				phone_2: req.body.phone.phone_2 || "",
			},
			address: {
				city: req.body.address.city,
				street: req.body.address.street,
				houseNumber: req.body.address.houseNumber,
			},
		};

		const user = await User.findOneAndUpdate(
			{_id: req.params.userId},
			{$set: updateData},
			{new: true},
		);

		// Check if user exists
		if (!user) {
			return res.status(404).send("User not found");
		}

		res.status(200).send(user);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

module.exports = router;
