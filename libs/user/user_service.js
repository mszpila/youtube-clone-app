const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createToken = (user) => {
	jwt.sign(
		user.id,
		"randomString",
		{
			expiresIn: 3600,
		},
		(err, token) => {
			if (err)
				return res
					.status(500)
					.json({ message: "Could not create token" });
			return res
				.status(200)
				.cookie("login_auth", token, { httpOnly: true })
				.json(token, user);
		}
	);
};

const registerUser = (User) => async (req, res, next) => {
	const { username, email, password } = req.body;
	let user = null;
	try {
		// cheking username
		user = await User.findOne({
			username,
		});
		if (user) {
			return res.status(400).json({
				message: "Username already used",
			});
		}

		// cheking email
		user = await User.findOne({
			email,
		});
		if (user) {
			return res.status(400).json({
				message: "Email already used",
			});
		}

		// creating user object
		user = new User({
			username,
			email,
			password,
		});

		// hashing password
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(password, salt);

		// saving user in db
		await user.save().exec((err) => {
			return res
				.status(500)
				.json({ message: "Could not save user", err });
		});

		return createToken(user);
	} catch (err) {
		next(err);
	}
};

const loginUser = (User) => async (req, res, next) => {
	const { login, password } = req.body;
	let user = null;
	try {
		// checking user
		user = await User.findOne({
			$or: [{ email: login }, { username: login }],
		});
		if (!user)
			return res.status(400).json({
				message: "Wrong credentials",
			});

		// checking password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({
				message: "Wrong credentials",
			});

		return createToken(user);
	} catch (err) {
		next(err);
	}
};

const logoutUser = (req, res) => {
	return res
		.clearCookie("login_auth", { httpOnly: true })
		.status(200)
		.json(true);
};

const getUser = (User) => async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id);
		if (!user)
			return res.status(400).json({
				message: "User not exists",
			});

		return createToken(user);
	} catch (err) {
		next(err);
	}
};

const userSubscriptions = (User) => async (req, res, next) => {
	try {
		User.findById(req.user.id)
			.select("subscriptions")
			.populate("subscriptions")
			.exec((err, subscriptions) => {
				if (err) return res.json(err);
				return res.status(200).json(subscriptions);
			});
	} catch (err) {
		next(err);
	}
};

const getSubscribeState = (User) => async (req, res, next) => {
	const { user_id } = req.query;
	try {
		User.findById(req.user.id)
			.where("subscriptions")
			.in([user_id])
			.exec((err, result) => {
				if (err) return res.status(400).json(err);
				if (result) return res.status(200).json(true);
				else return res.status(200).json(false);
			});
	} catch (err) {
		next(err);
	}
};

const postSubscribeState = (User) => async (req, res, next) => {
	const { user_id } = req.body;
	try {
		const followed = await User.findById(req.user.id)
			.where("subscriptions")
			.in([user_id]);
		if (followed) {
			await User.findByIdAndUpdate(req.user.id, {
				$pull: { subscriptions: user_id },
				$inc: { subscribers: -1 },
			}).exec((err, user) => {
				if (err) return res.json(err);
				return res.status(200).json(user);
			});
		} else {
			await User.findByIdAndUpdate(req.user.id, {
				$addToSet: { subscriptions: user_id },
				$inc: { subscribers: 1 },
			}).exec((err, user) => {
				if (err) return res.json(err);
				return res.status(200).json(user);
			});
		}
	} catch (err) {
		next(err);
	}
};

const getUserById = (User) => async (req, res, next) => {
	try {
		User.findById(req.user.id, (err, user) => {
			if (err) return res.status(400).json(err);
			return res.status(200).json(user);
		});
	} catch (err) {
		next(err);
	}
};

const getVideoReaction = (User) => async (id, videoContext, req, res) => {
	try {
		const reaction = await User.findById(id).select({
			reactions: { $elemMatch: { videoContext } },
		});
		if (reaction.reactions.length) {
			const state = reaction.reactions[0].state;
			return res.status(200).json(state);
		} else {
			return res.status(200).json(null);
		}
	} catch (err) {
		return res.status(500).json({ message: "Server error", err });
	}
};

const postVideoReaction = (User, Video) => async (
	id,
	videoContext,
	state,
	req,
	res
) => {
	try {
		const reaction = await User.findById(id).select({
			reactions: { $elemMatch: { videoContext } },
		});

		if (reaction.reactions.length) {
			// already reacted ==> modify state
			const currentState = reaction.reactions[0].state;
			if (state === currentState) {
				// user what to remove the reaction
				await User.findByIdAndUpdate(
					{ _id: id },
					{
						$pull: { reactions: { videoContext } },
					}
				);
				// decrease amount of the item likes/dislikes
				if (state === false) {
					await Video.findByIdAndUpdate(videoContext, {
						$inc: { dislikes: -1 },
					});
				} else {
					await Video.findByIdAndUpdate(videoContext, {
						$inc: { likes: -1 },
					});
				}
				return res
					.status(200)
					.json({ success: true, message: "pulled" });
			} else {
				// user wants to change reaction
				await User.updateOne(
					{ _id: id, "reactions.videoContext": videoContext },
					{ $set: { "reactions.$.state": state } }
				);
				if (state === false) {
					await Video.findByIdAndUpdate(videoContext, {
						$inc: { dislikes: 1, likes: -1 },
					});
				} else {
					await Video.findByIdAndUpdate(videoContext, {
						$inc: { likes: 1, dislikes: -1 },
					});
				}
				return res
					.status(200)
					.json({ success: true, message: "switched" });
			}
		} else {
			// user set reaction
			const user = await User.findByIdAndUpdate(
				{ _id: id },
				{ $push: { reactions: { videoContext, state } } }
			);
			if (state === false) {
				await Video.findByIdAndUpdate(videoContext, {
					$inc: { dislikes: 1 },
				});
			} else {
				await Video.findByIdAndUpdate(videoContext, {
					$inc: { likes: 1 },
				});
			}
			return res.status(200).json({ success: true, message: "pushed" });
		}
	} catch (err) {
		return res.status(500).json({ message: "Server error", err });
	}
};

const getCommentReaction = (User) => async (id, commentContext, req, res) => {
	try {
		const reaction = await User.findById(id).select({
			reactions: { $elemMatch: { commentContext } },
		});
		if (reaction.reactions.length) {
			const state = reaction.reactions[0].state;
			return res.status(200).json(state);
		} else {
			return res.status(200).json(null);
		}
	} catch (err) {
		return res.status(500).json({ message: "Server error", err });
	}
};

const postCommentReaction = (User, {}, Commentary, req, res) => async (
	id,
	commentContext
) => {
	try {
		const reaction = await User.findById(id).select({
			reactions: { $elemMatch: { commentContext } },
		});

		if (reaction.reactions.length) {
			// modify state
			const currentState = reaction.reactions[0].state;
			if (state === currentState) {
				await User.findByIdAndUpdate(
					{ _id: id },
					{
						$pull: { reactions: { commentContext } },
					}
				);
				// decrease amount of the item likes/dislikes
				if (state === false) {
					await Commentary.findByIdAndUpdate(commentContext, {
						$inc: { dislikes: -1 },
					});
				} else {
					await Commentary.findByIdAndUpdate(commentContext, {
						$inc: { likes: -1 },
					});
				}
				return res
					.status(200)
					.json({ success: true, message: "pulled" });
			} else {
				// user wants to change reaction
				await User.updateOne(
					{ _id: id, "reactions.commentContext": commentContext },
					{ $set: { "reactions.$.state": state } }
				);
				if (state === false) {
					await Commentary.findByIdAndUpdate(commentContext, {
						$inc: { dislikes: 1, likes: -1 },
					});
				} else {
					await Commentary.findByIdAndUpdate(commentContext, {
						$inc: { likes: 1, dislikes: -1 },
					});
				}
				return res
					.status(200)
					.json({ success: true, message: "switched" });
			}
		} else {
			// user set reaction
			const user = await User.findByIdAndUpdate(
				{ _id: id },
				{ $push: { reactions: { commentContext, state } } }
			);
			if (state === false) {
				await Commentary.findByIdAndUpdate(commentContext, {
					$inc: { dislikes: 1 },
				});
			} else {
				await Commentary.findByIdAndUpdate(commentContext, {
					$inc: { likes: 1 },
				});
			}
			return res.status(200).json({ success: true, message: "pushed" });
		}
	} catch (err) {
		return res.status(500).json({ message: "Server error", err });
	}
};

module.exports = (User) => {
	return {
		registerUser: registerUser(User),
		createToken: createToken,
		loginUser: loginUser(User),
		logoutUser: logoutUser,
		getUser: getUser(User),
		userSubscriptions: userSubscriptions(User),
		getSubscribeState: getSubscribeState(User),
		postSubscribeState: postSubscribeState(User),
		getUserById: getUserById(User),
		getVideoReaction: getVideoReaction(User),
		postVideoReaction: postVideoReaction(User),
		getCommentReaction: getCommentReaction(User),
		postCommentReaction: postCommentReaction(User),
	};
};
