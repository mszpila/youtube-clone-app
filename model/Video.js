const mongoose = require("mongoose");

const VideoSchema = mongoose.Schema({
	owner: {
		type: mongoose.ObjectId,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	date: {
		type: Date,
	},
	views: {
		type: Number,
		default: 0,
	},
	likes: {
		type: Number,
		default: 0,
	},
	dislikes: {
		type: Number,
		default: 0,
	},
	comments: {
		type: Array,
		default: [],
	},
	urls: {
		video_url: {
			type: String,
			required: true,
		},
		thumbnail_url: {
			type: String,
			required: true,
		},
		preview_url: {
			type: String,
			required: true,
		},
	},
});

// export model user with UserSchema
module.exports = mongoose.model("video", VideoSchema);
