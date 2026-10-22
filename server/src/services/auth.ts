import { createHash, randomBytes } from "node:crypto";
import type { Request, Response, RequestHandler } from "express";
import { Session, User } from "../models/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const secret = () => randomBytes(32).toString("hex");
export type CurrentUser = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  active: boolean;
};
import type mongoose from "mongoose";
declare module "express-serve-static-core" {
  interface Request {
    user?: CurrentUser;
  }
}
export const optionalAuth: RequestHandler = asyncHandler(
  async (req, _res, next) => {
    const token = req.cookies?.tt_session as string | undefined;
    if (typeof token === "string" && /^[a-f0-9]{64}$/.test(token)) {
      const session = await Session.findOne({
        tokenHash: digest(token),
        expiresAt: { $gt: new Date() },
      })
        .select("userId")
        .lean();
      if (session) {
        const user = await User.findById(session.userId).lean();
        if (user?.active) req.user = user as CurrentUser;
      }
    }
    next();
  },
);
export const requireAuth: RequestHandler = (req, _res, next) =>
  next(
    req.user
      ? undefined
      : new HttpError(401, "Vui lòng đăng nhập để tiếp tục."),
  );
export const roles =
  (...allowed: string[]): RequestHandler =>
  (req, _res, next) =>
    next(
      req.user && allowed.includes(req.user.role)
        ? undefined
        : new HttpError(403, "Bạn không có quyền thực hiện thao tác này."),
    );
export const customerOrGuest: RequestHandler = (req, _res, next) =>
  next(
    !req.user || req.user.role === "customer"
      ? undefined
      : new HttpError(403, "Khu vực mua hàng chỉ dành cho khách hàng."),
  );
export const guestOnly: RequestHandler = (req, _res, next) =>
  next(
    !req.user
      ? undefined
      : new HttpError(
          403,
          "Bạn đã đăng nhập. Vui lòng đăng xuất trước khi dùng tài khoản khác.",
        ),
  );
export async function signIn(res: Response, userId: mongoose.Types.ObjectId) {
  const token = secret();
  await Session.create({
    tokenHash: digest(token),
    userId,
    expiresAt: new Date(Date.now() + 7 * 86400000),
  });
  res.cookie("tt_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 7 * 86400000,
    path: "/",
  });
}
export function safeUser(user: { toObject: () => Record<string, unknown> }) {
  const result = user.toObject();
  delete result.passwordHash;
  return result;
}
export function sameOwner(req: Request, owner: unknown) {
  return String(owner) === String(req.user?._id);
}
