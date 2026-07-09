import type { Request, Response } from "express";
import { createChirp } from "../db/queries/chirps.js";
import { BadRequestError } from "./errors.js";

const profaneWords = new Set(["kerfuffle", "sharbert", "fornax"]);
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cleanChirp(body: string) {
  return body
    .split(/(\s+)/)
    .map((word) => {
      if (profaneWords.has(word.toLowerCase())) {
        return "****";
      }

      return word;
    })
    .join("");
}

function validateChirpBody(body: unknown) {
  if (typeof body !== "string") {
    throw new BadRequestError("Chirp body is required");
  }

  if (body.length > 140) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  return cleanChirp(body);
}

function validateUserId(userId: unknown) {
  if (typeof userId !== "string") {
    throw new BadRequestError("User ID is required");
  }

  if (!uuidPattern.test(userId)) {
    throw new BadRequestError("User ID must be a valid UUID");
  }

  return userId;
}

export async function handlerChirps(req: Request, res: Response) {
  const body = validateChirpBody(req.body.body);
  const userId = validateUserId(req.body.userId);
  const chirp = await createChirp({ body, userId });

  res.status(201).send(chirp);
}
