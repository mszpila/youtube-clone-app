const express = require("express");
const router = express.Router();
const Video = require("../model/Video");

router.get("/", (req, res) => {
	const search = req.query.search;
	Video.find(
		{ $text: { $search: search } },
		{ score: { $meta: "textScore" } }
	)
		.sort({ score: { $meta: "textScore" } })
		.populate("user")
		.exec(function (error, results) {
			if (error) return res.status(400).send(error);
			res.status(200).json({ results });
		});
});

router.get("/partial", (req, res) => {
	const { search, limit = 10, offset = 0 } = req.query;
	// { private: false }
	Video.countDocuments(
		{
			$or: [
				{ title: { $regex: search, $options: "i" }, private: false },
				{
					description: { $regex: search, $options: "i" },
					private: false,
				},
			],
		},
		(err, total) => {
			Video.find({
				$or: [
					{
						title: { $regex: search, $options: "i" },
						private: false,
					},
					{
						description: { $regex: search, $options: "i" },
						private: false,
					},
				],
			})
				.populate("user")
				.skip(parseInt(offset))
				.limit(parseInt(limit))
				.exec(function (error, results) {
					if (error) return res.json({ results: error });
					res.status(200).json({ results, total, offset, limit });
				});
		}
	);
});

module.exports = router;
