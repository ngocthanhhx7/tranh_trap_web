import { Router } from "express";
import { API_PREFIX } from "../constants/api.js";
import { healthRoutes } from "./healthRoutes.js";
import { shopRoutes } from "./shopRoutes.js";

export const apiRoutes = Router();
apiRoutes.use(API_PREFIX, healthRoutes);
apiRoutes.use(API_PREFIX, shopRoutes);
