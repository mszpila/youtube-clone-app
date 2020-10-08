const mongoose = require("mongoose");

const InitiateMongoServer = async () => {
	try {
		if (NODE_ENV === "test") {
			await mongoose.connect("mongodb://localhost:27017/myapp", {
				useNewUrlParser: true,
			});
		} else {
			await mongoose.connect(process.env.MONGO_URI, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});
		}
		console.log("Connected to MongoDB");
	} catch (e) {
		console.log(e);
		throw e;
	}
};

module.exports = InitiateMongoServer;
