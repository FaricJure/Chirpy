import type { Request, Response } from "express";
import { upgradeUserToChirpyRed } from "../db/queries/users.js";

type PolkaWebhookRequest = {
  event?: unknown;
  data?: {
    userId?: unknown;
  };
};

export async function handlerPolkaWebhook(req: Request, res: Response) {
  const webhook = (req.body ?? {}) as PolkaWebhookRequest;

  if (webhook.event !== "user.upgraded") {
    res.status(204).end();
    return;
  }

  const userId = webhook.data?.userId;
  const user =
    typeof userId === "string"
      ? await upgradeUserToChirpyRed(userId)
      : undefined;

  if (!user) {
    res.status(404).send({ error: "User not found" });
    return;
  }

  res.status(204).end();
}
