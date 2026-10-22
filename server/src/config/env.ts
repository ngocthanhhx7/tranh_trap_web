import { z } from "zod";
import { DEFAULT_CHAT_TONE } from "../services/chatPrompt.js";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(1).default(0),
  MONGODB_URI: z
    .string()
    .min(1)
    .default("mongodb://127.0.0.1:27017/tranh_trap_web"),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  SHIPPING_DEFAULT_FEE: z.coerce.number().int().nonnegative().default(25000),
  GEMINI_API_KEY: z.string().default(""),
  GEMINI_MODEL: z.string().default("gemini-3.8-flash"),
  AI_DAILY_LIMIT: z.coerce.number().int().min(1).max(10000).default(20),
  AI_CHAT_TONE: z.string().trim().min(1).max(2000).default(DEFAULT_CHAT_TONE),
  PAYOS_CLIENT_ID: z.string().default(""),
  PAYOS_API_KEY: z.string().default(""),
  PAYOS_CHECKSUM_KEY: z.string().default(""),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(""),
  SMTP_PASSWORD: z.string().default(""),
  SMTP_FROM: z.string().default(""),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment configuration:",
    parsedEnv.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsedEnv.data;
