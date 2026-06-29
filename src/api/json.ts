import type { Response } from "express";

export function respondWithJSON(res: Response, code: number, payload: unknown) {
  res.header("Content-Type", "application/json");
  res.status(code).send(JSON.stringify(payload));
}

export function respondWithError(res: Response, code: number, message: string) {
  respondWithJSON(res, code, { error: message });
}
