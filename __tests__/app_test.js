const app = require("../app");
const request = require("supertest");
// const mongoose = require("mongoose");
// const mongodb = "mongodb://localhost:27017/test_app_db";
// mongoose.connect(mongodb);
const { setupDB } = require("../test-setup");

describe("API test", () => {
	setupDB("endpoint_testing");

	it("has a module", () => {
		expect(app).toBeDefined();
	});

	let server;

	beforeAll(() => {
		server = app.listen(5001);
	});

	afterAll((done) => {
		server.close(done);
	});

	describe("User routes test", () => {
		describe("Register route test", () => {
			it("register a user", async () => {
				const response = await request(server)
					.post("/api/users/register")
					.send({
						username: "testUser",
						email: "test@example.com",
						password: "test1234",
					});
				const user = response.body;
				const token = response.headers["set-cookie"]; // [0].split(";")[0].split("=")[1];
				expect(response.status).toBe(200);
				expect(token).toBeTruthy();
				expect(user.username).toEqual("testUser");
				expect(user.email).toEqual("test@example.com");
				expect(user.password).toBeTruthy();
				expect(user.password).not.toEqual("test1234");
				expect(user._id).toBeDefined();
			});

			it("fails to register if missing a username", async () => {
				request(server)
					.post("/api/users/register")
					.send({
						username: "",
						email: "test@example.com",
						password: "test1234",
					})
					.expect(400);
			});

			it("fails to register if missing an email", async () => {
				request(server)
					.post("/api/users/register")
					.send({
						username: "testUser",
						email: "",
						password: "test1234",
					})
					.expect(400);
			});

			it("fails to register if missing a password", async () => {
				request(server)
					.post("/api/users/register")
					.send({
						username: "testUser",
						email: "test@example.com",
						password: "",
					})
					.expect(400);
			});

			it("user already exists", async () => {
				await request(server).post("/api/users/register").send({
					username: "testUser",
					email: "test2@example.com",
					password: "test1234",
				});
				// .expect(200);
				await request(server)
					.post("/api/users/register")
					.send({
						username: "testUser",
						email: "test2@example.com",
						password: "test1234",
					})
					.expect(400);
			});

			it("email already exists", async () => {
				await request(server).post("/api/users/register").send({
					username: "testUser",
					email: "test@example.com",
					password: "test1234",
				});
				// .expect(200);
				await request(server)
					.post("/api/users/register")
					.send({
						username: "testUser2",
						email: "test@example.com",
						password: "test1234",
					})
					.expect(400);
			});
		});
	});
});
