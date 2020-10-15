const sinon = require("sinon");
const UserService = require("../user_service");
const User = require("../user_model");

describe("UserService test", () => {
	it("has a module", () => {
		expect(UserService).toBeDefined();
	});

	describe("registerUser test", () => {
		it("registers a user", async () => {
			const MockModel = sinon.stub(User);

			const userService = UserService(MockModel);
			await userService.registerUser(
				"testUser",
				"test@example.com",
				"test1234"
			);

			const findOne = MockModel.findOne.callCount;
			const create = MockModel.create.callCount;
			expect(findOne).toEqual(2);
			expect(create).toEqual(1);
		});

		it("should return user W/O sinon", async () => {
			const user = {
				_id: 1,
				username: "test",
				email: "test@example.com",
				password: "test1234",
			};

			const MockModel = {
				findOne: async () => {
					return false;
				},
				create: async () => {
					return user;
				},
			};

			const userService = UserService(MockModel);
			const register = await userService.registerUser(
				"testUser",
				"test@example.com",
				"test1234"
			);

			expect(register).toBe(user);
		});
	});
});
