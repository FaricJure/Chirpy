import type { Request, Response } from "express";
import { config } from "../config.js";
import { deleteAllChirps } from "../db/queries/chirps.js";
import { deleteAllUsers } from "../db/queries/users.js";
import { UserForbiddenError } from "./errors.js";

export async function handlerReset(_: Request, res: Response) {
  if (config.api.platform !== "dev") {
    throw new UserForbiddenError("Forbidden");
  }

  config.api.fileServerHits = 0;
  await deleteAllChirps();
  await deleteAllUsers();
  res.write("Hits reset to 0");
  res.end();
}
