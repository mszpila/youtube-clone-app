require("dotenv").config();
const express = require("express");
const user = require("./routes/user");
const video = require("./routes/video");
const comment = require("./routes/comment");
const search = require("./routes/search");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const InitiateMongoServer = require("./config/db");
const cors = require("cors");

// Initiate Mongo Server
InitiateMongoServer();

const app = express();

// PORT
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors()); // { origin: "http://localhost:3000/", credentials: true })
app.use("/public", express.static("public"));

app.get("/", (req, res) => {
	res.json({ message: "API Working" });
});

app.use("/user", user);
app.use("/video", video);
app.use("/comment", comment);
app.use("/search", search);

app.listen(PORT, (req, res) => {
	console.log(`Server Started at PORT ${PORT}`);
});
