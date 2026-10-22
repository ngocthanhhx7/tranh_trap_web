import type { Role } from "../services/shop";
export const roleHome = (role?: Role) =>
  role === "admin" ? "/admin" : role === "staff" ? "/staff" : "/";
export const operationsBase = (role?: Role) =>
  role === "admin" ? "/admin/operations" : "/staff";
