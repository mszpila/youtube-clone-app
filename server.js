const app = require("./app");
const InitiateMongoServer = require("./config/db");

// PORT
const PORT = process.env.PORT || 5000;

// Initiate Mongo Server
InitiateMongoServer();

app.listen(PORT, (req, res) => {
	console.log(`Server Started at PORT ${PORT}`);
});
