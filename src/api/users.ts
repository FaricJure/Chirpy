import type { Request, Response } from "express";
import { createUser, updateUser } from "../db/queries/users.js";
import { config } from "../config.js";
import { getBearerToken, hashPassword, validateJWT } from "./auth.js";
import { UserNotAuthenticatedError } from "./errors.js";
import { userToResponse } from "./user-response.js";

export async function handlerCreateUser(req: Request, res: Response) {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string") {
    res.status(400).send({ error: "Email is required" });
    return;
  }

  if (typeof password !== "string") {
    res.status(400).send({ error: "Password is required" });
    return;
  }

  // Hash the password before storing it in the database
  const hashedPassword = await hashPassword(password);

  const user = await createUser({
    email,
    hashed_password: hashedPassword,
  });

  res.status(201).send(userToResponse(user));
}

export async function handlerUpdateUser(req: Request, res: Response) {
  let userId: string;

  try {
    const token = getBearerToken(req);
    userId = validateJWT(token, config.api.jwtSecret);
  } catch {
    throw new UserNotAuthenticatedError("Unauthorized");
  }

  const { email, password } = req.body ?? {};

  if (typeof email !== "string") {
    res.status(400).send({ error: "Email is required" });
    return;
  }

  if (typeof password !== "string") {
    res.status(400).send({ error: "Password is required" });
    return;
  }

  const hashedPassword = await hashPassword(password);
  const user = await updateUser(userId, {
    email,
    hashed_password: hashedPassword,
  });

  if (!user) {
    throw new UserNotAuthenticatedError("Unauthorized");
  }

  res.status(200).send(userToResponse(user));
}
