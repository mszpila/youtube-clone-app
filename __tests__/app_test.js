const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");
const mongodb = "mongodb://localhost:27017/test_db";
mongoose.connect(mongodb);

describe("API test", () => {
	it("has a module", () => {
		expect(app).toBeDefined();
	});

	let server;

	beforeAll(() => {
		server = app.listen(5001);
	});

	afterAll((done) => {
		mongoose.connection.close();
		server.close(done);
	});
	describe("User routes test", () => {
		describe("Register route test", () => {
			it("register a user", async () => {
				await request(server)
					.post("/api/users/register")
					.send({
						username: "testUser",
						email: "test@example.com",
						password: "test1234",
					})
					.expect(200);
			});
			it("fails to register if missing a username", async () => {
				await request(server)
					.post("/api/users/register")
					.send({
						username: "",
						email: "test@example.com",
						password: "test1234",
					})
					.expect(400);
			});
			it("fails to register if missing an email", async () => {
				await request(server)
					.post("/api/users/register")
					.send({
						username: "testUser",
						email: "",
						password: "test1234",
					})
					.expect(400);
			});
			it("fails to register if missing a password", async () => {
				await request(server)
					.post("/api/users/register")
					.send({
						username: "testUser",
						email: "test@example.com",
						password: "",
					})
					.expect(400);
			});
		});
	});
});
