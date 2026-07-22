import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteAllUsers() {
  await db.delete(users).execute();
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user;
}

export async function updateUser(
  userId: string,
  updates: Pick<NewUser, "email" | "hashed_password">,
) {
  const [user] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning();

  return user;
}
