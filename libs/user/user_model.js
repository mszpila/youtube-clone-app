const mongoose = require("mongoose");

const ReactionSchema = mongoose.Schema({
	videoContext: {
		type: mongoose.ObjectId,
		ref: "video",
	},
	commentContext: {
		type: mongoose.ObjectId,
		ref: "comment",
	},
	context: {
		type: mongoose.ObjectId,
	},
	state: {
		type: Boolean,
	},
});

const UserSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
		default: "",
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
	videos: [
		{
			type: mongoose.ObjectId,
			ref: "video",
		},
	],
	subscriptions: [
		{
			type: mongoose.ObjectId,
			ref: "user",
		},
	],
	subscribers: {
		type: Number,
		default: 0,
	},
	videoHistory: [
		{
			type: mongoose.ObjectId,
			ref: "video",
		},
	],
	savedVidoes: [
		{
			type: mongoose.ObjectId,
			ref: "video",
		},
	],
	reactions: [ReactionSchema],
});

module.exports = mongoose.model("user", UserSchema);
