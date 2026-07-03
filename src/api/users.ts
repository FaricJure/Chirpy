import type { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";

export async function handlerCreateUser(req: Request, res: Response) {
    const { email } = req.body;

    if (typeof email !== "string") {
    res.status(400).send({ error: "Email is required" });
    return;
    }

    const user = await createUser({ email });

    res.status(201).send({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });

}