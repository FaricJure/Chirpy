import { hash, verify } from "argon2";
import type { Request, Response } from "express";
import { getUserByEmail } from "../db/queries/users.js";
import { UserNotAuthenticatedError } from "./errors.js";

export async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
  return await verify(hash, password);
}

export async function handlerLogin(req: Request, res: Response) {
  const { email, password } = req.body ?? {};

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

    // This actually removes the hash at runtime.
    const { hashed_password: _hashedPassword, ...userResponse } = user;

    res.status(200).send(userResponse);
  } catch {
    throw new UserNotAuthenticatedError("incorrect email or password");
  }

}