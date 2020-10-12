const sinon = require("sinon");
const UserService = require("../user_service");
const User = require("../user_model");

describe("UserService test", () => {
	it("has a module", () => {
		expect(UserService).toBeDefined();
	});

	describe("registerUser test", () => {
		it("registers a user", async () => {
			// const MockModel = {
			// 	findOne: sinon.spy(),
			// 	save: sinon.spy(),
			// };

			const MockModel = sinon.stub(User);

			// MockModel.create()

			// code below doesn't work because of findOne()

			// let username;
			// let email;
			// let password;
			// save = sinon.spy();
			// findOne = sinon.spy();

			// const MockModel = function (data) {
			// 	username = data.username;
			// 	email = data.email;
			// 	password = data.password;

			// 	return {
			// 		...data,
			// 		save,
			// 		findOne,
			// 	};
			// };

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
	});
});
