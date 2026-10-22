import type { RequestHandler } from "express";
import mongoose from "mongoose";

export const getHealth: RequestHandler = (_request, response) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  response.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "degraded",
    service: "tranh-trap-web-api",
    database: databaseConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
};
