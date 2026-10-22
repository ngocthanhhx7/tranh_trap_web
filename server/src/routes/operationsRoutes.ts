import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Order, Ticket, Product, Notification } from "../models/index.js";
import { HttpError } from "../services/auth.js";
import { integrationStatus } from "../services/integrations.js";
import { asyncHandler as ah } from "../utils/asyncHandler.js";
import {
  pageSchema,
  cursorFilter,
  cursorPage,
  pageSort,
} from "../services/pagination.js";
const id = (value: unknown) => {
  const v = z.string().parse(value);
  if (!mongoose.isValidObjectId(v))
    throw new HttpError(400, "Mã không hợp lệ.");
  return v;
};
export const operationsRoutes = Router();
const r = operationsRoutes;
r.get(
  "/dashboard",
  ah(async (req, res) => {
    const [orders, tickets, orderCounts, ticketCounts, revenueRows] =
      await Promise.all([
        Order.find()
          .select(
            "code customer.name customer.province product total paymentStatus status createdAt",
          )
          .sort(pageSort)
          .limit(5)
          .lean(),
        Ticket.find({ status: "open" })
          .select("subject name type status createdAt")
          .sort(pageSort)
          .limit(5)
          .lean(),
        Order.aggregate<{ _id: string; count: number }>([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Ticket.aggregate<{
          _id: { type: string; status: string };
          count: number;
        }>([
          { $match: { status: { $in: ["open", "processing"] } } },
          {
            $group: {
              _id: { type: "$type", status: "$status" },
              count: { $sum: 1 },
            },
          },
        ]),
        req.user!.role === "admin"
          ? Order.aggregate<{ total: number }>([
              { $match: { status: "delivered" } },
              { $group: { _id: null, total: { $sum: "$total" } } },
            ])
          : Promise.resolve([]),
      ]);
    res.json({
      orders,
      tickets,
      orderCounts: Object.fromEntries(orderCounts.map((x) => [x._id, x.count])),
      totalOrders: orderCounts.reduce((n, x) => n + x.count, 0),
      openSupportCount: ticketCounts
        .filter((x) => x._id.type !== "complaint")
        .reduce((n, x) => n + x.count, 0),
      openComplaintCount: ticketCounts
        .filter((x) => x._id.type === "complaint")
        .reduce((n, x) => n + x.count, 0),
      newTicketCount: ticketCounts
        .filter((x) => x._id.status === "open")
        .reduce((n, x) => n + x.count, 0),
      ...(req.user!.role === "admin"
        ? {
            revenue: revenueRows[0]?.total ?? 0,
            integrations: integrationStatus(),
          }
        : {}),
    });
  }),
);
r.get(
  "/orders",
  ah(async (req, res) => {
    const page = pageSchema
      .extend({
        status: z
          .enum(["pending", "confirmed", "shipping", "delivered", "cancelled"])
          .optional(),
      })
      .strict()
      .parse(req.query);
    const rows = await Order.find({
      ...cursorFilter(page.cursor),
      ...(page.status ? { status: page.status } : {}),
    })
      .select("-history -__v")
      .sort(pageSort)
      .limit(page.limit + 1)
      .lean();
    res.json(cursorPage(rows, page.limit));
  }),
);
r.get(
  "/orders/:id",
  ah(async (req, res) => {
    const order = await Order.findById(id(req.params.id)).lean();
    if (!order) throw new HttpError(404, "Không tìm thấy đơn hàng.");
    res.json(order);
  }),
);
r.get(
  "/tickets",
  ah(async (req, res) => {
    const page = pageSchema
      .extend({
        type: z.enum(["support", "complaint", "contact"]).optional(),
        status: z.enum(["open", "processing", "resolved"]).optional(),
        group: z.enum(["support", "complaint"]).optional(),
      })
      .strict()
      .parse(req.query);
    const typeFilter = page.type
      ? { type: page.type }
      : page.group === "complaint"
        ? { type: "complaint" }
        : page.group === "support"
          ? { type: { $in: ["support", "contact"] } }
          : {};
    const rows = await Ticket.find({
      ...cursorFilter(page.cursor),
      ...typeFilter,
      ...(page.status ? { status: page.status } : {}),
    })
      .select("-messages -__v")
      .sort(pageSort)
      .limit(page.limit + 1)
      .lean();
    res.json(cursorPage(rows, page.limit));
  }),
);
r.patch(
  "/orders/:id",
  ah(async (req, res) => {
    const body = z
      .object({
        status: z.enum([
          "pending",
          "confirmed",
          "shipping",
          "delivered",
          "cancelled",
        ]),
        carrier: z.string().max(100).default(""),
        trackingNumber: z.string().max(100).default(""),
      })
      .strict()
      .parse(req.body);
    const order = await Order.findById(id(req.params.id)).lean();
    if (!order) throw new HttpError(404, "Không tìm thấy đơn.");
    const transitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipping", "cancelled"],
      shipping: ["delivered"],
      delivered: [],
      cancelled: [],
    };
    if (
      body.status !== order.status &&
      !transitions[order.status]?.includes(body.status)
    )
      throw new HttpError(409, "Không thể chuyển trạng thái đơn hàng như vậy.");
    if (body.status === "shipping" && (!body.carrier || !body.trackingNumber))
      throw new HttpError(400, "Cần đơn vị vận chuyển và mã vận đơn.");
    if (body.status === "cancelled" && order.paymentStatus === "paid")
      throw new HttpError(
        409,
        "Đơn đã thanh toán cần xử lý hoàn tiền qua hỗ trợ trước khi hủy.",
      );
    if (["delivered", "cancelled"].includes(order.status))
      throw new HttpError(409, "Đơn đã kết thúc không thể chỉnh sửa.");
    if (
      body.status === "shipping" &&
      order.paymentMethod === "payos" &&
      order.paymentStatus !== "paid"
    )
      throw new HttpError(
        409,
        "Đơn PayOS cần được thanh toán trước khi giao hàng.",
      );
    if (
      body.status === order.status &&
      body.carrier === (order.carrier ?? "") &&
      body.trackingNumber === (order.trackingNumber ?? "")
    ) {
      res.json(order);
      return;
    }
    const previousStatus = order.status;
    const updated = await Order.findOneAndUpdate(
      {
        _id: order._id,
        status: previousStatus,
        paymentStatus: order.paymentStatus,
        updatedAt: order.updatedAt,
      },
      {
        $set: {
          ...body,
          ...(body.status === "delivered" && order.paymentMethod === "cod"
            ? { paymentStatus: "paid" }
            : {}),
        },
        $push: {
          history: {
            status: body.status,
            note: "Đội ngũ Tránh Trap cập nhật đơn hàng.",
            at: new Date(),
          },
        },
      },
      { new: true },
    );
    if (!updated)
      throw new HttpError(409, "Đơn vừa được cập nhật. Vui lòng tải lại.");
    if (body.status === "cancelled" && previousStatus !== "cancelled")
      await Product.updateOne(
        { slug: "bo-tro-choi-tranh-trap" },
        { $inc: { stock: order.product?.quantity ?? 0 } },
      );
    if (order.userId)
      await Notification.create({
        userId: order.userId,
        title: `Cập nhật đơn ${order.code}`,
        text: `Trạng thái đơn hàng: ${body.status}.`,
      });
    res.json(updated);
  }),
);
r.patch(
  "/tickets/:id",
  ah(async (req, res) => {
    const body = z
      .object({ status: z.enum(["open", "processing", "resolved"]) })
      .parse(req.body);
    const ticket = await Ticket.findByIdAndUpdate(id(req.params.id), body, {
      new: true,
    })
      .select("-messages")
      .lean();
    if (!ticket) throw new HttpError(404, "Không tìm thấy yêu cầu.");
    res.json(ticket);
  }),
);
