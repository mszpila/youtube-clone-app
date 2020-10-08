const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema(
	{
		author: {
			type: mongoose.ObjectId,
			ref: "user",
			required: true,
		},
		content: {
			type: String,
			minLength: 1,
		},
		likes: {
			type: Number,
			default: 0,
		},
		dislikes: {
			type: Number,
			default: 0,
		},
		videoId: {
			type: mongoose.ObjectId,
			ref: "video",
		},
		isComment: {
			type: Boolean,
		},
		// responseTo: {
		// 	type: mongoose.ObjectId,
		// 	ref: "user",
		// },
		reply: [
			{
				type: mongoose.ObjectId,
				ref: "comment",
			},
		],
		repliesNumber: {
			type: Number,
			default: 0,
		},
		// previous: {
		// 	type: mongoose.ObjectId,
		// 	ref: "comment",
		// },
		// next: {
		// 	type: mongoose.ObjectId,
		// 	ref: "comment",
		// },
	},
	{ timestamps: true }
);

// export model user with CommentSchema
module.exports = mongoose.model("comment", CommentSchema);
