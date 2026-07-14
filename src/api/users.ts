import type { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { hashPassword } from "./auth.js";

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

    const user = await createUser({ email: email, hashed_password: hashedPassword });

    res.status(201).send({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });

}