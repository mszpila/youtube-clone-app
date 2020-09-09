const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../model/User");
const Video = require("../model/Video");
const auth = require("../middleware/auth");
const ffmpeg = require("fluent-ffmpeg");

// Set storage
let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/videos/");
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
		return ffmpeg()
			.input(inputPath)
			.inputOptions([`-ss ${startPreviewInSec}`])
			.outputOptions([`-t ${previewDurationInSec}`])
			.noAudio()
			.format("gif")
			.output(outputPath)
			.on("end", function () {
				resolve(outputPath);
			})
			.on("error", function () {
				reject("Cannot create the preview");
			})
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
				// console.log("Will generate " + filenames.join(", "));
				thumbsPath = filenames.map((item) => `${outputPath}/${item}`);
			})
			.on("end", function () {
				// console.log("Screenshots taken");
				resolve(thumbsPath);
			})
			.on("error", reject)
			.screenshots({
				// Will take screens at 20%, 40%, 60% and 80% of the video
				count: 1,
				folder: outputPath,
				filename: `${customFilename}_%i`,
			});
	});
};

router.post("/upload", upload.single("video"), auth, async (req, res) => {
	const customFilename = req.file.filename.split(".").slice(0, -1)[0];
	// generate thumbnail
	// four thumbs for the user to choose
	const thumbs = await createThumbnails(
		req.file.path,
		"uploads/thumbnails",
		customFilename
	);

	// get metadata of the uploaded video
	const duration = await getDuration(req.file.path);

	// generate preview
	const preview = await createPreview(
		req.file.path,
		`uploads/previews/${customFilename}.gif`,
		Math.floor(duration)
	);

	// create the new model in db - video with url to itself, its
	// thumbnail and preview = no need for creating folders with proper
	// names etc., just links in db

	// how to distinguish two files with the same name? by Date.now(),
	// the tile can be the same, because it is not the part of the file
	// name saved in the public folder

	// send user generated thumbs, but don't save them until the user
	// choose one by click and send it back to you, he can also use
	// custom/own thumbnail

	// distinguish between upload video and save video

	// save the urls in db - it should be the last thing to
	// execute before returning json
	let video = new Video({
		owner: req.user.id,
		title: customFilename,
		date: customFilename.split("_")[0],
		urls: {
			video_url: req.file.path.replace(/\\/g, "/"),
			thumbnail_url: thumbs[0],
			preview_url: preview,
		},
	});
	await video.save();
	User.findByIdAndUpdate(
		req.user.id,
		{
			$push: {
				videos: video,
				// video_url: `${req.file.path.replace(/\\/g, "/")}`,
				// thumbnail_url: thumbs[0],
				// preview_url: preview,
			},
		},
		function (err, model) {
			if (err) console.log(err);
			return res.json({ success: true, video });
		}
	);
	// console.log("preview: ", preview, "thumbs:", thumbs);
	// return res.json({ success: true });
});

router.post("/thumbnail", (req, res) => {});

module.exports = router;
