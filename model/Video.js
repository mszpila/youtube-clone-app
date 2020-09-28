const mongoose = require("mongoose");
// const mongoose_fuzzy_searching = require("mongoose-fuzzy-searching");

const VideoSchema = mongoose.Schema(
	{
		user: {
			type: mongoose.ObjectId,
			required: true,
			ref: "user",
		},
		title: {
			type: String,
			maxLength: 100,
			// text: true,
		},
		description: {
			type: String,
			default: "",
			// text: true,
		},
		publishDate: {
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
		comments: [
			{
				type: mongoose.ObjectId,
				ref: "comment",
			},
		],
		commentsNumber: {
			type: Number,
			default: 0,
		},
		urls: {
			video_url: {
				type: String,
				required: true,
			},
			thumbnail_url: {
				type: String,
			},
			preview_url: {
				type: String,
				required: true,
			},
		},
		private: {
			type: Boolean,
			default: true,
		},
		category: {
			type: String,
			default: "",
		},
		duration: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

// VideoSchema.plugin(mongoose_fuzzy_searching, {
// 	fields: [
// 		{
// 			name: "title",
// 			minSize: 1,
// 			weight: 2,
// 		},
// 		{
// 			name: "description",
// 			minSize: 2,
// 		},
// 	],
// });

VideoSchema.index({ title: "text", description: "text" });

// export model user with UserSchema
module.exports = mongoose.model("video", VideoSchema);
