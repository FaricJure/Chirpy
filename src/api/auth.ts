import { hash, verify } from "argon2";
import type { Request, Response } from "express";
import { getUserByEmail } from "../db/queries/users.js";
import { UserNotAuthenticatedError } from "./errors.js";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { config } from "../config.js";
import crypto from "crypto";
import {
  createRefreshToken,
  getUserFromRefreshToken,
  revokeRefreshToken,
} from "../db/queries/tokens.js";
type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
  return await verify(hash, password);
}

export async function handlerLogin(req: Request, res: Response) {
  const { email, password } = req.body ?? {};

  const access_expiration = 60 * 60; // 1 hour

  if (typeof email !== "string" || typeof password !== "string") {
    throw new UserNotAuthenticatedError("incorrect email or password");
  }

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    const passwordMatches = await checkPasswordHash(
      password,
      user.hashed_password,
    );

    if (!passwordMatches) {
      throw new Error("Password does not match");
    }

    const token = makeJWT(user.id, access_expiration, config.api.jwtSecret);
    const refreshToken = makeRefreshToken();

    await createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      revoked_at: null,
    });

    // This actually removes the hash at runtime.
    const { hashed_password: _hashedPassword, ...userResponse } = user;

    res.status(200).send({
  ...userResponse,
  token,
  refreshToken,
});
  } catch {
    throw new UserNotAuthenticatedError("incorrect email or password");
  }

}

export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string,
): string {
  const issuedAt = Math.floor(Date.now() / 1000);

  const payload: Payload = {
    iss: "chirpy",
    sub: userID,
    iat: issuedAt,
    exp: issuedAt + expiresIn,
  };

  return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
  const decoded = jwt.verify(tokenString, secret);

  if (typeof decoded === "string" || typeof decoded.sub !== "string") {
    throw new Error("Invalid token");
  }

  return decoded.sub;
}

export function getBearerToken(req: Request): string {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    throw new Error("Authorization header is missing");
  }

  const [scheme, token] = authHeader.trim().split(/\s+/);

  if (scheme !== "Bearer" || !token) {
    throw new Error("Invalid authorization header");
  }

  return token;
}

export function makeRefreshToken (): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function handlerRefresh(req: Request, res: Response) {
  try {
    const refreshToken = getBearerToken(req);
    const user = await getUserFromRefreshToken(refreshToken);

    if (!user) {
      throw new Error("Invalid refresh token");
    }

    const token = makeJWT(
      user.id,
      60 * 60,
      config.api.jwtSecret,
    );

    res.status(200).send({ token });
  } catch {
    throw new UserNotAuthenticatedError("Unauthorized");
  }
}

export async function handlerRevoke(req: Request, res: Response) {
  let refreshToken: string;

  try {
    refreshToken = getBearerToken(req);
  } catch {
    throw new UserNotAuthenticatedError("Unauthorized");
  }

  await revokeRefreshToken(refreshToken);

  res.status(204).end();
}