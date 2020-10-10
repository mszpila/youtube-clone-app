const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const UserService = require("../libs/user/index");

router.post("/register", async (req, res, next) => {
	const { username, email, password } = req.body;
	try {
		const user = await UserService.registerUser(username, email, password);
		const token = await UserService.createToken(user._id);
		res.status(200)
			.cookie("login_auth", token, { httpOnly: true })
			.json(user);
	} catch (err) {
		next(err);
	}
});

router.post("/login", async (req, res, next) => {
	const { login, password } = req.body;
	try {
		const user = await UserService.loginUser(login, password);
		const token = UserService.createToken(user);
		res.status(200)
			.cookie("login_auth", token, { httpOnly: true })
			.json(token, user);
	} catch (err) {
		next(err);
	}
});

router.delete("/logout", auth, async (req, res, next) => {
	res.clearCookie("login_auth", { httpOnly: true }).status(200).json(true);
});

router.get("/me", auth, async (req, res, next) => {
	try {
		const user = await UserService.getUser(req.user.id);
		const token = UserService.createToken(user);
		res.status(200)
			.cookie("login_auth", token, { httpOnly: true })
			.json(token, user);
	} catch (err) {
		next(err);
	}
});

router.get("/me/subscriptions", auth, async (req, res, next) => {
	try {
		const subscriptions = await UserService.userSubscriptions(req.user.id);
		res.status(200).json(subscriptions);
	} catch (err) {
		next(err);
	}
});

router.get("/me/subscribe", auth, async (req, res, next) => {
	const { channel_id } = req.query;
	try {
		const state = await UserService.getSubscribeState(
			req.user.id,
			channel_id
		);
		res.status(200).json(state);
	} catch (err) {
		next(err);
	}
});

router.post("/me/subscribe", auth, async (req, res, next) => {
	const { channel_id } = req.body;
	try {
		const user = await UserService.postSubscribeState(
			req.user.id,
			channel_id
		);
		res.status(200).json(user);
	} catch (err) {
		next(err);
	}
});

router.get("/getUserById", async (req, res, next) => {
	const { id } = req.query;
	try {
		const user = await UserService.getUserById(id);
		res.status(200).json(user);
	} catch (err) {
		next(err);
	}
});

router.get("/reactionVideo", auth, async (req, res, next) => {
	const { videoContext } = req.query;
	try {
		const state = await UserService.getVideoReaction(
			req.user.id,
			videoContext
		);
		res.status(200).json(state);
	} catch (err) {
		next(err);
	}
});

router.get("/reactionComment", auth, async (req, res, next) => {
	const { commentContext } = req.query;
	try {
		const state = await UserService.getCommentReaction(
			req.user.id,
			commentContext
		);
		res.status(200).json(state);
	} catch (err) {
		next(err);
	}
});

router.post("/reactionVideo", auth, async (req, res, next) => {
	const { video_id, state } = req.body;
	try {
		const result = await UserService.postVideoReaction(
			req.user.id,
			video_id,
			state
		);
		res.status(200).json(result);
	} catch (err) {
		next(err);
	}
});

router.post("/reactionComment", auth, async (req, res, next) => {
	const { comment_id, state } = req.body;
	try {
		const result = await UserService.postCommentReaction(
			req.user.id,
			comment_id,
			state
		);
		res.status(200).json(result);
	} catch (err) {
		next(err);
	}
});

module.exports = router;
