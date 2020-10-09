require("dotenv").config();
const express = require("express");
const user = require("./routes/user");
const video = require("./routes/video");
const comment = require("./routes/comment");
const search = require("./routes/search");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("/public", express.static("public"));
app.use(express.static(path.join(__dirname, "client/build")));

app.get("/api", (req, res) => {
	res.json({ message: "API Working" });
});

app.use("/api/user", user);
app.use("/api/video", video);
app.use("/api/comment", comment);
app.use("/api/search", search);

app.use((err, req, res, next) => {
	console.error(err);
	res.status(err.statusCode || 500).json({ message: "Server error" });
});

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

module.exports = app;
