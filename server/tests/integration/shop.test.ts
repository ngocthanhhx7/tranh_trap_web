import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import bcrypt from "bcryptjs";

// Isolated disposable database; never load .env or send mail/payments in tests.
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = `mongodb://127.0.0.1:27017/tranh_trap_test_${Date.now()}`;
process.env.SMTP_HOST = "";
process.env.GEMINI_API_KEY = "";
process.env.PAYOS_CLIENT_ID = "";
process.env.PAYOS_API_KEY = "";
process.env.PAYOS_CHECKSUM_KEY = "";
const { app } = await import("../../src/app.js");
const { ensureCatalog } = await import("../../src/services/catalog.js");
const { env } = await import("../../src/config/env.js");
const { User, Product, Order, Ticket, Notification } =
  await import("../../src/models/index.js");
const admin = request.agent(app),
  staff = request.agent(app),
  customer = request.agent(app),
  other = request.agent(app);
const base = "/api/v1";
const customerInfo = {
  name: "Khách kiểm thử",
  email: "buyer@example.test",
  phone: "0901234567",
  address: "123 đường kiểm thử, phường thử nghiệm",
  province: "Hà Nội",
};
let customerId = "";
before(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  await ensureCatalog();
  await Promise.all(
    Object.values(mongoose.models).map((model) => model.init()),
  );
  for (const role of ["admin", "staff"])
    await User.create({
      name: `Test ${role}`,
      email: `${role}@example.test`,
      role,
      passwordHash: await bcrypt.hash("TestPassword123!", 4),
    });
  for (const [agent, role] of [
    [admin, "admin"],
    [staff, "staff"],
  ] as const)
    await agent
      .post(`${base}/auth/login`)
      .send({ email: `${role}@example.test`, password: "TestPassword123!" })
      .expect(200);
  const result = await customer
    .post(`${base}/auth/register`)
    .send({
      name: "Customer Test",
      email: "customer@example.test",
      password: "TestPassword123!",
      confirmPassword: "TestPassword123!",
    })
    .expect(201);
  customerId = result.body._id;
  await other
    .post(`${base}/auth/register`)
    .send({
      name: "Other Test",
      email: "other@example.test",
      password: "TestPassword123!",
      confirmPassword: "TestPassword123!",
    })
    .expect(201);
});
after(async () => {
  assert.match(mongoose.connection.name, /^tranh_trap_test_\d+$/);
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
test("public prices, all 34 provinces and no secret configuration leakage", async () => {
  const result = await request(app).get(`${base}/catalog`).expect(200);
  assert.equal(result.body.product.price, 399000);
  assert.equal(result.body.integrations.payos, false);
  const shipping = await request(app).get(`${base}/shipping`).expect(200);
  assert.equal(shipping.body.provinces.length, 34);
  assert.equal(new Set(shipping.body.provinces).size, 34);
  assert.equal(shipping.body.defaultFee, 25000);
});
test("RBAC rejects guest/customer/staff admin mutations and registration role injection", async () => {
  await request(app).get(`${base}/admin/users`).expect(401);
  await customer.get(`${base}/admin/users`).expect(403);
  await staff
    .put(`${base}/admin/shipping/H%C3%A0%20N%E1%BB%99i`)
    .send({ fee: 0 })
    .expect(403);
  await request(app)
    .post(`${base}/auth/register`)
    .send({
      name: "Bad Test",
      email: "bad@example.test",
      password: "TestPassword123!",
      confirmPassword: "TestPassword123!",
      role: "admin",
    })
    .expect(400);
  await request(app)
    .post(`${base}/auth/login`)
    .set("Origin", "https://foreign.example")
    .send({})
    .expect(403);
});
test("guest purchase uses server price and shipping; validates province and blocks price injection", async () => {
  const payload = { customer: customerInfo, quantity: 2, paymentMethod: "cod" };
  const result = await request(app)
    .post(`${base}/orders`)
    .send(payload)
    .expect(201);
  assert.equal(result.body.order.total, 823000);
  assert.equal(result.body.order.shippingFee, 25000);
  assert.equal(result.body.order.trackingTokenHash, undefined);
  await request(app)
    .post(`${base}/orders`)
    .send({ ...payload, total: 1 })
    .expect(400);
  await request(app)
    .post(`${base}/orders`)
    .send({ ...payload, quantity: -1 })
    .expect(400);
  await request(app)
    .post(`${base}/orders`)
    .send({
      ...payload,
      customer: { ...customerInfo, province: "Không tồn tại" },
    })
    .expect(400);
  const code = result.body.order.code;
  await request(app)
    .post(`${base}/orders/lookup`)
    .send({ code, phone: "0909999999" })
    .expect(404);
  const lookup = await request(app)
    .post(`${base}/orders/lookup`)
    .send({ code, phone: customerInfo.phone })
    .expect(200);
  assert.equal(lookup.body.customer, undefined);
  assert.equal(lookup.body.total, 823000);
});
test("configured province overrides default, including zero fee; old orders retain shipping snapshot", async () => {
  await admin
    .put(`${base}/admin/shipping/${encodeURIComponent("Hà Nội")}`)
    .send({ fee: 0 })
    .expect(200);
  const created = await customer
    .post(`${base}/orders`)
    .send({ customer: customerInfo, quantity: 1, paymentMethod: "cod" })
    .expect(201);
  assert.equal(created.body.order.total, 399000);
  await admin
    .put(`${base}/admin/shipping/${encodeURIComponent("Hà Nội")}`)
    .send({ fee: 15000 })
    .expect(200);
  const stored = await Order.findById(created.body.order._id);
  assert.equal(stored?.shippingFee, 0);
  await admin
    .delete(`${base}/admin/shipping/${encodeURIComponent("Hà Nội")}`)
    .expect(200);
  await other
    .post(`${base}/account/orders/${created.body.order._id}/cancel`)
    .expect(409);
  const before = (await Product.findOne())!.stock!;
  await customer
    .post(`${base}/account/orders/${created.body.order._id}/cancel`)
    .expect(200);
  await customer
    .post(`${base}/account/orders/${created.body.order._id}/cancel`)
    .expect(409);
  assert.equal((await Product.findOne())!.stock, before + 1);
});
test("staff order transitions require carrier, prevent rollback; reviews require delivered owned orders", async () => {
  const created = await customer
    .post(`${base}/orders`)
    .send({ customer: customerInfo, quantity: 1, paymentMethod: "cod" })
    .expect(201);
  const id = created.body.order._id;
  await customer
    .post(`${base}/reviews`)
    .send({ orderId: id, rating: 5, text: "Đánh giá thử nghiệm chưa giao" })
    .expect(403);
  await staff
    .patch(`${base}/staff/orders/${id}`)
    .send({ status: "delivered" })
    .expect(409);
  await staff
    .patch(`${base}/staff/orders/${id}`)
    .send({ status: "confirmed" })
    .expect(200);
  await staff
    .patch(`${base}/staff/orders/${id}`)
    .send({ status: "shipping" })
    .expect(400);
  await staff
    .patch(`${base}/staff/orders/${id}`)
    .send({
      status: "shipping",
      carrier: "Test Carrier",
      trackingNumber: "TEST123",
    })
    .expect(200);
  await staff
    .patch(`${base}/staff/orders/${id}`)
    .send({
      status: "delivered",
      carrier: "Test Carrier",
      trackingNumber: "TEST123",
    })
    .expect(200);
  await other
    .post(`${base}/reviews`)
    .send({ orderId: id, rating: 5, text: "Đánh giá không phải của mình" })
    .expect(403);
  await customer
    .post(`${base}/reviews`)
    .send({ orderId: id, rating: 5, text: "Bộ trò chơi kiểm thử phù hợp" })
    .expect(201);
  await customer
    .post(`${base}/reviews`)
    .send({ orderId: id, rating: 5, text: "Bộ trò chơi kiểm thử trùng lặp" })
    .expect(409);
  await staff
    .patch(`${base}/staff/orders/${id}`)
    .send({ status: "pending" })
    .expect(409);
});
test("ticket ownership, staff replies and AI handoff work without Gemini credentials", async () => {
  const created = await customer
    .post(`${base}/tickets`)
    .send({
      type: "support",
      name: customerInfo.name,
      email: customerInfo.email,
      subject: "Cần nhân viên hỗ trợ",
      text: "Xin hỗ trợ đơn hàng kiểm thử",
    })
    .expect(201);
  await other
    .post(`${base}/tickets/${created.body._id}/messages`)
    .send({ text: "Unauthorized" })
    .expect(404);
  await staff
    .post(`${base}/tickets/${created.body._id}/messages`)
    .send({ text: "Đã tiếp nhận yêu cầu." })
    .expect(200);
  const ai = await customer
    .post(`${base}/chat`)
    .send({ message: "Tôi cần gặp nhân viên" })
    .expect(200);
  assert.equal(ai.body.handoff, true);
  await request(app)
    .post(`${base}/payments/webhook`)
    .send({ code: "00", data: { orderCode: 123, amount: 1 } })
    .expect(400);
});
test("account locking revokes sessions; admin users never expose password hashes; cannot delete accounts", async () => {
  const users = await admin.get(`${base}/admin/users`).expect(200);
  assert.ok(
    users.body.items.every((u: Record<string, unknown>) => !u.passwordHash),
  );
  await customer.get(`${base}/auth/me`).expect(200);
  await admin
    .patch(`${base}/admin/users/${customerId}`)
    .send({ active: false })
    .expect(200);
  await customer.get(`${base}/auth/me`).expect(401);
  await admin.delete(`${base}/admin/users/${customerId}`).expect(404);
});
test("AI quota uses configured limit and tone; explicit handoff remains available", async () => {
  const nativeFetch = globalThis.fetch;
  const previousLimit = env.AI_DAILY_LIMIT;
  const previousTone = env.AI_CHAT_TONE;
  env.AI_DAILY_LIMIT = 3;
  env.AI_CHAT_TONE = "Giọng Sóc vui vẻ kiểm thử";
  env.GEMINI_API_KEY = "test-only-no-external-call";
  globalThis.fetch = async (_input, options) => {
    const payload = JSON.parse(String(options?.body));
    assert.match(payload.input, /Giọng Sóc vui vẻ kiểm thử/);
    assert.match(payload.input, /Không tiết lộ mặt ngửa thẻ/);
    assert.match(payload.input, /ĐỊNH DẠNG/);
    return new Response(
      JSON.stringify({
        outputs: [{ type: "text", text: "Câu trả lời thử nghiệm." }],
      }),
      { status: 200 },
    );
  };
  try {
    for (let i = 0; i < env.AI_DAILY_LIMIT; i++) {
      const result = await other
        .post(`${base}/chat`)
        .send({ message: "Tìm hiểu trò chơi" })
        .expect(200);
      assert.equal(result.body.remaining, env.AI_DAILY_LIMIT - 1 - i);
      assert.equal(result.body.handoff, false);
    }
    const exhausted = await other
      .post(`${base}/chat`)
      .send({ message: "Tìm hiểu trò chơi" })
      .expect(200);
    assert.equal(exhausted.body.handoff, true);
    assert.equal(exhausted.body.remaining, 0);
    assert.match(exhausted.body.message, /3 lượt/);
    const handoff = await other
      .post(`${base}/chat`)
      .send({ message: "Gặp nhân viên thật" })
      .expect(200);
    assert.equal(handoff.body.handoff, true);
  } finally {
    globalThis.fetch = nativeFetch;
    env.GEMINI_API_KEY = "";
    env.AI_DAILY_LIMIT = previousLimit;
    env.AI_CHAT_TONE = previousTone;
  }
});
test("concurrent purchases cannot oversell the final unit", async () => {
  const product = await Product.findOne();
  const originalStock = product!.stock;
  await Product.updateOne({ _id: product!._id }, { stock: 1 });
  try {
    const payload = {
      customer: customerInfo,
      quantity: 1,
      paymentMethod: "cod",
    };
    const results = await Promise.all([
      request(app).post(`${base}/orders`).send(payload),
      request(app).post(`${base}/orders`).send(payload),
    ]);
    assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
    assert.equal((await Product.findById(product!._id))!.stock, 0);
  } finally {
    await Product.updateOne({ _id: product!._id }, { stock: originalStock });
  }
});

test("role namespaces reject cross-role access and operator customer mutations", async () => {
  await admin.get(`${base}/staff/dashboard`).expect(403);
  await staff.get(`${base}/admin/operations/dashboard`).expect(403);
  await other.get(`${base}/staff/dashboard`).expect(403);
  await other.get(`${base}/admin/operations/dashboard`).expect(403);
  await staff.get(`${base}/staff/dashboard`).expect(200);
  await admin.get(`${base}/admin/operations/dashboard`).expect(200);
  await admin.get(`${base}/management/dashboard`).expect(404);
  for (const agent of [staff, admin]) {
    await agent.get(`${base}/account/orders`).expect(403);
    await agent.post(`${base}/orders`).send({}).expect(403);
    await agent.post(`${base}/chat`).send({ message: "Xin chào" }).expect(403);
  }
});

test("password confirmation is mandatory and mismatch never changes credentials", async () => {
  const payload = {
    name: "Confirmation Test",
    email: "confirmation@example.test",
    password: "TestPassword123!",
  };
  await request(app).post(`${base}/auth/register`).send(payload).expect(400);
  await request(app)
    .post(`${base}/auth/register`)
    .send({ ...payload, confirmPassword: "DifferentPassword123!" })
    .expect(400);
  const agent = request.agent(app);
  const result = await agent
    .post(`${base}/auth/register`)
    .send({ ...payload, confirmPassword: payload.password })
    .expect(201);
  assert.match(String(result.headers["set-cookie"]), /HttpOnly/i);
  assert.match(String(result.headers["set-cookie"]), /SameSite=Lax/i);
  await agent
    .post(`${base}/account/password`)
    .send({
      currentPassword: payload.password,
      password: "NewPassword123!",
      confirmPassword: "DifferentPassword123!",
    })
    .expect(400);
  await agent
    .post(`${base}/account/password`)
    .send({
      currentPassword: payload.password,
      password: "NewPassword123!",
      confirmPassword: "NewPassword123!",
    })
    .expect(200);
  await agent.post(`${base}/auth/logout`).expect(200);
  await agent
    .post(`${base}/auth/login`)
    .send({ email: payload.email, password: payload.password })
    .expect(401);
  await agent
    .post(`${base}/auth/login`)
    .send({ email: payload.email, password: "NewPassword123!" })
    .expect(200);
});

test("malformed requests have safe status and response text", async () => {
  await request(app)
    .post(`${base}/auth/login`)
    .set("Content-Type", "application/json")
    .send('{"broken":')
    .expect(400);
  const missing = await request(app)
    .get(`${base}/not-found?private-canary=secret`)
    .expect(404);
  assert.doesNotMatch(
    JSON.stringify(missing.body),
    /private-canary|secret|stack/,
  );
  await request(app)
    .post(`${base}/orders`)
    .set("Sec-Fetch-Site", "cross-site")
    .send({})
    .expect(403);
  await admin.get(`${base}/admin/users?limit=101`).expect(400);
  await admin.get(`${base}/admin/users?cursor=bad`).expect(400);
  await staff
    .patch(`${base}/staff/tickets/${new mongoose.Types.ObjectId()}`)
    .send({ status: "resolved" })
    .expect(404);
});

test("cursor pagination, ticket slicing and indexed plans stay bounded", async () => {
  const owner = await User.findOne({ email: "other@example.test" });
  await Notification.insertMany(
    Array.from({ length: 60 }, (_, i) => ({
      userId: owner!._id,
      title: `Page ${i}`,
      text: "Test",
    })),
  );
  const first = await other
    .get(`${base}/account/notifications?limit=25`)
    .expect(200);
  const second = await other
    .get(
      `${base}/account/notifications?limit=25&cursor=${encodeURIComponent(first.body.nextCursor)}`,
    )
    .expect(200);
  assert.equal(first.body.items.length, 25);
  assert.equal(second.body.items.length, 25);
  assert.equal(
    new Set([...first.body.items, ...second.body.items].map((x) => x._id)).size,
    50,
  );
  const ticket = await Ticket.create({
    userId: owner!._id,
    type: "support",
    subject: "Long test",
    name: owner!.name,
    email: owner!.email,
    messages: Array.from({ length: 65 }, (_, i) => ({
      sender: "customer",
      text: `Message ${i}`,
      at: new Date(),
    })),
  });
  const thread = await other.get(`${base}/tickets/${ticket._id}`).expect(200);
  assert.equal(thread.body.messages.length, 30);
  assert.equal(thread.body.nextBefore, 35);
  await Promise.all([
    other
      .post(`${base}/tickets/${ticket._id}/messages`)
      .send({ text: "Concurrent one" })
      .expect(200),
    staff
      .post(`${base}/tickets/${ticket._id}/messages`)
      .send({ text: "Concurrent two" })
      .expect(200),
  ]);
  assert.equal((await Ticket.findById(ticket._id))!.messages.length, 67);
  const checks = [
    Order.find({ userId: owner!._id })
      .sort({ createdAt: -1, _id: -1 })
      .limit(26),
    Ticket.find({ userId: owner!._id })
      .sort({ createdAt: -1, _id: -1 })
      .limit(26),
    Notification.find({ userId: owner!._id })
      .sort({ createdAt: -1, _id: -1 })
      .limit(26),
    User.find().sort({ createdAt: -1, _id: -1 }).limit(26),
  ];
  for (const query of checks) {
    const plan = await query.explain("executionStats");
    const serialized = JSON.stringify(plan.queryPlanner.winningPlan);
    assert.match(serialized, /IXSCAN/);
    assert.doesNotMatch(serialized, /COLLSCAN|"stage":"SORT"/);
    assert.ok(plan.executionStats.totalDocsExamined <= 26);
  }
});
