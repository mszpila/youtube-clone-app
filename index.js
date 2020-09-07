require("dotenv").config();
const express = require("express");
const user = require("./routes/user");
const cookieParser = require("cookie-parser");
const InitiateMongoServer = require("./config/db");

// Initiate Mongo Server
InitiateMongoServer();

const app = express();

// PORT
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
	res.json({ message: "API Working" });
});

app.use("/user", user);

app.listen(PORT, (req, res) => {
	console.log(`Server Started at PORT ${PORT}`);
});
