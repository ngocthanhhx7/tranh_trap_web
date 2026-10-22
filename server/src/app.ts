import cors from "cors";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { HttpError } from "./services/auth.js";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { apiRoutes } from "./routes/index.js";
import rateLimit from "express-rate-limit";

export const app = express();

app.disable("x-powered-by");
// Only enable for a single trusted reverse proxy with the API port kept private.
app.set("trust proxy", env.TRUST_PROXY_HOPS);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use((req, _res, next) => {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.path !== "/api/v1/payments/webhook" &&
    ((req.headers.origin && req.headers.origin !== env.CLIENT_ORIGIN) ||
      req.headers["sec-fetch-site"] === "cross-site")
  ) {
    next(new HttpError(403, "Nguồn yêu cầu không hợp lệ."));
    return;
  }
  next();
});
app.use("/api/v1", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(
  "/api/v1",
  rateLimit({
    windowMs: 15 * 60000,
    limit: env.NODE_ENV === "test" ? 10000 : 600,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: (req) => req.path === "/payments/webhook",
    message: { message: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(
  pinoHttp({
    enabled: env.NODE_ENV !== "test",
    quietReqLogger: true,
    redact: [
      "req.headers.cookie",
      "req.headers.authorization",
      "res.headers.set-cookie",
    ],
    serializers: {
      res: (res) => ({ statusCode: res.statusCode }),
      req: (req) => ({
        method: req.method,
        url: String(req.url).split("?")[0],
      }),
    },
  }),
);
app.get("/", (_request, response) => {
  response.json({
    name: "Tranh Trap Web API",
    version: "1.0.0",
    docs: "/api/v1/health",
  });
});
app.use(apiRoutes);
app.use(notFound);
app.use(errorHandler);
