const mongoose = require("mongoose");

const InitiateMongoServer = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
		});
		console.log("Connected to MongoDB");
	} catch (e) {
		console.log(e);
		throw e;
	}
};

module.exports = InitiateMongoServer;
