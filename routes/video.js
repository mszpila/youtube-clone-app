const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../model/User");
const Video = require("../model/Video");
const Commentary = require("../model/Comment");
const auth = require("../middleware/auth");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const Visitor = require("../model/Visitor");
const AWS = require("aws-sdk");
// var S3 = require("aws-sdk/clients/s3");

const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Set storage
let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/uploads/videos/");
	},
	filename: function (req, file, cb) {
		// cb(null, file.fieldname + "-" + Date.now());
		const fileName = `${Date.now()}_${file.originalname
			.toLowerCase()
			.split(" ")
			.join("_")}`;
		cb(null, fileName);
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype == "video/mp4" || file.mimetype == "video/mkv") {
			cb(null, true);
		} else {
			return cb(
				new Error("Not supported format. Choose .mp4 or .mkv", false)
			);
		}
	},
});

const upload = multer({ storage });

const getDuration = (path) => {
	return new Promise((resolve, reject) => {
		return ffmpeg.ffprobe(path, (err, metadata) => {
			if (err) return reject(err);
			const { duration } = metadata.format;
			return resolve(duration);
		});
	});
};

const createPreview = (
	inputPath,
	outputPath,
	sourceDurationInSec,
	previewDurationInSec = 4
) => {
	return new Promise((resolve, reject) => {
		// by subtracting the fragment duration we can be sure that the resulting
		// start time + fragment duration will be less than the video
		// duration
		let safeVideoDurationInSeconds =
			sourceDurationInSec - previewDurationInSec;

		// if the fragment duration is longer than the video duration
		if (safeVideoDurationInSeconds <= 0) {
			safeVideoDurationInSeconds = 0;
		}

		const startPreviewInSec = getRandomIntegerInRange(
			0.25 * safeVideoDurationInSeconds,
			0.5 * safeVideoDurationInSeconds
		);
		return (
			ffmpeg()
				.input(inputPath)
				.inputOptions([`-ss ${startPreviewInSec}`])
				.outputOptions([`-t ${previewDurationInSec}`])
				.noAudio()
				.size("1280x720")
				// .complexFilter(
				// 	"[0:v] split [a][b];[a] palettegen [p];[b][p] paletteuse"
				// )
				.format("gif")
				.outputOption(["-loop -1"])
				.output(outputPath)
				.on("end", function () {
					resolve(outputPath);
				})
				.on("error", function () {
					reject("Cannot create the preview");
				})
				.run()
		);
	});
};

const createXFrames = (
	inputPath,
	outputPath,
	sourceDurationInSec,
	numberOfFrames
) => {
	return new Promise((resolve, reject) => {
		// 1/frameIntervalInSeconds = 1 frame each x seconds
		const frameIntervalInSeconds = Math.floor(
			sourceDurationInSec / numberOfFrames
		);

		return ffmpeg()
			.input(inputPath)
			.outputOptions([`-vf fps=1/${frameIntervalInSeconds}`])
			.output(outputPath)
			.on("end", resolve)
			.on("error", reject)
			.run();
	});
};

const getRandomIntegerInRange = (min, max) => {
	const minInt = Math.ceil(min);
	const maxInt = Math.floor(max);

	return Math.floor(Math.random() * (maxInt - minInt + 1) + minInt);
};

const createThumbnails = (inputPath, outputPath, customFilename) => {
	return new Promise((resolve, reject) => {
		let thumbsPath = [];
		return ffmpeg()
			.input(inputPath)
			.on("filenames", function (filenames) {
				thumbsPath = filenames.map((item) => `${outputPath}/${item}`);
			})
			.on("end", function () {
				resolve(thumbsPath);
			})
			.on("error", reject)
			.screenshots({
				// Will take screens at 20%, 40%, 60% and 80% of the video
				count: 1,
				folder: outputPath,
				filename: `${customFilename}.png`,
				size: "1280x720",
			});
	});
};

const createXFramesPreview = (
	framesPath,
	thumbnailPath,
	outputPath,
	tempDir
) => {
	return new Promise((resolve, reject) => {
		return (
			ffmpeg()
				.input(framesPath)
				// .addInput(thumbnailPath)
				// .input(thumbnailPath)
				.size("1280x720")
				.format("gif")
				.inputFPS(2.5)
				.outputOption(["-loop -1"])
				// .mergeToFile(outputPath, tempDir)
				.output(outputPath)
				.on("end", function () {
					resolve(outputPath);
				})
				.on("error", function () {
					reject("Cannot create the preview");
				})
				.run()
		);
	});
};

router.post("/upload", auth, upload.single("video"), async (req, res) => {
	const customFilename = req.file.filename.split(".").slice(0, -1)[0];
	// generate thumbnail
	const thumbs = await createThumbnails(
		req.file.path,
		"public/uploads/thumbnails",
		customFilename
	);

	// get metadata of the uploaded video
	const durationMetadata = await getDuration(req.file.path);
	const duration = Math.floor(durationMetadata);

	// generate preview
	const preview = await createPreview(
		req.file.path,
		`public/uploads/previews/${customFilename}.gif`,
		duration
	);

	// const previewThumb = await previewWithThumb(
	// 	`public/uploads/previews/${customFilename}.gif`,
	// 	`public/uploads/thumbnails/${customFilename}.gif`,
	// 	`public/uploads/previews/${customFilename}_new.gif`
	// );

	// const frames = await createXFrames(
	// 	req.file.path,
	// 	`public/uploads/frames/${customFilename}_%d.png`,
	// 	duration,
	// 	10
	// );

	// const framesPreview = await createXFramesPreview(
	// 	`public/uploads/frames/${customFilename}_%d.png`, // frames input
	// 	`public/uploads/thumbnails/${customFilename}.png`, // thumbnail input
	// 	`public/uploads/previews/${customFilename}_x.gif`, // path the save the frame preview
	// 	`public/uploads/temp`
	// );

	// for (let i = 0; i < 11; i++) {
	// 	fs.unlink(
	// 		path.join(`public/uploads/frames/${customFilename}_${i}.png`),
	// 		function (err) {
	// 			if (err && err.code == "ENOENT") {
	// 				// file doens't exist
	// 				// console.info("File doesn't exist, won't remove it.");
	// 				// return res.json(err);
	// 			} else if (err) {
	// 				// other errors, e.g. maybe we don't have enough permission
	// 				// console.error("Error occurred while trying to remove file");
	// 				// return res.json(err);
	// 			}
	// 		}
	// 	);
	// }

	// Setting up S3 upload parameters
	const paramsVideo = {
		Bucket: `${process.env.S3_BUCKET_NAME}/public/uploads/videos`,
		Key: `${customFilename}.mp4`, // File name you want to save as in S3
		// Body: `public/uploads/videos/${customFilename}.gif`,
		Body: fs.readFileSync(
			path.join(`public/uploads/videos/${customFilename}.mp4`)
		),
	};

	const paramsThumbnail = {
		Bucket: `${process.env.S3_BUCKET_NAME}/public/uploads/thumbnails`,
		Key: `${customFilename}.png`, // File name you want to save as in S3
		// Body: `public/uploads/thumbnails/${customFilename}.png`,
		Body: fs.readFileSync(
			path.join(`public/uploads/thumbnails/${customFilename}.png`)
		),
	};

	const paramsPreview = {
		Bucket: `${process.env.S3_BUCKET_NAME}/public/uploads/previews`,
		Key: `${customFilename}.gif`, // File name you want to save as in S3
		// Body: `public/uploads/previews/${customFilename}.gif`,
		Body: fs.readFileSync(
			path.join(`public/uploads/previews/${customFilename}.gif`)
		),
	};

	const videoUpload = () => {
		return new Promise((resolve) => {
			s3.upload(paramsVideo, function (err, data) {
				if (err) {
					throw err;
				}
				// console.log(`File uploaded successfully. ${data.Location}`);
				resolve(data.Location);
			});
		});
	};

	const video_url = await videoUpload();

	const thumbnailUpload = () => {
		return new Promise((resolve) => {
			s3.upload(paramsThumbnail, function (err, data) {
				if (err) {
					throw err;
				}
				// console.log(`File uploaded successfully. ${data.Location}`);
				resolve(data.Location);
			});
		});
	};

	const thumbnail_url = await thumbnailUpload();

	const previewUpload = () => {
		return new Promise((resolve) => {
			s3.upload(paramsPreview, function (err, data) {
				if (err) {
					throw err;
				}
				// console.log(`File uploaded successfully. ${data.Location}`);
				resolve(data.Location);
			});
		});
	};

	const preview_url = await previewUpload();

	// Uploading files to the bucket
	// s3.upload(params, function(err, data) {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	console.log(`File uploaded successfully. ${data.Location}`);
	// });

	let video = new Video({
		user: req.user.id,
		title: customFilename,
		urls: {
			// video_url: req.file.path.replace(/\\/g, "/"),
			// thumbnail_url: thumbs[0],
			// preview_url: preview,
			video_url,
			thumbnail_url,
			preview_url,
		},
		duration,
	});
	await video.save();
	User.findByIdAndUpdate(
		req.user.id,
		{
			$push: {
				videos: video._id,
			},
		},
		function (err) {
			if (err) console.error(err);
			return res.json(video);
		}
	);

	// res.status(200).json(video);
});

router.get("/getVideos", (req, res) => {
	const { limit = 20, offset = 0 } = req.query;
	Video.countDocuments({ private: false }, (err, total) => {
		Video.find({ private: false })
			.populate("user")
			.sort("-createdAt")
			.skip(parseInt(offset))
			.limit(parseInt(limit))
			.exec((err, videos) => {
				if (err) return res.status(400).send(err);
				res.status(200).json({ videos, total, offset, limit });
			});
	});
});

router.get("/getVideoById", (req, res) => {
	Video.findById(req.query.id)
		.populate("user")
		.populate({
			path: "comments",
			populate: {
				path: "author",
			},
		})
		.exec((err, video) => {
			if (err) return res.status(400).send(err);
			res.status(200).json({ video });
		});
});

router.post("/save", auth, async (req, res) => {
	const { title, description, category, private, id } = req.body;
	const video = await Video.findById(id).populate("user");
	if (video.user.id === req.user.id) {
		Video.findByIdAndUpdate(
			{ _id: req.body.id },
			{
				$set: {
					title,
					description,
					// category,
					private,
					publishDate: Date.now(),
				},
			},
			(err, saved) => {
				if (err) return res.status(400).json({ err });
				res.status(200).json({ saved });
			}
		);
	} else {
		res.status(401).json({ message: "forbbiden access" });
	}
});

router.get("/getComments", async (req, res) => {
	const { id, limit = 10, offset = 0 } = req.query;
	Commentary.countDocuments(
		{ videoId: id, isComment: true },
		(err, total) => {
			Commentary.find({ videoId: id, isComment: true })
				.populate("author")
				.sort("-createdAt")
				.skip(parseInt(offset))
				.limit(parseInt(limit))
				.exec((err, comments) => {
					if (err) return res.status(400).send(err);
					res.status(200).json({ comments, total, offset, limit });
				});
		}
	);
});

router.post("/addComment", auth, async (req, res) => {
	const { video_id, content } = req.body;
	const video = await Video.findById(video_id);
	const comment = new Commentary({
		author: req.user.id,
		content,
		videoId: video_id,
		isComment: true,
	});

	await video.updateOne({
		$push: {
			comments: comment._id,
		},
		$inc: {
			commentsNumber: 1,
		},
	});
	await comment.save();
	comment.populate("author", (err, comment) => {
		if (err) console.error(err);
		return res.json(comment);
	});
});

// router.post("/addCommentOld", auth, async (req, res) => {
// 	const { video_id, content } = req.body;
// 	const video = await Video.findById(video_id); // id of the video
// 	const comment = new Commentary({
// 		author: req.user.id,
// 		content,
// 		videoId: video._id,
// 	});
// 	await comment.save();
// 	video.updateOne(
// 		{
// 			$push: {
// 				comments: comment._id,
// 			},
// 			$inc: {
// 				commentsNumber: 1,
// 			},
// 		},
// 		function (err) {
// 			if (err) console.log(err);
// 			return res.json({ success: true, video, comment });
// 		}
// 	);
// });

router.post("/addReply", auth, async (req, res) => {
	const { video_id, comment_id, content } = req.body;
	const reply = new Commentary({
		author: req.user.id,
		content,
		videoId: video_id,
		isComment: false,
	});

	await Commentary.findByIdAndUpdate(
		comment_id,
		{
			$push: {
				reply: reply._id,
			},
			$inc: {
				repliesNumber: 1,
			},
		}
		// function (err, doc) {
		// 	if (err) console.log(err);
		// 	return res.json({ success: true, reply });
		// }
	);
	await reply.save();
	reply.populate("author", (err, reply) => {
		if (err) console.error(err);
		return res.json(reply);
	});
});

// router.post("/addReplyOld", auth, async (req, res) => {
// 	const { comment_id, content } = req.body;
// 	const reply = new Commentary({
// 		author: req.user.id,
// 		content,
// 	});
// 	await reply.save();
// 	Commentary.findByIdAndUpdate(
// 		comment_id,
// 		{
// 			$push: {
// 				reply: reply._id,
// 			},
// 			$inc: {
// 				repliesNumber: 1,
// 			},
// 		},
// 		function (err, doc) {
// 			if (err) console.log(err);
// 			return res.json({ success: true, reply });
// 		}
// 	);
// });

router.get("/loadReply", (req, res) => {
	const { comment_id } = req.query;
	Commentary.findById(comment_id)
		// .populate("reply")
		.populate({
			path: "reply",
			populate: {
				path: "author",
			},
		})
		.exec((err, reply) => {
			if (err) return res.json(err);
			return res.json(reply);
		});
});

router.get("/getVideoReactions", (req, res) => {
	Video.findById(req.query.id)
		.select("likes dislikes")
		.exec((err, reactions) => {
			if (err) return res.json({ success: false, err });
			return res.json({ success: true, reactions });
		});
});

router.get("/videoHistory", auth, async (req, res) => {
	const { limit = 20, offset = 0 } = req.body;
	// const history = await User.findById(req.user.id).select("videoHistory");
	const query = await User.findById(req.user.id).select({
		videoHistory: { $slice: [offset, limit] },
	});
	res.status(200).json({ success: true, query });
});
router.post("/addToHistory", auth, async (req, res) => {
	const { video_id } = req.body;
	// check if it is already in the array
	// if so, change its index
	// if not, push it
	const stored = await User.findById(req.user.id)
		.where("videoHistory")
		.in([video_id]);
	if (stored) {
		await User.findByIdAndUpdate(req.user.id, {
			$pull: { videoHistory: video_id },
		});
	}
	await User.findByIdAndUpdate(req.user.id, {
		$push: {
			videoHistory: video_id,
		},
	});
	return res.status(200).json({ success: true, stored });
});
router.post("/removeFromHistory", auth, async (req, res) => {
	const { video_id } = req.body;
	// find it and remove it from the array
	await User.findByIdAndUpdate(req.user.id, {
		$pull: { videoHistory: video_id },
	});
	return res.status(200).json({ success: true });
});

router.get("/myVideos", auth, (req, res) => {
	const { limit = 10, offset = 0 } = req.query;
	Video.countDocuments({ user: req.user.id }, (err, total) => {
		Video.find({ user: req.user.id })
			.sort("-createdAt")
			.skip(parseInt(offset))
			.limit(parseInt(limit))
			.exec((err, videos) => {
				if (err) return res.status(400).send(err);
				res.status(200).json({ videos, total, offset, limit });
			});
	});
});

router.post("/remove", auth, async (req, res) => {
	const { id } = req.body;
	// if (id !== req.user.id) {
	// 	res.status(401).json("you don't own this video");
	// }

	const video = await Video.findById(id).select("urls");
	// console.log("video", `${video.urls.video_url.split("/").slice(-1)[0]}`);

	// Setting up S3 upload parameters
	const paramsVideo = {
		Bucket: `${process.env.S3_BUCKET_NAME}/public/uploads/videos`,
		Key: `${video.urls.video_url.split("/").slice(-1)[0]}`, // File name you want to save as in S3
	};

	const paramsThumbnail = {
		Bucket: `${process.env.S3_BUCKET_NAME}/public/uploads/thumbnails`,
		Key: `${video.urls.thumbnail_url.split("/").slice(-1)[0]}`, // File name you want to save as in S3
	};

	const paramsPreview = {
		Bucket: `${process.env.S3_BUCKET_NAME}/public/uploads/previews`,
		Key: `${video.urls.preview_url.split("/")[-1]}`, // File name you want to save as in S3
	};

	// let files = [];
	// files.push(video.urls.video_url);
	// files.push(video.urls.thumbnail_url);
	// files.push(video.urls.preview_url);

	// files.forEach((file) => {
	// 	fs.unlink(path.join(file), function (err) {
	// 		if (err && err.code == "ENOENT") {
	// 			// file doens't exist
	// 			// console.info("File doesn't exist, won't remove it.");
	// 			// return res.json(err);
	// 		} else if (err) {
	// 			// other errors, e.g. maybe we don't have enough permission
	// 			// console.error("Error occurred while trying to remove file");
	// 			// return res.json(err);
	// 		}
	// 		// else {
	// 		// 	console.info(`removed`);
	// 		// }
	// 	});
	// });
	const videoDelete = () => {
		return new Promise((resolve) => {
			s3.deleteObject(paramsVideo, function (err, data) {
				if (err) {
					throw err;
				}
				// console.log(`File uploaded successfully. ${data.Location}`);
				resolve(data.Deleted);
			});
		});
	};

	const videoResult = await videoDelete();

	const thumbnailDelete = () => {
		return new Promise((resolve) => {
			s3.deleteObject(paramsThumbnail, function (err, data) {
				if (err) {
					throw err;
				}
				// console.log(`File uploaded successfully. ${data.Location}`);
				resolve(data.Deleted);
			});
		});
	};

	const thumbnailResult = await thumbnailDelete();

	const previewDelete = () => {
		return new Promise((resolve) => {
			s3.deleteObject(paramsPreview, function (err, data) {
				if (err) {
					throw err;
				}
				// console.log(`File uploaded successfully. ${data.Location}`);
				resolve(data.Deleted);
			});
		});
	};

	const previewResult = await previewDelete();

	Video.findByIdAndDelete(id, (err, deletedVideo) => {
		if (err) return res.json(err);
		Commentary.deleteMany({ videoId: id }, (err, deletedComments) => {
			if (err) return res.json(err);
			res.status(200).json(true);
		});
	});
	// res.status(200).json(videoResult, thumbnailResult, previewResult);
});

router.post("/addView", async (req, res) => {
	const { id, hash } = req.body;
	const visited = await Visitor.find({ videoId: id, hash });
	if (!visited.length) {
		let visitor = new Visitor({
			videoId: id,
			hash,
		});
		await visitor.save();
		Video.findByIdAndUpdate(
			{ _id: id },
			{ $inc: { views: 1 } },
			(err, update) => {
				res.status(200).json(update);
			}
		);
	}
});

router.get("/getThumbnail", (req, res) => {});
router.post("/uploadThumbnail", (req, res) => {});

module.exports = router;
