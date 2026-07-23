import { users } from "../db/schema.js";

type User = typeof users.$inferSelect;

export function userToResponse(user: User) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isChirpyRed: user.is_chirpy_red,
  };
}
