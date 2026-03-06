import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import authRoutes from "../routes/auth.routes.js";

describe("Auth routes", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);

  it("POST /api/auth/login returns 400 when body fails validation", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email", password: "" });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ message: expect.any(String) });
    expect(res.body.errors || res.body.message).toBeDefined();
  });

  it("POST /api/auth/login returns 400 when email and password are missing", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(400);
  });
});
