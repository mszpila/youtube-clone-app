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
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Initiate Mongo Server
InitiateMongoServer();

const app = express();

// PORT
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
	origin: (origin, callback) => {
		if (process.env.WHITELIST_URLS.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS policy"));
		}
	},
};
app.use(cors(corsOptions));

const requireHTTPS = (req, res, next) => {
	// The 'x-forwarded-proto' check is for Heroku
	if (
		!req.secure &&
		req.get("x-forwarded-proto") !== "https" &&
		process.env.NODE_ENV !== "development"
	) {
		return res.redirect("https://" + req.headers.host + req.url);
	}
	next();
};

app.use(requireHTTPS);

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const limiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 500, // limit each IP to 100 requests per windowMs
});

// only apply to requests that begin with /api/
app.use("/api/", limiter);

app.use("/public", express.static("public"));
app.use(express.static(path.join(__dirname, "client/build")));

app.get("/api", (req, res) => {
	res.json({ message: "API Working" });
});

app.use("/api/user", user);
app.use("/api/video", video);
app.use("/api/comment", comment);
app.use("/api/search", search);

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

app.listen(PORT, (req, res) => {
	console.log(`Server Started at PORT ${PORT}`);
});
