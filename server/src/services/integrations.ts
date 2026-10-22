import nodemailer from "nodemailer";
import { PayOS } from "@payos/node";
import { env } from "../config/env.js";
import { HttpError } from "./auth.js";
import { buildChatPrompt } from "./chatPrompt.js";

export const integrationStatus = () => ({
  payos: Boolean(
    env.PAYOS_CLIENT_ID && env.PAYOS_API_KEY && env.PAYOS_CHECKSUM_KEY,
  ),
  smtp: Boolean(env.SMTP_HOST && env.SMTP_FROM),
  gemini: Boolean(env.GEMINI_API_KEY),
});
export function payos() {
  if (!integrationStatus().payos)
    throw new HttpError(
      503,
      "PayOS chưa được cấu hình. Vui lòng chọn thanh toán khi nhận hàng.",
    );
  return new PayOS({
    clientId: env.PAYOS_CLIENT_ID,
    apiKey: env.PAYOS_API_KEY,
    checksumKey: env.PAYOS_CHECKSUM_KEY,
    timeout: 15000,
    logLevel: "off",
  });
}
export async function sendMail(to: string, subject: string, text: string) {
  if (!integrationStatus().smtp) return false;
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    ...(env.SMTP_USER
      ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } }
      : {}),
  });
  await transport.sendMail({ from: env.SMTP_FROM, to, subject, text });
  return true;
}
export async function askGemini(message: string, context: string) {
  if (!env.GEMINI_API_KEY)
    throw new HttpError(
      503,
      "Sóc AI đang chờ kết nối. Bạn có thể gửi yêu cầu hỗ trợ cho nhân viên.",
    );
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/interactions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        model: env.GEMINI_MODEL,
        input: buildChatPrompt(message, context, env.AI_CHAT_TONE),
      }),
    },
  );
  if (!response.ok)
    throw new HttpError(
      502,
      "Sóc AI tạm thời chưa trả lời được. Vui lòng thử lại hoặc kết nối nhân viên.",
    );
  const data = (await response.json()) as {
    output_text?: string;
    outputs?: { type: string; text?: string }[];
  };
  const text =
    data.output_text ||
    data.outputs
      ?.filter((x) => x.type === "text")
      .map((x) => x.text)
      .join("\n");
  if (!text)
    throw new HttpError(
      502,
      "Sóc AI chưa có câu trả lời. Vui lòng kết nối nhân viên.",
    );
  return text;
}
