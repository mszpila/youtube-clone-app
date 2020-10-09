const User = require("../user_model");
const mongoose = require("mongoose");
const mongodb = "mongodb://localhost:27017/test_db";
mongoose.connect(mongodb);

describe("User model test", () => {
	beforeAll(async () => {
		await User.remove({});
	});

	afterEach(async () => {
		await User.remove({});
	});

	afterAll(async () => {
		await mongoose.connection.close();
	});

	it("has a module", () => {
		expect(User).toBeDefined();
	});

	describe("get a user", () => {
		it("get a user", async () => {
			const user = new User({
				username: "testUser",
				email: "test@example.com",
				password: "testPassword",
			});
			await user.save();

			const foundUser = await User.findOne({ username: "testUser" });
			const expected = "testUser";
			const actual = foundUser.username;
			expect(actual).toEqual(expected);
		});
	});

	describe("save a user", () => {
		it("save a user", async () => {
			const user = new User({
				username: "testUser",
				email: "test@example.com",
				password: "testPassword",
			});
			const savedUser = await user.save();
			const expected = "testUser";
			const actual = savedUser.username;
			expect(actual).toEqual(expected);
		});
	});

	describe("update a user", () => {
		it("update a user", async () => {
			const user = new User({
				username: "testUser",
				email: "test@example.com",
				password: "testPassword",
			});
			await user.save();

			user.username = "updateUser";
			const updatedUser = await user.save();

			const expected = "updatedUser";
			const actual = updatedUser.username;
			expect(actual).toEqual(expected);
		});
	});
});
