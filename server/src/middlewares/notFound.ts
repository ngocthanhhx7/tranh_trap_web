import type { RequestHandler } from "express";

export const notFound: RequestHandler = (_request, response) => {
  response.status(404).json({
    status: "error",
    message: "Không tìm thấy tài nguyên hoặc đường dẫn API.",
  });
};
