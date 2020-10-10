const express = require("express");
const router = express.Router();
const Commentary = require("../libs/comment/comment_model");
const Video = require("../libs/video/video_model");
const auth = require("../middleware/auth");

router.post("/addComment", auth, async (req, res) => {
	const { video_id, content } = req.body;
	const video = await Video.findById(video_id);
	const comment = new Commentary({
		author: req.user.id,
		content,
		videoId: video._id,
	});
	await comment.save();
	video.updateOne(
		{
			$push: {
				comments: comment._id,
			},

			$inc: {
				commentsNumber: 1,
			},
		},
		function (err) {
			if (err) console.log(err);
			return res.json({ success: true, video, comment });
		}
	);
});

router.post("/addReply", auth, async (req, res) => {
	const { comment_id, content } = req.body;
	const reply = new Commentary({
		author: req.user.id,
		content,
	});
	await reply.save();
	Commentary.findByIdAndUpdate(
		comment_id,
		{
			$push: {
				reply: reply._id,
			},
			$inc: {
				repliesNumber: 1,
			},
		},
		function (err, doc) {
			if (err) console.log(err);
			return res.json({ success: true, reply });
		}
	);
});

router.get("/loadReply", (req, res) => {
	const { comment_id } = req.body;
	Commentary.findById(comment_id)
		.populate("reply")
		.exec((err, doc) => {
			if (err) return res.json({ success: false, err });
			return res.json({ success: true, reply: doc.reply });
		});
});

router.get("/getComments", async (req, res) => {
	const { id, limit = 10, offset = 0 } = req.query;
	Commentary.find({ videoId: id, isComment: true })
		.populate("author")
		.sort("-createdAt")
		.skip(offset)
		.limit(limit)
		.exec((err, result) => {
			if (err) return res.status(400).send(err);
			res.status(200).json(result);
		});
});

module.exports = router;
