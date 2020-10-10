const User = require("../user_model");
// const mongoose = require("mongoose");
// const mongodb = "mongodb://localhost:27017/test_user_model_db";
// mongoose.connect(mongodb, {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// });

describe("User model test", () => {
	// beforeAll(async () => {
	// 	await User.remove({});
	// });

	// afterEach(async () => {
	// 	await User.remove({});
	// });

	// afterAll(async () => {
	// 	await mongoose.connection.close();
	// });

	it("has a module", () => {
		expect(User).toBeDefined();
	});

	describe("User model test", () => {
		it("should be invalid if name is empty", (done) => {
			const user = new User();

			user.validate((err) => {
				expect(err.errors.username).toBeTruthy();
				done();
			});
		});

		it("should be valid if name is fulfilled", (done) => {
			const user = new User({ username: "testUser" });

			user.validate((err) => {
				expect(err.errors.username).toBeFalsy();
				done();
			});
		});
	});
});
