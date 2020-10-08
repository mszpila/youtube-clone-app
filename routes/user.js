const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const UserService = require("../libs/user/index");

router.post("/signup", async (req, res, next) => {
	try {
		await UserService.registerUser(req, res, next);
	} catch (err) {
		next(err);
	}
});

router.post("/login", async (req, res, next) => {
	try {
		await UserService.loginUser(req, res, next);
	} catch (err) {
		next(err);
	}
});

router.post("/logout", auth, async (req, res, next) => {
	try {
		await UserService.logoutUser(req, res);
	} catch (err) {
		next(err);
	}
});

router.get("/me", auth, async (req, res, next) => {
	try {
		await UserService.getUser(req, res, next);
	} catch (err) {
		next(err);
	}
});

router.get("/me/subscriptions", auth, async (req, res, next) => {
	try {
		await UserService.userSubscriptions(req, res, next);
	} catch (err) {
		next(err);
	}
});

router.get("/me/subscribe", auth, async (req, res, next) => {
	try {
		await UserService.getSubscribeState(req, res, next);
	} catch (err) {
		next(err);
	}
});

router.post("/me/subscribe", auth, async (req, res, next) => {
	try {
		await UserService.postSubscribeState(req, res, next);
	} catch (err) {
		next(err);
	}
});

router.get("/getUserById", (req, res, next) => {
	UserService.getUserById(req, res, next);
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
