import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validateBody } from "../middlewares/validate.middleware.js";

describe("validateBody middleware", () => {
  it("returns structured 400 JSON for Zod validation errors", async () => {
    const app = express();
    app.use(express.json());

    const schema = z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(1, "Password is required"),
    });

    app.post("/login", validateBody(schema), (req, res) => {
      res.status(200).json({ ok: true });
    });

    const res = await request(app).post("/login").send({ email: "bad", password: "" });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      message: "Validation failed",
    });
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email", message: "Invalid email address" }),
        expect.objectContaining({ field: "password", message: "Password is required" }),
      ])
    );
  });
});

