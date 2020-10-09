const UserService = require("../user_service");
const sinon = require("sinon");

describe("UserService test", () => {
	it("has a module", () => {
		expect(UserService).toBeDefined();
	});

	describe("register test", () => {
		it("register", () => {
			const MockModel = {
				find: sinon.spy(),
			};

			const userService = UserService(MockModel);
			userService.registerUser(
				"testUser",
				"test@example.com",
				"test1234"
			);
			const expected = true;
			const actual = MockModel.find.calledOnce;
			expect(actual).toEqual(expected);
		});
	});

	describe("registerUser test", () => {
		it("registers a user", () => {
			const save = sinon.spy();
			let username;
			let email;
			let password;

			const MockModel = function (data) {
				username = data.username;
				email = data.email;
				password = data.password;

				return { ...data, save };
			};

			const userService = UserService(MockModel);
			userService.registerUser(
				"testUser",
				"test@example.com",
				"test1234"
			);

			const expected = true;
			const actual = MockModel.save.calledOnce;
			expect(actual).toEqual(expected);
			expect(username).toEqual("testUser");
			expect(email).toEqual("test@example.com");
			expect(password).toEqual("test1234");
		});
	});
});
