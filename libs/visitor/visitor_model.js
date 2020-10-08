const mongoose = require("mongoose");

const VisitorSchema = mongoose.Schema(
	{
		videoId: {
			// type: mongoose.ObjectId,
			// ref: "video",
			type: String,
			required: true,
		},
		hash: {
			type: String,
			required: true,
		},
		createdAt: { type: Date, expires: "1m", default: Date.now },
	}
	// { timestamps: true }
);

// VisitorSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

// export model user with UserSchema
module.exports = mongoose.model("visitor", VisitorSchema);
