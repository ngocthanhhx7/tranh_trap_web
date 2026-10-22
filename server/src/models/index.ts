import mongoose, { Schema } from "mongoose";

const options = { timestamps: true } as const;
export const User = mongoose.model(
  "User",
  new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, unique: true, required: true },
      passwordHash: { type: String, required: true, select: false },
      role: {
        type: String,
        enum: ["customer", "staff", "admin"],
        default: "customer",
      },
      active: { type: Boolean, default: true },
      phone: { type: String, default: "" },
      gender: { type: String, default: "" },
      birthday: { type: String, default: "" },
      addresses: [
        {
          label: String,
          name: String,
          phone: String,
          detail: String,
          province: String,
          isDefault: Boolean,
        },
      ],
    },
    options,
  ),
);
export const Session = mongoose.model(
  "Session",
  new Schema(
    {
      tokenHash: { type: String, unique: true, required: true },
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      expiresAt: { type: Date, required: true, expires: 0 },
    },
    options,
  ),
);
export const Product = mongoose.model(
  "Product",
  new Schema(
    {
      slug: { type: String, unique: true, required: true },
      name: String,
      description: String,
      price: { type: Number, min: 0 },
      stock: { type: Number, min: 0 },
      active: Boolean,
      age: String,
      players: String,
      duration: String,
      components: [{ name: String, quantity: Number, description: String }],
    },
    options,
  ),
);
export const ShippingRate = mongoose.model(
  "ShippingRate",
  new Schema(
    {
      province: { type: String, unique: true, required: true },
      fee: { type: Number, min: 0, required: true },
    },
    options,
  ),
);
export const Order = mongoose.model(
  "Order",
  new Schema(
    {
      code: { type: String, unique: true, required: true },
      orderCode: { type: Number, unique: true },
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      customer: {
        name: String,
        email: String,
        phone: String,
        address: String,
        province: String,
      },
      product: { name: String, price: Number, quantity: Number },
      subtotal: Number,
      shippingFee: Number,
      total: Number,
      shippingMethod: String,
      paymentMethod: String,
      paymentStatus: { type: String, default: "unpaid" },
      status: {
        type: String,
        default: "pending",
        enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      },
      carrier: String,
      trackingNumber: String,
      note: String,
      checkoutUrl: String,
      history: [{ status: String, note: String, at: Date }],
    },
    options,
  ),
);
export const Ticket = mongoose.model(
  "Ticket",
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      type: { type: String, enum: ["support", "complaint", "contact"] },
      subject: String,
      email: String,
      name: String,
      orderCode: String,
      status: {
        type: String,
        enum: ["open", "processing", "resolved"],
        default: "open",
      },
      messages: [{ sender: String, text: String, at: Date }],
    },
    options,
  ),
);
export const Notification = mongoose.model(
  "Notification",
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      title: String,
      text: String,
      read: { type: Boolean, default: false },
    },
    options,
  ),
);
export const Review = mongoose.model(
  "Review",
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      orderId: { type: Schema.Types.ObjectId, unique: true },
      name: String,
      rating: Number,
      text: String,
    },
    options,
  ),
);
export const AiUsage = mongoose.model(
  "AiUsage",
  new Schema({
    key: { type: String, unique: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, expires: 0 },
  }),
);
export const ResetToken = mongoose.model(
  "ResetToken",
  new Schema({
    hash: { type: String, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    expiresAt: { type: Date, expires: 0 },
  }),
);

// Match equality filters followed by stable cursor ordering; no duplicate unique indexes.
Order.schema.index({ userId: 1, createdAt: -1, _id: -1 });
Order.schema.index({ status: 1, createdAt: -1, _id: -1 });
Order.schema.index({ createdAt: -1, _id: -1 });
Ticket.schema.index({ userId: 1, createdAt: -1, _id: -1 });
Ticket.schema.index({ type: 1, status: 1, createdAt: -1, _id: -1 });
Ticket.schema.index({ type: 1, createdAt: -1, _id: -1 });
Ticket.schema.index({ status: 1, createdAt: -1, _id: -1 });
Ticket.schema.index({ createdAt: -1, _id: -1 });
Notification.schema.index({ userId: 1, createdAt: -1, _id: -1 });
Review.schema.index({ userId: 1, createdAt: -1, _id: -1 });
Review.schema.index({ createdAt: -1, _id: -1 });
User.schema.index({ createdAt: -1, _id: -1 });
Session.schema.index({ userId: 1 });
