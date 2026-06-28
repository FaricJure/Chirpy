import { Request, Response } from "express";
import {errorHandler} from "./middleware.js";

const profaneWords = new Set(["kerfuffle", "sharbert", "fornax"]);

export async function handlerValidateChirp(req: Request, res: Response) {
  const { body } = req.body;

  if (body.length > 140) {
    errorHandler(new Error("Chirp is too long"), req, res, () => {});
    // res.status(400).send({ error: "Chirp is too long" });
    return;
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
