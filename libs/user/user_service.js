const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createToken = (id) => {
	return new Promise((resolve, reject) => {
		jwt.sign(
			{ id },
			"randomString",
			{
				expiresIn: 3600,
			},
			(error, token) => {
				if (error) {
					let err = new Error("Could not create token", error);
					err.statusCode = 500;
					reject(err);
				} else {
					resolve(token);
				}
			}
		);
	});
};

const registerUser = (User) => async (username, email, password) => {
	if (!username || !email || !password) {
		let err = new Error("Empty field");
		err.statusCode = 500;
		throw err;
	}
	let user = null;
	// cheking username
	user = await User.findOne({
		username,
	});
	if (user) {
		let err = new Error("Username already used");
		err.statusCode = 400;
		throw err;
	}

	// cheking email
	user = await User.findOne({
		email,
	});
	if (user) {
		let err = new Error("Email already used");
		err.statusCode = 400;
		throw err;
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
	return await user.save();
};

const loginUser = (User) => async (login, password) => {
	let user = null;
	// checking user
	user = await User.findOne({
		$or: [{ email: login }, { username: login }],
	});
	if (!user) {
		let err = new Error("Wrong credentials");
		err.statusCode = 400;
		throw err;
	}

	// checking password
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		let err = new Error("Wrong credentials");
		err.statusCode = 400;
		throw err;
	} else {
		return user;
	}
};

const getUser = (User) => async (id) => {
	const user = await User.findById(id);
	if (!user) {
		let err = new Error("Wrong credentials");
		err.statusCode = 400;
		throw err;
	} else {
		return user;
	}
};

const userSubscriptions = (User) => async (id) => {
	User.findById(id)
		.select("subscriptions")
		.populate("subscriptions")
		.exec((error, subscriptions) => {
			if (error) {
				let err = new Error("Cannot get subscriptions", error);
				err.statusCode = 500;
				throw err;
			} else {
				return subscriptions;
			}
		});
};

const getSubscribeState = (User) => async (id, channel_id) => {
	User.findById(id)
		.where("subscriptions")
		.in([channel_id])
		.exec((error, result) => {
			if (error) {
				let err = new Error("Cannot get subscribe state", error);
				err.statusCode = 500;
				throw err;
			} else if (result) {
				return true;
			} else {
				return false;
			}
		});
};

const postSubscribeState = (User) => async (id, channel_id) => {
	const followed = await User.findById(id)
		.where("subscriptions")
		.in([channel_id]);
	if (followed) {
		await User.findByIdAndUpdate(id, {
			$pull: { subscriptions: channel_id },
			$inc: { subscribers: -1 },
		}).exec((error, user) => {
			if (error) {
				let err = new Error("Cannot post subscribe state", error);
				err.statusCode = 500;
				throw err;
			} else {
				return user;
			}
		});
	} else {
		await User.findByIdAndUpdate(id, {
			$addToSet: { subscriptions: channel_id },
			$inc: { subscribers: 1 },
		}).exec((error, user) => {
			if (error) {
				let err = new Error("Cannot post subscribe state", error);
				err.statusCode = 500;
				throw err;
			} else {
				return user;
			}
		});
	}
};

const getUserById = (User) => async (id) => {
	User.findById(id, (error, user) => {
		if (error) {
			let err = new Error("Cannot get the user", error);
			err.statusCode = 500;
			throw err;
		} else {
			return user;
		}
	});
};

const getVideoReaction = (User) => async (id, videoContext) => {
	const reaction = await User.findById(id).select({
		reactions: { $elemMatch: { videoContext } },
	});
	if (reaction.reactions.length) {
		const state = reaction.reactions[0].state;
		return state;
	} else {
		return null;
	}
};

const postVideoReaction = (User, Video) => async (id, videoContext, state) => {
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
	}
	return true;
};

const getCommentReaction = (User) => async (id, commentContext) => {
	const reaction = await User.findById(id).select({
		reactions: { $elemMatch: { commentContext } },
	});
	if (reaction.reactions.length) {
		const state = reaction.reactions[0].state;
		return state;
	} else {
		return null;
	}
};

const postCommentReaction = (User, Video, Commentary) => async (
	id,
	commentContext
) => {
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
	}
	return true;
};

module.exports = (User) => {
	return {
		registerUser: registerUser(User),
		createToken: createToken,
		loginUser: loginUser(User),
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
