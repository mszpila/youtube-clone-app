const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");

const User = require("../model/User");

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

router.post(
	"/signup",
	[
		check("username", "Please Enter a Valid Username").not().isEmpty(),
		check("email", "Please enter a valid email").isEmail(),
		check("password", "Please enter a valid password").isLength({
			min: 6,
		}),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}

		const { username, email, password } = req.body;
		try {
			let user = await User.findOne({
				username,
			});
			if (user) {
				return res.status(400).json({
					msg: "Username already used",
				});
			}

			user = await User.findOne({
				email,
			});
			if (user) {
				return res.status(400).json({
					msg: "Email already used",
				});
			}

			user = new User({
				username,
				email,
				password,
			});

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);

			await user.save();

			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				"randomString",
				{
					expiresIn: 3600,
				},
				(err, token) => {
					if (err) throw err;
					res.status(200).cookie("login_auth", token).json({
						token,
					});
				}
			);
		} catch (err) {
			console.log(err.message);
			res.status(500).send("Error in Saving");
		}
	}
);

router.post(
	"/login",
	[
		check("email", "Please enter a valid email").isEmail(),
		check("password", "Please enter a valid password").isLength({
			min: 6,
		}),
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}

		const { email, password } = req.body;
		try {
			let user = await User.findOne({
				email,
			});
			if (!user)
				return res.status(400).json({
					message: "User Not Exist",
				});

			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch)
				return res.status(400).json({
					message: "Incorrect Password !",
				});

			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				"randomString",
				{
					expiresIn: 3600,
				},
				(err, token) => {
					if (err) throw err;
					res.status(200).cookie("login_auth", token).json({
						token,
					});
				}
			);
		} catch (e) {
			console.error(e);
			res.status(500).json({
				message: "Server Error",
			});
		}
	}
);

// router.post("/logout", auth, async (req, res) => {
// 	try {
// 		return res
// 			.status(200)
// 			.cookie("login_auth", "")
// 			.json({ message: "Successfully logout" });
// 	} catch (error) {
// 		res.send({ message: "Error in loging out" });
// 	}
// });
// to log out just remove cookie from React app

router.get("/me", auth, async (req, res) => {
	try {
		// request.user is getting fetched from Middleware after token authentication
		const user = await User.findById(req.user.id);
		res.json(user);
	} catch (e) {
		res.send({ message: "Error in Fetching user" });
	}
});

module.exports = router;