import type { Request, Response } from "express";
import {
  createChirp,
  deleteChirp,
  getAllChirps,
  getChirpById,
} from "../db/queries/chirps.js";
import {
  BadRequestError,
  NotFoundError,
  UserForbiddenError,
  UserNotAuthenticatedError,
} from "./errors.js";
import { getBearerToken, validateJWT } from "./auth.js";
import { config } from "../config.js";

const profaneWords = new Set(["kerfuffle", "sharbert", "fornax"]);

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

export async function handlerChirps(req: Request, res: Response) {
  let userId: string;

  try {
    const token = getBearerToken(req);
    userId = validateJWT(token, config.api.jwtSecret);
  } catch {
    throw new UserNotAuthenticatedError("Unauthorized");
  }

  const body = validateChirpBody(req.body?.body);
  const chirp = await createChirp({ body, userId });

  res.status(201).send(chirp);
}

export async function handlerGetChirps(req: Request, res: Response) {
  const chirps = await getAllChirps();
  res.status(200).send(chirps);
}

export async function handlerGetChirp(
  req: Request<{ chirpId: string }>,
  res: Response,
) {
  const chirpId = req.params.chirpId;
  const chirp = await getChirpById(chirpId);
  if (!chirp) {
    res.status(404).send({ error: "Chirp not found" });
    return;
  }

  res.status(200).send(chirp);
}

export async function handlerDeleteChirp(
  req: Request<{ chirpId: string }>,
  res: Response,
) {
  let userId: string;

  try {
    const token = getBearerToken(req);
    userId = validateJWT(token, config.api.jwtSecret);
  } catch {
    throw new UserNotAuthenticatedError("Unauthorized");
  }

  const chirp = await getChirpById(req.params.chirpId);

  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }

  if (chirp.userId !== userId) {
    throw new UserForbiddenError("Forbidden");
  }

  await deleteChirp(chirp.id);

  res.status(204).end();
}
