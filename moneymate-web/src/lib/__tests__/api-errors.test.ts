import { describe, expect, it } from "vitest";
import { ApiError, parseApiError } from "../api";

describe("api error normalization", () => {
  it("turns [{field,message}] into a readable message and fieldErrors map", async () => {
    const payload = [
      { field: "email", message: "Invalid email address" },
      { field: "password", message: "Password is required" },
    ];

    const res = new Response(JSON.stringify(payload), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });

    const err = await parseApiError(res, "Request failed");
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.message).toContain("Invalid email address");
    expect(err.message).toContain("Password is required");
    expect(err.fieldErrors).toEqual({
      email: "Invalid email address",
      password: "Password is required",
    });
  });

  it("supports { message: '...', errors: [...] } payloads", async () => {
    const payload = {
      message: "Validation failed",
      errors: [{ field: "email", message: "Invalid email address" }],
    };

    const res = new Response(JSON.stringify(payload), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });

    const err = await parseApiError(res, "Request failed");
    expect(err.message).toContain("Invalid email address");
    expect(err.fieldErrors).toEqual({ email: "Invalid email address" });
  });
});

