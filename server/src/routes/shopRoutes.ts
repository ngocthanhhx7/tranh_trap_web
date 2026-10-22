import { Router } from "express";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import {
  AiUsage,
  Notification,
  Order,
  Product,
  ResetToken,
  Review,
  Session,
  ShippingRate,
  Ticket,
  User,
} from "../models/index.js";
import {
  digest,
  HttpError,
  optionalAuth,
  requireAuth,
  roles,
  safeUser,
  sameOwner,
  secret,
  signIn,
  customerOrGuest,
  guestOnly,
} from "../services/auth.js";
import {
  askGemini,
  integrationStatus,
  payos,
  sendMail,
} from "../services/integrations.js";
import { provinces, shippingFee } from "../services/shipping.js";
import { env } from "../config/env.js";
import { operationsRoutes } from "./operationsRoutes.js";
import {
  pageSchema,
  cursorFilter,
  cursorPage,
  pageSort,
} from "../services/pagination.js";
import { asyncHandler as ah } from "../utils/asyncHandler.js";

export const shopRoutes = Router();
const r = shopRoutes;
r.use(optionalAuth);
const email = z
  .string()
  .trim()
  .email()
  .max(160)
  .transform((v) => v.toLowerCase());
const password = z
  .string()
  .min(10, "Mật khẩu cần ít nhất 10 ký tự.")
  .max(128)
  .refine(
    (v) => Buffer.byteLength(v, "utf8") <= 72,
    "Mật khẩu không được vượt quá 72 byte UTF-8.",
  );
const name = z.string().trim().min(2).max(100);
const phone = z
  .string()
  .regex(/^(?:\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ.");
const id = (value: unknown) => {
  const s = z.string().parse(value);
  if (!mongoose.isValidObjectId(s))
    throw new HttpError(400, "Mã không hợp lệ.");
  return s;
};
const authLimit = rateLimit({
  windowMs: 15 * 60000,
  limit: 25,
  message: { message: "Bạn thao tác quá nhanh. Vui lòng thử lại sau." },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const dummyPasswordHash = bcrypt.hash(secret(), 12);
const publicLimit = rateLimit({
  windowMs: 60000,
  limit: env.NODE_ENV === "test" ? 1000 : 20,
  message: { message: "Vui lòng chờ một phút rồi thử lại." },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
// Separate role namespaces; admin inherits operations within its own namespace.
r.use("/admin", requireAuth, roles("admin"));
r.use("/staff", requireAuth, roles("staff"), operationsRoutes);
r.use("/admin/operations", operationsRoutes);
const customerEndpoints = [
  "/account/addresses",
  "/account/email",
  "/account/orders",
  "/account/reviews",
  "/account/notifications",
  "/account/tickets",
];
r.use(customerEndpoints, requireAuth, roles("customer"));
r.get(
  "/catalog",
  ah(async (_req, res) =>
    res.json({
      product: await Product.findOne({
        slug: "bo-tro-choi-tranh-trap",
        active: true,
      })
        .select(
          "name slug description price stock age players duration components active",
        )
        .lean(),
      integrations: { payos: integrationStatus().payos },
    }),
  ),
);
r.get(
  "/shipping",
  ah(async (_req, res) =>
    res.json({
      provinces,
      rates: await ShippingRate.find().select("province fee -_id").lean(),
      defaultFee: env.SHIPPING_DEFAULT_FEE,
    }),
  ),
);
r.post(
  "/auth/register",
  guestOnly,
  authLimit,
  ah(async (req, res) => {
    const body = z
      .object({ name, email, password, confirmPassword: password })
      .strict()
      .refine((body) => body.password === body.confirmPassword, {
        message: "Mật khẩu xác nhận chưa khớp.",
        path: ["confirmPassword"],
      })
      .parse(req.body);
    if (await User.exists({ email: body.email }))
      throw new HttpError(409, "Email này đã được sử dụng.");
    const user = await User.create({
      name: body.name,
      email: body.email,
      passwordHash: await bcrypt.hash(body.password, 12),
    });
    await signIn(res, user._id);
    res.status(201).json(safeUser(user));
  }),
);
r.post(
  "/auth/login",
  guestOnly,
  authLimit,
  ah(async (req, res) => {
    const body = z
      .object({
        email,
        password: z
          .string()
          .min(1)
          .max(128)
          .refine((v) => Buffer.byteLength(v, "utf8") <= 72),
      })
      .parse(req.body);
    const user = await User.findOne({ email: body.email }).select(
      "+passwordHash",
    );
    const passwordMatches = await bcrypt.compare(
      body.password,
      user?.passwordHash ?? (await dummyPasswordHash),
    );
    if (!user || !user.active || !passwordMatches)
      throw new HttpError(
        401,
        "Email hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa.",
      );
    await signIn(res, user._id);
    res.json(safeUser(user));
  }),
);
r.post(
  "/auth/logout",
  ah(async (req, res) => {
    if (req.cookies?.tt_session)
      await Session.deleteOne({
        tokenHash: digest(String(req.cookies.tt_session)),
      });
    res.clearCookie("tt_session", { path: "/" });
    res.json({ message: "Đã đăng xuất." });
  }),
);
r.get(
  "/auth/me",
  requireAuth,
  ah(async (req, res) => res.json(req.user)),
);
r.patch(
  "/account/profile",
  requireAuth,
  ah(async (req, res) => {
    const body = z
      .object({
        name,
        phone: phone.or(z.literal("")),
        gender: z.enum(["", "male", "female", "other"]),
        birthday: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/),
      })
      .strict()
      .parse(req.body);
    res.json(
      await User.findByIdAndUpdate(
        req.user!._id,
        { $set: body },
        { new: true, runValidators: true },
      ),
    );
  }),
);
r.put(
  "/account/addresses",
  requireAuth,
  ah(async (req, res) => {
    const body = z
      .object({
        addresses: z
          .array(
            z.object({
              label: z.string().max(50),
              name,
              phone,
              detail: z.string().min(10).max(400),
              province: z.enum(provinces),
              isDefault: z.boolean(),
            }),
          )
          .max(10),
      })
      .parse(req.body);
    if (body.addresses.filter((a) => a.isDefault).length > 1)
      throw new HttpError(400, "Chỉ chọn một địa chỉ mặc định.");
    res.json(
      await User.findByIdAndUpdate(
        req.user!._id,
        { $set: body },
        { new: true },
      ),
    );
  }),
);
r.post(
  "/account/password",
  requireAuth,
  authLimit,
  ah(async (req, res) => {
    const body = z
      .object({
        currentPassword: z
          .string()
          .min(1)
          .max(128)
          .refine((v) => Buffer.byteLength(v, "utf8") <= 72),
        password,
        confirmPassword: password,
      })
      .refine((body) => body.password === body.confirmPassword, {
        message: "Mật khẩu xác nhận chưa khớp.",
        path: ["confirmPassword"],
      })
      .parse(req.body);
    const user = await User.findById(req.user!._id).select("+passwordHash");
    if (
      !user ||
      !(await bcrypt.compare(body.currentPassword, user.passwordHash))
    )
      throw new HttpError(400, "Mật khẩu hiện tại không đúng.");
    user.passwordHash = await bcrypt.hash(body.password, 12);
    await user.save();
    await Session.deleteMany({ userId: user._id });
    await signIn(res, user._id);
    res.json({
      message: "Đã đổi mật khẩu và kết thúc các phiên đăng nhập cũ.",
    });
  }),
);
r.post(
  "/account/email",
  requireAuth,
  authLimit,
  ah(async (req, res) => {
    const body = z
      .object({
        email,
        currentPassword: z
          .string()
          .min(1)
          .max(128)
          .refine((v) => Buffer.byteLength(v, "utf8") <= 72),
      })
      .parse(req.body);
    const user = await User.findById(req.user!._id).select("+passwordHash");
    if (
      !user ||
      !(await bcrypt.compare(body.currentPassword, user.passwordHash))
    )
      throw new HttpError(400, "Mật khẩu hiện tại không đúng.");
    if (await User.exists({ email: body.email, _id: { $ne: user._id } }))
      throw new HttpError(409, "Email đã được sử dụng.");
    user.email = body.email;
    await user.save();
    res.json(safeUser(user));
  }),
);
async function passwordReset(userId: mongoose.Types.ObjectId, address: string) {
  if (!integrationStatus().smtp)
    throw new HttpError(
      503,
      "SMTP chưa được cấu hình để gửi email đặt lại mật khẩu.",
    );
  const token = secret();
  await ResetToken.create({
    hash: digest(token),
    userId,
    expiresAt: new Date(Date.now() + 30 * 60000),
  });
  await sendMail(
    address,
    "Đặt lại mật khẩu Tránh Trap",
    `Liên kết có hiệu lực 30 phút: ${env.CLIENT_ORIGIN}/dat-lai-mat-khau?token=${token}`,
  );
}
r.post(
  "/auth/forgot-password",
  guestOnly,
  authLimit,
  ah(async (req, res) => {
    const body = z.object({ email }).parse(req.body);
    if (!integrationStatus().smtp)
      throw new HttpError(
        503,
        "Email khôi phục chưa sẵn sàng. Vui lòng liên hệ hỗ trợ.",
      );
    const user = await User.findOne({ email: body.email, active: true });
    if (user) await passwordReset(user._id, user.email);
    res.json({
      message:
        "Nếu email tồn tại, hướng dẫn khôi phục sẽ được gửi tới hộp thư.",
    });
  }),
);
r.post(
  "/auth/reset-password",
  guestOnly,
  authLimit,
  ah(async (req, res) => {
    const body = z
      .object({
        token: z.string().length(64),
        password,
        confirmPassword: password,
      })
      .refine((body) => body.password === body.confirmPassword, {
        message: "Mật khẩu xác nhận chưa khớp.",
        path: ["confirmPassword"],
      })
      .parse(req.body);
    const token = await ResetToken.findOneAndDelete({
      hash: digest(body.token),
      expiresAt: { $gt: new Date() },
    });
    if (!token)
      throw new HttpError(400, "Liên kết không hợp lệ hoặc đã hết hạn.");
    await User.updateOne(
      { _id: token.userId },
      { passwordHash: await bcrypt.hash(body.password, 12) },
    );
    await Session.deleteMany({ userId: token.userId });
    res.json({ message: "Đã đặt lại mật khẩu. Bạn có thể đăng nhập." });
  }),
);
r.post(
  "/orders",
  customerOrGuest,
  publicLimit,
  ah(async (req, res) => {
    const body = z
      .object({
        customer: z.object({
          name,
          email,
          phone,
          address: z.string().trim().min(10).max(400),
          province: z.enum(provinces),
        }),
        quantity: z.number().int().min(1).max(10),
        paymentMethod: z.enum(["cod", "payos"]),
        note: z.string().max(500).default(""),
      })
      .strict()
      .parse(req.body);
    if (body.paymentMethod === "payos" && !integrationStatus().payos)
      throw new HttpError(503, "PayOS chưa sẵn sàng. Vui lòng chọn COD.");
    const fee = await shippingFee(body.customer.province);
    const product = await Product.findOneAndUpdate(
      {
        slug: "bo-tro-choi-tranh-trap",
        active: true,
        price: { $gt: 0 },
        stock: { $gte: body.quantity },
      },
      { $inc: { stock: -body.quantity } },
      { new: true },
    );
    if (!product?.price)
      throw new HttpError(409, "Sản phẩm tạm hết hàng hoặc chưa mở bán.");
    let order;
    try {
      order = await Order.create({
        code: `TT${secret().slice(0, 10).toUpperCase()}`,
        orderCode: Date.now() * 100 + randomInt(100),
        userId: req.user?._id,
        customer: body.customer,
        product: {
          name: product.name,
          price: product.price,
          quantity: body.quantity,
        },
        subtotal: product.price * body.quantity,
        shippingFee: fee,
        total: product.price * body.quantity + fee,
        paymentMethod: body.paymentMethod,
        shippingMethod: "delivery",
        note: body.note,
        history: [
          {
            status: "pending",
            note: "Đơn hàng đã được tiếp nhận.",
            at: new Date(),
          },
        ],
      });
    } catch (e) {
      await Product.updateOne(
        { _id: product._id },
        { $inc: { stock: body.quantity } },
      );
      throw e;
    }
    if (body.paymentMethod === "payos") {
      try {
        const link = await payos().paymentRequests.create({
          orderCode: order.orderCode!,
          amount: order.total!,
          description: order.code,
          returnUrl: `${env.CLIENT_ORIGIN}/tra-cuu-don-hang?code=${order.code}`,
          cancelUrl: `${env.CLIENT_ORIGIN}/tra-cuu-don-hang?code=${order.code}`,
        });
        order.checkoutUrl = link.checkoutUrl;
        await order.save();
      } catch {
        await Order.updateOne(
          { _id: order._id },
          {
            status: "cancelled",
            $push: {
              history: {
                status: "cancelled",
                note: "Không tạo được thanh toán PayOS.",
                at: new Date(),
              },
            },
          },
        );
        await Product.updateOne(
          { _id: product._id },
          { $inc: { stock: body.quantity } },
        );
        throw new HttpError(
          502,
          "Không tạo được thanh toán PayOS. Đơn đã hủy, vui lòng thử lại hoặc chọn COD.",
        );
      }
    }
    if (req.user)
      await Notification.create({
        userId: req.user._id,
        title: "Đặt hàng thành công",
        text: `Đơn ${order.code} đang chờ xác nhận.`,
      });
    void sendMail(
      body.customer.email,
      `Đơn hàng ${order.code}`,
      `Cảm ơn bạn đã đặt Tránh Trap. Mã đơn: ${order.code}. Tra cứu: ${env.CLIENT_ORIGIN}/tra-cuu-don-hang?code=${order.code} bằng số điện thoại nhận hàng.`,
    ).catch(() => console.error("Order email delivery failed"));
    res.status(201).json({ order });
  }),
);
r.post(
  "/orders/lookup",
  customerOrGuest,
  publicLimit,
  ah(async (req, res) => {
    const body = z
      .object({
        code: z
          .string()
          .trim()
          .min(5)
          .max(30)
          .transform((v) => v.toUpperCase()),
        phone,
      })
      .parse(req.body);
    const order = await Order.findOne({
      code: body.code,
      "customer.phone": body.phone,
    });
    if (!order)
      throw new HttpError(
        404,
        "Không tìm thấy đơn hàng khớp mã đơn và số điện thoại.",
      );
    res.json({
      code: order.code,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      product: order.product,
      total: order.total,
      shippingFee: order.shippingFee,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      history: order.history,
      createdAt: order.createdAt,
      checkoutUrl: order.checkoutUrl,
    });
  }),
);
r.get(
  "/account/orders",
  requireAuth,
  ah(async (req, res) => {
    const page = pageSchema.strict().parse(req.query);
    const rows = await Order.find({
      userId: req.user!._id,
      ...cursorFilter(page.cursor),
    })
      .sort(pageSort)
      .limit(page.limit + 1)
      .lean();
    res.json(cursorPage(rows, page.limit));
  }),
);
r.post(
  "/account/orders/:id/cancel",
  requireAuth,
  ah(async (req, res) => {
    const order = await Order.findOneAndUpdate(
      {
        _id: id(req.params.id),
        userId: req.user!._id,
        status: "pending",
        paymentStatus: "unpaid",
        paymentMethod: "cod",
      },
      {
        status: "cancelled",
        $push: {
          history: {
            status: "cancelled",
            note: "Khách hàng hủy đơn.",
            at: new Date(),
          },
        },
      },
    );
    if (!order)
      throw new HttpError(
        409,
        "Chỉ hủy trực tiếp được đơn COD chưa xác nhận. Vui lòng liên hệ hỗ trợ cho đơn khác.",
      );
    await Product.updateOne(
      { slug: "bo-tro-choi-tranh-trap" },
      { $inc: { stock: order.product?.quantity ?? 0 } },
    );
    res.json({ message: "Đã hủy đơn hàng." });
  }),
);
r.post(
  "/payments/webhook",
  ah(async (req, res) => {
    let data;
    try {
      data = await payos().webhooks.verify(req.body);
    } catch {
      throw new HttpError(400, "Chữ ký thanh toán không hợp lệ.");
    }
    if (data.code === "00")
      await Order.updateOne(
        {
          orderCode: data.orderCode,
          total: data.amount,
          paymentMethod: "payos",
          paymentStatus: "unpaid",
          status: { $ne: "cancelled" },
        },
        {
          paymentStatus: "paid",
          $push: {
            history: {
              status: "paid",
              note: "PayOS đã xác nhận thanh toán.",
              at: new Date(),
            },
          },
        },
      );
    res.json({ success: true });
  }),
);
r.get(
  "/reviews",
  ah(async (_req, res) =>
    res.json(
      await Review.find()
        .select("name rating text createdAt")
        .sort(pageSort)
        .limit(50)
        .lean(),
    ),
  ),
);
r.post(
  "/reviews",
  requireAuth,
  roles("customer"),
  ah(async (req, res) => {
    const body = z
      .object({
        orderId: z.string(),
        rating: z.number().int().min(1).max(5),
        text: z.string().trim().min(10).max(2000),
      })
      .parse(req.body);
    if (
      !(await Order.exists({
        _id: id(body.orderId),
        userId: req.user!._id,
        status: "delivered",
      }))
    )
      throw new HttpError(
        403,
        "Bạn chỉ đánh giá được đơn hàng của mình đã giao thành công.",
      );
    res.status(201).json(
      await Review.create({
        ...body,
        userId: req.user!._id,
        name: req.user!.name,
      }),
    );
  }),
);
r.get(
  "/account/reviews",
  requireAuth,
  ah(async (req, res) => {
    const page = pageSchema.strict().parse(req.query);
    const rows = await Review.find({
      userId: req.user!._id,
      ...cursorFilter(page.cursor),
    })
      .select("orderId name rating text createdAt")
      .sort(pageSort)
      .limit(page.limit + 1)
      .lean();
    res.json(cursorPage(rows, page.limit));
  }),
);
r.get(
  "/account/notifications",
  requireAuth,
  ah(async (req, res) => {
    const page = pageSchema.strict().parse(req.query);
    const rows = await Notification.find({
      userId: req.user!._id,
      ...cursorFilter(page.cursor),
    })
      .select("title text read createdAt")
      .sort(pageSort)
      .limit(page.limit + 1)
      .lean();
    res.json(cursorPage(rows, page.limit));
  }),
);
r.patch(
  "/account/notifications/:id",
  requireAuth,
  ah(async (req, res) => {
    await Notification.updateOne(
      { _id: id(req.params.id), userId: req.user!._id },
      { read: true },
    );
    res.json({ success: true });
  }),
);
r.post(
  "/tickets",
  customerOrGuest,
  publicLimit,
  ah(async (req, res) => {
    const body = z
      .object({
        type: z.enum(["support", "complaint", "contact"]),
        subject: z.string().trim().min(3).max(150),
        email,
        name,
        orderCode: z.string().max(30).default(""),
        text: z.string().trim().min(10).max(4000),
      })
      .parse(req.body);
    if (body.type !== "contact" && !req.user)
      throw new HttpError(401, "Vui lòng đăng nhập để quản lý yêu cầu hỗ trợ.");
    res.status(201).json(
      await Ticket.create({
        ...body,
        ...(req.user ? { name: req.user.name, email: req.user.email } : {}),
        userId: req.user?._id,
        messages: [{ sender: "customer", text: body.text, at: new Date() }],
      }),
    );
  }),
);
r.get(
  "/account/tickets",
  requireAuth,
  ah(async (req, res) => {
    const page = pageSchema.strict().parse(req.query);
    const rows = await Ticket.find({
      userId: req.user!._id,
      ...cursorFilter(page.cursor),
    })
      .select("-messages -__v")
      .sort(pageSort)
      .limit(page.limit + 1)
      .lean();
    res.json(cursorPage(rows, page.limit));
  }),
);
r.get(
  "/tickets/:id",
  requireAuth,
  ah(async (req, res) => {
    const page = z
      .object({ before: z.coerce.number().int().min(0).max(100000).optional() })
      .strict()
      .parse(req.query);
    const filter = {
      _id: id(req.params.id),
      ...(req.user!.role === "customer" ? { userId: req.user!._id } : {}),
    };
    const meta = await Ticket.findOne(filter)
      .select("type subject email name orderCode status userId createdAt")
      .lean();
    if (!meta) throw new HttpError(404, "Không tìm thấy yêu cầu.");
    // Slice messages in MongoDB; a long conversation is never returned in full.
    const [countRow] = await Ticket.aggregate<{ count: number }>([
      { $match: { _id: meta._id } },
      { $project: { count: { $size: "$messages" } } },
    ]);
    const end = Math.min(page.before ?? countRow.count, countRow.count);
    const start = Math.max(0, end - 30);
    const thread = await Ticket.findOne(filter)
      .select({ messages: { $slice: [start, Math.max(1, end - start)] } })
      .lean();
    res.json({
      ...meta,
      messages: end ? (thread?.messages ?? []) : [],
      nextBefore: start > 0 ? start : null,
    });
  }),
);
r.post(
  "/tickets/:id/messages",
  requireAuth,
  ah(async (req, res) => {
    const { text } = z
      .object({ text: z.string().trim().min(1).max(4000) })
      .parse(req.body);
    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: id(req.params.id),
        ...(req.user!.role === "customer" ? { userId: req.user!._id } : {}),
      },
      { $push: { messages: { sender: req.user!.role, text, at: new Date() } } },
      { new: true },
    )
      .select("_id status")
      .lean();
    if (!ticket) throw new HttpError(404, "Không tìm thấy yêu cầu.");
    res.json(ticket);
  }),
);
r.post(
  "/chat",
  customerOrGuest,
  publicLimit,
  ah(async (req, res) => {
    const body = z
      .object({ message: z.string().trim().min(1).max(2000) })
      .parse(req.body);
    if (
      /nhân viên|người thật|con người|khiếu nại|hoàn tiền/i.test(body.message)
    ) {
      res.json({
        message:
          "Được nhé, Sóc sẽ giúp bạn kết nối với nhân viên. Bạn gửi yêu cầu bên dưới để đội ngũ tiếp tục hỗ trợ mình nha.",
        handoff: true,
      });
      return;
    }
    if (!integrationStatus().gemini) {
      res.json({
        message:
          "Sóc đang tạm nghỉ một chút để kết nối lại. Bạn có thể nhờ nhân viên hỗ trợ ngay bên dưới nhé!",
        handoff: true,
        remaining: env.AI_DAILY_LIMIT,
      });
      return;
    }
    const day = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date());
    const key = `${req.user?._id ?? digest(req.ip ?? "unknown")}:${day}`;
    await AiUsage.updateOne(
      { key },
      {
        $setOnInsert: {
          count: 0,
          expiresAt: new Date(Date.now() + 2 * 86400000),
        },
      },
      { upsert: true },
    );
    const usage = await AiUsage.findOneAndUpdate(
      { key, count: { $lt: env.AI_DAILY_LIMIT } },
      { $inc: { count: 1 } },
      { new: true },
    );
    if (!usage) {
      res.json({
        message: `Mình đã trò chuyện đủ ${env.AI_DAILY_LIMIT} lượt AI hôm nay rồi. Sóc vẫn có thể kết nối bạn với nhân viên ngay bên dưới, hoặc mình gặp lại nhau ngày mai nhé! 🐿️`,
        handoff: true,
        remaining: 0,
      });
      return;
    }
    try {
      const product = await Product.findOne({
        slug: "bo-tro-choi-tranh-trap",
        active: true,
      })
        .select("name description price age players duration components")
        .lean();
      res.json({
        message: await askGemini(body.message, JSON.stringify(product)),
        handoff: false,
        remaining: Math.max(0, env.AI_DAILY_LIMIT - usage.count),
      });
    } catch (e) {
      await AiUsage.updateOne({ key }, { $inc: { count: -1 } });
      throw e;
    }
  }),
);
r.get(
  "/admin/users",
  requireAuth,
  roles("admin"),
  ah(async (req, res) => {
    const page = pageSchema.strict().parse(req.query);
    const rows = await User.find(cursorFilter(page.cursor))
      .select("name email role active createdAt")
      .sort(pageSort)
      .limit(page.limit + 1)
      .lean();
    res.json(cursorPage(rows, page.limit));
  }),
);
r.get(
  "/admin/users/:id",
  requireAuth,
  roles("admin"),
  ah(async (req, res) => {
    const user = await User.findById(id(req.params.id)).lean();
    if (!user) throw new HttpError(404, "Không tìm thấy tài khoản.");
    res.json(user);
  }),
);
r.post(
  "/admin/users",
  requireAuth,
  roles("admin"),
  ah(async (req, res) => {
    const body = z
      .object({
        name,
        email,
        password,
        role: z.enum(["customer", "staff", "admin"]),
      })
      .strict()
      .parse(req.body);
    res.status(201).json(
      safeUser(
        await User.create({
          name: body.name,
          email: body.email,
          role: body.role,
          passwordHash: await bcrypt.hash(body.password, 12),
        }),
      ),
    );
  }),
);
r.patch(
  "/admin/users/:id",
  requireAuth,
  roles("admin"),
  ah(async (req, res) => {
    const body = z.object({ active: z.boolean() }).strict().parse(req.body);
    const userId = id(req.params.id);
    if (sameOwner(req, userId))
      throw new HttpError(400, "Không thể tự khóa tài khoản đang sử dụng.");
    const user = await User.findByIdAndUpdate(userId, body, { new: true });
    if (!user) throw new HttpError(404, "Không tìm thấy tài khoản.");
    if (!body.active) await Session.deleteMany({ userId });
    res.json(user);
  }),
);
r.post(
  "/admin/users/:id/reset-password",
  requireAuth,
  roles("admin"),
  ah(async (req, res) => {
    const user = await User.findById(id(req.params.id)).select("email").lean();
    if (!user) throw new HttpError(404, "Không tìm thấy tài khoản.");
    await passwordReset(user._id, user.email);
    res.json({ message: "Đã gửi liên kết đặt lại mật khẩu cho khách hàng." });
  }),
);
r.put(
  "/admin/product",
  requireAuth,
  roles("admin"),
  ah(async (req, res) => {
    const body = z
      .object({
        name,
        description: z.string().min(20).max(4000),
        price: z.number().int().min(1000).max(100000000),
        stock: z.number().int().min(0).max(1000000),
        active: z.boolean(),
        age: z.string().min(1).max(60),
        players: z.string().min(1).max(60),
        duration: z.string().min(1).max(60),
        components: z
          .array(
            z.object({
              name,
              quantity: z.number().int().positive().max(10000),
              description: z.string().max(500),
            }),
          )
          .min(1)
          .max(30),
      })
      .strict()
      .parse(req.body);
    res.json(
      await Product.findOneAndUpdate(
        { slug: "bo-tro-choi-tranh-trap" },
        { $set: body },
        { new: true, runValidators: true },
      ),
    );
  }),
);
r.get(
  "/admin/product",
  requireAuth,
  roles("admin"),
  ah(async (_req, res) =>
    res.json(await Product.findOne({ slug: "bo-tro-choi-tranh-trap" }).lean()),
  ),
);
r.put(
  "/admin/shipping/:province",
  requireAuth,
  roles("admin"),
  ah(async (req, res) => {
    const province = z.enum(provinces).parse(req.params.province);
    const body = z
      .object({ fee: z.number().int().min(0).max(1000000) })
      .strict()
      .parse(req.body);
    res.json(
      await ShippingRate.findOneAndUpdate(
        { province },
        { $set: body },
        { upsert: true, new: true },
      ),
    );
  }),
);
r.delete(
  "/admin/shipping/:province",
  requireAuth,
  roles("admin"),
  ah(async (req, res) => {
    const province = z.enum(provinces).parse(req.params.province);
    await ShippingRate.deleteOne({ province });
    res.json({ message: "Đã trả về phí mặc định." });
  }),
);
