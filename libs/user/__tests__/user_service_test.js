const UserService = require("../user_service");
const sinon = require("sinon");

describe("UserService test", () => {
	it("has a module", () => {
		expect(UserService).toBeDefined();
	});

	// describe("register test", () => {
	// 	it("register", () => {
	// 		const MockModel = {
	// 			find: sinon.spy(),
	// 		};

	// 		const userService = UserService(MockModel);
	// 		userService.registerUser(
	// 			"testUser",
	// 			"test@example.com",
	// 			"test1234"
	// 		);
	// 		const expected = true;
	// 		const actual = MockModel.find.calledOnce;
	// 		expect(actual).toEqual(expected);
	// 	});
	// });

	describe("registerUser test", () => {
		it("registers a user", () => {
			// const save = sinon.spy();
			// let username;
			// let email;
			// let password;

			// higher order funtion
			// it will be like userService(MockModel)(registerUser)
			// the args from registerUser will come as data to MockModel
			// function

			// const MockModel = (data) => {
			// 	username = data.username;
			// 	email = data.email;
			// 	password = data.password;
			// 	return { ...data, save };
			// };

			const MockModel = {
				username,
				email,
				password,
				save: sinon.spy(),
			};

			const userService = UserService(MockModel);
			const user = userService.registerUser(
				"testUser",
				"test@example.com",
				"test1234"
			);

			const expected = true;
			const actual = MockModel.save.calledOnce;
			expect(actual).toEqual(expected);
			expect(user.username).toEqual("testUser");
			expect(user.email).toEqual("test@example.com");
			expect(user.password).toEqual("test1234");
		});
	});
});
