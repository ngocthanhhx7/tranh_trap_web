import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../services/auth.js";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  if (error instanceof URIError) {
    response.status(400).json({ message: "Đường dẫn yêu cầu không hợp lệ." });
    return;
  }

  if (typeof error === "object" && error && "type" in error) {
    if (error.type === "entity.parse.failed") {
      response.status(400).json({ message: "Nội dung JSON không hợp lệ." });
      return;
    }
    if (error.type === "entity.too.large") {
      response
        .status(413)
        .json({ message: "Nội dung yêu cầu vượt quá dung lượng cho phép." });
      return;
    }
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Dữ liệu chưa hợp lệ.",
      errors: error.flatten().fieldErrors,
    });
    return;
  }
  if (error instanceof HttpError) {
    response.status(error.status).json({ message: error.message });
    return;
  }
  if (
    typeof error === "object" &&
    error &&
    "code" in error &&
    error.code === 11000
  ) {
    response
      .status(409)
      .json({ message: "Dữ liệu đã tồn tại. Vui lòng kiểm tra lại." });
    return;
  }
  console.error(
    "Request failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  response
    .status(500)
    .json({ message: "Hệ thống tạm thời gặp sự cố. Vui lòng thử lại sau." });
};
