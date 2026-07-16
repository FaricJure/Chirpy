import { describe, it, expect, beforeAll } from "vitest";
import { hashPassword, makeJWT, validateJWT, checkPasswordHash } from "../auth.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const result = await checkPasswordHash("wrongPassword", hash1);
    expect(result).toBe(false);
  });

  it("should return false when password doesn't match a different hash", async () => {
    const result = await checkPasswordHash(password1, hash2);
    expect(result).toBe(false);
  });

  it("should return false for an empty password", async () => {
    const result = await checkPasswordHash("", hash1);
    expect(result).toBe(false);
  });

  it("should throw for a malformed hash", async () => {
    await expect(
      checkPasswordHash(password1, "invalidhash"),
    ).rejects.toThrow();
  });
});

describe("JWT Authentication", () => {
  const userID = "123e4567-e89b-12d3-a456-426614174000";
  const secret = "test-secret";

  it("creates and validates a JWT", () => {
    const token = makeJWT(userID, 60, secret);

    expect(validateJWT(token, secret)).toBe(userID);
  });

  it("rejects an expired JWT", () => {
    const token = makeJWT(userID, -1, secret);

    expect(() => validateJWT(token, secret)).toThrow();
  });

  it("rejects an invalid token string", () => {
    expect(() => validateJWT("invalid.token.string", secret)).toThrow();
  });

  it("rejects a JWT signed with a different secret", () => {
    const token = makeJWT(userID, 60, secret);

    expect(() => validateJWT(token, "wrong-secret")).toThrow();
  });
});
