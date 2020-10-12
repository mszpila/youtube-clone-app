const User = require("../user_model");

describe("User model test", () => {
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

		it("should be invalid if email is empty", (done) => {
			const user = new User();

			user.validate((err) => {
				expect(err.errors.email).toBeTruthy();
				done();
			});
		});

		it("should be invalid if password is empty", (done) => {
			const user = new User();

			user.validate((err) => {
				expect(err.errors.password).toBeTruthy();
				done();
			});
		});

		it("should be valid if username is fulfilled", (done) => {
			const user = new User({
				username: "testUser",
			});

			user.validate((err) => {
				expect(err.errors.username).toBeFalsy();
				done();
			});
		});

		// it("should update subscribers number", async () => {
		// 	const user = new User({
		// 		username: "testUser",
		// 		email: "test@example.com",
		// 		password: "test1234",
		// 	}).save();

		// 	const fetchedUser = await User.findOneAndUpdate(
		// 		{ _id: user._id },
		// 		{ $inc: { subscribers: 1 } }
		// 		// { new: true }
		// 	);
		// 	expect(fetchedUser.subscribers).toEqual(1);
		// });
	});
});
