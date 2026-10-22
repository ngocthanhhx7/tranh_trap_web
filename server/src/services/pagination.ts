import { z } from "zod";
import { Types } from "mongoose";
import { HttpError } from "./auth.js";

export const pageSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().max(200).optional(),
});
export function cursorFilter(cursor?: string) {
  if (!cursor) return {};
  try {
    const data = z
      .object({
        id: z.string().regex(/^[a-f0-9]{24}$/),
        at: z.string().datetime(),
      })
      .strict()
      .parse(JSON.parse(Buffer.from(cursor, "base64url").toString()));
    const at = new Date(data.at);
    return {
      $or: [
        { createdAt: { $lt: at } },
        { createdAt: at, _id: { $lt: new Types.ObjectId(data.id) } },
      ],
    };
  } catch {
    throw new HttpError(400, "Mã phân trang không hợp lệ.");
  }
}
export const pageSort = { createdAt: -1, _id: -1 } as const;
export function cursorPage<T extends { _id: unknown; createdAt: Date }>(
  rows: T[],
  limit: number,
) {
  const items = rows.slice(0, limit);
  const last = items.at(-1);
  return {
    items,
    nextCursor:
      rows.length > limit && last
        ? Buffer.from(
            JSON.stringify({
              id: String(last._id),
              at: last.createdAt.toISOString(),
            }),
          ).toString("base64url")
        : null,
  };
}
