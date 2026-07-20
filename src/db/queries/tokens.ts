import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import {
  refresh_tokens,
  users,
  type NewRefreshToken,
} from "../schema.js";

export async function createRefreshToken(token: NewRefreshToken) {
  const [result] = await db
    .insert(refresh_tokens)
    .values(token)
    .returning();

  return result;
}

export async function getUserFromRefreshToken(token: string) {
  const [user] = await db
    .select({
      id: users.id,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      email: users.email,
      hashed_password: users.hashed_password,
    })
    .from(refresh_tokens)
    .innerJoin(users, eq(refresh_tokens.userId, users.id))
    .where(
      and(
        eq(refresh_tokens.token, token),
        gt(refresh_tokens.expires_at, new Date()),
        isNull(refresh_tokens.revoked_at),
      ),
    )
    .limit(1);

  return user;
}

export async function revokeRefreshToken(token: string) {
  const now = new Date();

  await db
    .update(refresh_tokens)
    .set({
      revoked_at: now,
      updatedAt: now,
    })
    .where(eq(refresh_tokens.token, token));
}