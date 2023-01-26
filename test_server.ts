import app from "./app";
import request from "supertest";

describe("API Endpoints", () => {
  describe("Create Account", () => {
    it("should create a new account", async () => {
      const res = await request(app)
        .post("/create")
        .send({ username: "testuser", password: "testpassword" });
      expect(res.status).toEqual(201);
      expect(res.body).toHaveProperty(
        "message",
        "Account created successfully"
      );
    });
  });

  describe("Fund Account", () => {
    it("should fund an existing account", async () => {
      const res = await request(app)
        .post("/fund")
        .send({ username: "testuser", amount: 500 });
      expect(res.status).toEqual(200);
      expect(res.body).toHaveProperty("message", "Account funded successfully");
    });
  });

  describe("Transfer Funds", () => {
    it("should transfer funds to another account", async () => {
      const res = await request(app)
        .post("/transfer")
        .send({ sender: "testuser", receiver: "testuser2", amount: 200 });
      expect(res.status).toEqual(200);
      expect(res.body).toHaveProperty(
        "message",
        "Funds transferred successfully"
      );
    });
  });

  describe("Withdraw Funds", () => {
    it("should withdraw funds from an account", async () => {
      const res = await request(app)
        .post("/withdraw")
        .send({ username: "testuser", amount: 250 });
      expect(res.status).toEqual(200);
      expect(res.body).toHaveProperty(
        "message",
        "Funds withdrawn successfully"
      );
    });
  });
});
