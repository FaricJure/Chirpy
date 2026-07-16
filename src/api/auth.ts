import { hash, verify } from "argon2";
import type { Request, Response } from "express";
import { getUserByEmail } from "../db/queries/users.js";
import { UserNotAuthenticatedError } from "./errors.js";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { config } from "../config.js";


type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
  return await verify(hash, password);
}

export async function handlerLogin(req: Request, res: Response) {
  const { email, password, expiresInSeconds } = req.body ?? {};

  const maxExpiration = 60 * 60;
  const expiration =
    typeof expiresInSeconds === "number"
      ? Math.min(expiresInSeconds, maxExpiration)
      : maxExpiration;

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

    const token = makeJWT(user.id, expiration, config.api.jwtSecret);

    // This actually removes the hash at runtime.
    const { hashed_password: _hashedPassword, ...userResponse } = user;

    res.status(200).send({
  ...userResponse,
  token,
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