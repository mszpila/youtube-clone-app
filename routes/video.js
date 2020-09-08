const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../model/User");
const auth = require("../middleware/auth");

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
		if (
			file.mimetype == "video/mp4" ||
			file.mimetype == "video/mkv" ||
			file.mimetype == "video/flv"
		) {
			cb(null, true);
		} else {
			cb(null, false);
			return cb(
				new Error("Not supported format. Choose .mp4, .mkv or .flv")
			);
		}
	},
});

const upload = multer({ storage });

router.post("/upload", upload.single("video"), auth, (req, res) => {
	User.findByIdAndUpdate(
		req.user.id,
		{
			$push: {
				"urls.videos": {
					video_url: `${req.file.path}`,
					thumbnail_url: "",
				},
			},
		},
		function (err, model) {
			console.log(err);
		}
	);
	return res.json({ success: true });
});

// app.post("/add", upload.single("image"), (req, res, next) => {
// 	// const user = new User({
// 	//     _id: new mongoose.Types.ObjectId(),
// 	//     name: req.body.name,
// 	//     imageURL: req.file.path
// 	// });
// 	User.findByIdAndUpdate({}, { urls: req.file.path });
// 	user.save().then((result) => {
// 		res.status(201).json({
// 			message: "User registered successfully!",
// 		});
// 	});
// });

module.exports = router;
