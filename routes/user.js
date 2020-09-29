const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

const User = require("../model/User");
const Video = require("../model/Video");
const Commentary = require("../model/Comment");
const { route } = require("./video");

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

router.post("/signup", async (req, res) => {
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
				message: "Username already used",
			});
		}

		user = await User.findOne({
			email,
		});
		if (user) {
			return res.status(400).json({
				message: "Email already used",
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
				res.status(200)
					.cookie("login_auth", token, { httpOnly: true })
					.json({
						token,
						user,
					});
			}
		);
	} catch (err) {
		// console.log(err.message);
		res.status(500).json({ message: "Error in Saving" });
	}
});

router.post("/login", async (req, res) => {
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
				message: "Incorrect Password!",
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
				// expiresIn: 10,
			},
			(err, token) => {
				if (err) throw err;
				res.status(200)
					.cookie("login_auth", token, { httpOnly: true })
					.json({
						token,
						user,
					});
			}
		);
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: "Server Error",
		});
	}
});

router.post("/logout", auth, async (req, res) => {
	res.clearCookie("login_auth", { httpOnly: true }).json({ success: true });
});

router.get("/me", auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
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
				// expiresIn: 10,
			},
			(err, token) => {
				if (err) throw err;
				res.status(200)
					.cookie("login_auth", token, { httpOnly: true })
					.json(user);
			}
		);
	} catch (e) {
		res.send({ message: "Error in Fetching user" });
	}
});

router.get("/me/subscriptions", auth, (req, res) => {
	User.findById(req.user.id)
		.select("subscriptions")
		.populate("subscriptions")
		.exec((err, subscriptions) => {
			if (err) res.send(err);
			res.status(200).json(subscriptions);
		});
});

router.get("/me/subscribe", auth, async (req, res) => {
	const { user_id } = req.query;
	await User.findById(req.user.id)
		.where("subscriptions")
		.in([user_id])
		.exec((err, result) => {
			if (err) res.status(400).json({ success: false, err });
			if (result)
				res.status(200).json({ success: true, follow: true, result });
			else res.status(200).json({ success: true, follow: false, result });
		});
});

router.post("/me/subscribe", auth, async (req, res) => {
	const { user_id } = req.body;
	const followed = await User.findById(req.user.id)
		.where("subscriptions")
		.in([user_id]);
	if (followed) {
		await User.findByIdAndUpdate(req.user.id, {
			$pull: { subscriptions: user_id },
		});
		await User.findByIdAndUpdate(user_id, {
			$inc: { subscribers: -1 },
		});
	} else {
		await User.findByIdAndUpdate(req.user.id, {
			$addToSet: { subscriptions: user_id },
		});
		await User.findByIdAndUpdate(user_id, {
			$inc: { subscribers: 1 },
		});
	}
	return res.status(200).json({ success: true });
});

router.get("/getUserById", (req, res) => {
	User.findById(req.query.id, (err, user) => {
		if (err) res.status(400).send(err);
		res.status(200).json({ success: true, user });
	});
});

router.get("/reactionVideo", auth, async (req, res) => {
	const { videoContext } = req.query;
	const reaction = await User.findById(req.user.id).select({
		reactions: { $elemMatch: { videoContext } },
	});
	if (reaction.reactions.length) {
		const state = reaction.reactions[0].state;
		res.status(200).json({ success: true, state });
	} else {
		const state = null;
		res.status(200).json({ success: true, state });
	}
});

router.get("/reactionComment", auth, async (req, res) => {
	const { commentContext } = req.query;
	const reaction = await User.findById(req.user.id).select({
		reactions: { $elemMatch: { commentContext } },
	});
	if (reaction.reactions.length) {
		const state = reaction.reactions[0].state;
		res.status(200).json(state);
	} else {
		const state = null;
		res.status(200).json(state);
	}
});

router.post("/reactionVideo", auth, async (req, res) => {
	const { video_id, state } = req.body;
	const reaction = await User.findById(req.user.id).select({
		reactions: { $elemMatch: { videoContext: video_id } },
	});

	if (reaction.reactions.length) {
		// already reacted ==> modify state
		const currentState = reaction.reactions[0].state;
		if (state === currentState) {
			// user what to remove the reaction
			await User.findByIdAndUpdate(
				{ _id: req.user.id },
				{
					$pull: { reactions: { videoContext: video_id } },
				}
			);
			// decrease amount of the item likes/dislikes
			if (state === false) {
				await Video.findByIdAndUpdate(video_id, {
					$inc: { dislikes: -1 },
				});
			} else {
				await Video.findByIdAndUpdate(video_id, {
					$inc: { likes: -1 },
				});
			}
			return res.status(200).json({ success: true, message: "pulled" });
		} else {
			// user wants to change reaction
			await User.updateOne(
				{ _id: req.user.id, "reactions.videoContext": video_id },
				{ $set: { "reactions.$.state": state } }
			);
			if (state === false) {
				await Video.findByIdAndUpdate(video_id, {
					$inc: { dislikes: 1, likes: -1 },
				});
			} else {
				await Video.findByIdAndUpdate(video_id, {
					$inc: { likes: 1, dislikes: -1 },
				});
			}
			return res.status(200).json({ success: true, message: "switched" });
		}
	} else {
		// user set reaction
		const user = await User.findByIdAndUpdate(
			{ _id: req.user.id },
			{ $push: { reactions: { videoContext: video_id, state } } }
		);
		if (state === false) {
			await Video.findByIdAndUpdate(video_id, {
				$inc: { dislikes: 1 },
			});
		} else {
			await Video.findByIdAndUpdate(video_id, {
				$inc: { likes: 1 },
			});
		}
		return res.status(200).json({ success: true, message: "pushed" });
	}
});

router.post("/reactionComment", auth, async (req, res) => {
	const { comment_id, state } = req.body;
	const reaction = await User.findById(req.user.id).select({
		reactions: { $elemMatch: { commentContext: comment_id } },
	});

	if (reaction.reactions.length) {
		// modify state
		const currentState = reaction.reactions[0].state;
		if (state === currentState) {
			await User.findByIdAndUpdate(
				{ _id: req.user.id },
				{
					$pull: { reactions: { commentContext: comment_id } },
				}
			);
			// decrease amount of the item likes/dislikes
			if (state === false) {
				await Commentary.findByIdAndUpdate(comment_id, {
					$inc: { dislikes: -1 },
				});
			} else {
				await Commentary.findByIdAndUpdate(comment_id, {
					$inc: { likes: -1 },
				});
			}
			return res
				.status(200)
				.json({ success: true, message: "pulled", document });
		} else {
			// user wants to change reaction
			await User.updateOne(
				{ _id: req.user.id, "reactions.commentContext": comment_id },
				{ $set: { "reactions.$.state": state } }
			);
			if (state === false) {
				await Commentary.findByIdAndUpdate(comment_id, {
					$inc: { dislikes: 1, likes: -1 },
				});
			} else {
				await Commentary.findByIdAndUpdate(comment_id, {
					$inc: { likes: 1, dislikes: -1 },
				});
			}
			return res.status(200).json({ success: true, message: "switched" });
		}
	} else {
		// user set reaction
		const user = await User.findByIdAndUpdate(
			{ _id: req.user.id },
			{ $push: { reactions: { commentContext: comment_id, state } } }
		);
		if (state === false) {
			await Commentary.findByIdAndUpdate(comment_id, {
				$inc: { dislikes: 1 },
			});
		} else {
			await Commentary.findByIdAndUpdate(comment_id, {
				$inc: { likes: 1 },
			});
		}
		return res.status(200).json({ success: true, message: "pushed" });
	}
});

module.exports = router;
