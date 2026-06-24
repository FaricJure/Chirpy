import { Request, Response } from "express";

export async function handlerValidateChirp(req: Request, res: Response) {
  const { body } = req.body;

  if (body.length > 140) {
    res.status(400).send({ error: "Chirp is too long" });
    return;
  }

  res.status(200).send({ valid: true });
}