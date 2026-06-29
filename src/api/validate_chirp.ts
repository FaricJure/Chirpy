import { Request, Response } from "express";
import { BadRequestError } from "./errors.js";

const profaneWords = new Set(["kerfuffle", "sharbert", "fornax"]);

export async function handlerValidateChirp(req: Request, res: Response) {
  const { body } = req.body;

  if (body.length > 140) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const cleanedBody = body
    .split(/(\s+)/)
    .map((word: string) => {
      if (profaneWords.has(word.toLowerCase())) {
        return "****";
      }

      return word;
    })
    .join("");

  res.status(200).send({ cleanedBody });
}
