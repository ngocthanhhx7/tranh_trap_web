import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  connectDatabase,
  disconnectDatabase,
} from "../../src/config/database.js";
import { User } from "../../src/models/index.js";

// User-run interactive command. No default credential, arguments or secret logs.
let hide = false;
const output = new Writable({
  write(chunk, _encoding, done) {
    if (!hide) stdout.write(chunk);
    done();
  },
});
const rl = createInterface({ input: stdin, output, terminal: true });
try {
  await connectDatabase();
  if (await User.exists({ role: "admin" }))
    throw new Error(
      "Đã có admin. Hãy dùng trang Quản lý tài khoản để tạo thêm.",
    );
  const name = z
    .string()
    .min(2)
    .max(100)
    .parse(await rl.question("Họ tên admin: "));
  const email = z
    .string()
    .email()
    .transform((v) => v.toLowerCase())
    .parse((await rl.question("Email admin: ")).trim());
  const passwordPrompt = rl.question(
    "Mật khẩu (ít nhất 10 ký tự, không hiển thị): ",
  );
  hide = true;
  const password = z
    .string()
    .min(10)
    .max(128)
    .refine(value => Buffer.byteLength(value, "utf8") <= 72, "Mật khẩu tối đa 72 byte UTF-8.")
    .parse(await passwordPrompt);
  hide = false;
  stdout.write("\n");
  const confirmationPrompt = rl.question("Nhập lại mật khẩu: ");
  hide = true;
  const confirmation = await confirmationPrompt;
  hide = false;
  stdout.write("\n");
  if (password !== confirmation)
    throw new Error("Mật khẩu xác nhận không khớp.");
  await User.create({
    name,
    email,
    role: "admin",
    passwordHash: await bcrypt.hash(password, 12),
  });
  console.info("Đã tạo admin. Đăng nhập website để mở dashboard.");
} catch (error) {
  hide = false;
  console.error(
    error instanceof z.ZodError
      ? "Thông tin chưa hợp lệ. Vui lòng chạy lại."
      : error instanceof Error
        ? error.message
        : "Không thể tạo admin.",
  );
  process.exitCode = 1;
} finally {
  rl.close();
  await disconnectDatabase();
}
