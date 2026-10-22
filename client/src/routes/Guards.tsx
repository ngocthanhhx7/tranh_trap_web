import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../app/Store";
import type { Role } from "../services/shop";
import { roleHome } from "./access";
import { ErrorPage } from "../pages/public/ErrorPage";
import { PageLoader } from "../components/common/PageMotion";
function Pending() {
  return <PageLoader message="Đang kiểm tra phiên đăng nhập…" />;
}
export function CustomerArea() {
  const { user, loading, authError } = useStore();
  if (loading) return <Pending />;
  if (authError) return <ErrorPage status={503} />;
  return user && user.role !== "customer" ? (
    <Navigate to={roleHome(user.role)} replace />
  ) : (
    <Outlet />
  );
}
export function GuestArea() {
  const { user, loading, authError } = useStore();
  if (loading) return <Pending />;
  if (authError) return <ErrorPage status={503} />;
  return user ? <Navigate to={roleHome(user.role)} replace /> : <Outlet />;
}
export function RoleArea({ role }: { role: Role }) {
  const { user, loading, authError } = useStore();
  if (loading) return <Pending />;
  if (authError) return <ErrorPage status={503} />;
  if (!user) return <Navigate to="/dang-nhap" replace />;
  return user.role === role ? <Outlet /> : <ErrorPage status={403} />;
}
export function ManagementRedirect() {
  const { user, loading, authError } = useStore();
  if (loading) return <Pending />;
  if (authError) return <ErrorPage status={503} />;
  if (!user) return <Navigate to="/dang-nhap" replace />;
  return user.role === "customer" ? (
    <ErrorPage status={403} />
  ) : (
    <Navigate to={roleHome(user.role)} replace />
  );
}
