import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { HomePage } from "../pages/public/HomePage";
import { NotFoundPage } from "../pages/public/NotFoundPage";
import {
  AuthPage,
  CartPage,
  CheckoutPage,
  LookupPage,
  ProductPage,
} from "../pages/public/CommercePages";
import {
  AboutPage,
  ArticlePage,
  ChallengePage,
  ContactPage,
  GuidePage,
  HandbookPage,
  PolicyPage,
  StoryPage,
  VideoLibraryPage,
} from "../pages/public/ContentPages";
import {
  AccountLayout,
  AddressesPage,
  NotificationsPage,
  OrdersPage,
  PasswordPage,
  ProfilePage,
  ReviewsPage,
  SupportPage,
} from "../pages/account/AccountPages";
import {
  AdminNotificationsPage,
  AdminProductPage,
  AdminUsersPage,
  DashboardPage,
  ManagementLayout,
  ManagementAccountLayout,
  ManagementOrdersPage,
  ManagementTicketsPage,
  ShippingPage,
} from "../pages/management/ManagementPages";
import type { RouteObject } from "react-router-dom";
import {
  CustomerArea,
  GuestArea,
  RoleArea,
  ManagementRedirect,
} from "./Guards";
import { ErrorPage, RouteErrorBoundary } from "../pages/public/ErrorPage";
function managementRoutes(role: "admin" | "staff"): RouteObject {
  return {
    path: `/${role}`,
    element: <RoleArea role={role} />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <ManagementLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "don-hang", element: <ManagementOrdersPage /> },
          { path: "ho-tro", element: <ManagementTicketsPage /> },
          { path: "khieu-nai", element: <ManagementTicketsPage complaints /> },
          {
            path: "tai-khoan",
            element: <ManagementAccountLayout />,
            children: [
              { index: true, element: <Navigate to="ho-so" replace /> },
              { path: "ho-so", element: <ProfilePage /> },
              { path: "doi-mat-khau", element: <PasswordPage /> },
            ],
          },
          ...(role === "admin"
            ? [
                { path: "san-pham", element: <AdminProductPage /> },
                { path: "nguoi-dung", element: <AdminUsersPage /> },
                { path: "phi-van-chuyen", element: <ShippingPage /> },
                { path: "thong-bao", element: <AdminNotificationsPage /> },
              ]
            : []),
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  };
}
export const appRoutes: RouteObject[] = [
  {
    element: <CustomerArea />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/ve-tranh-trap", element: <AboutPage /> },
          { path: "/cau-chuyen", element: <StoryPage /> },
          { path: "/san-pham", element: <ProductPage /> },
          { path: "/lien-he", element: <ContactPage /> },
          { path: "/gio-hang", element: <CartPage /> },
          { path: "/thanh-toan", element: <CheckoutPage /> },
          { path: "/tra-cuu-don-hang", element: <LookupPage /> },
          {
            element: <GuestArea />,
            children: [
              { path: "/dang-nhap", element: <AuthPage mode="login" /> },
              { path: "/dang-ky", element: <AuthPage mode="register" /> },
              { path: "/quen-mat-khau", element: <AuthPage mode="forgot" /> },
              { path: "/dat-lai-mat-khau", element: <AuthPage mode="reset" /> },
            ],
          },
          { path: "/huong-dan", element: <GuidePage /> },
          { path: "/chinh-sach/:slug", element: <PolicyPage /> },
          { path: "/cam-nang", element: <HandbookPage /> },
          { path: "/cam-nang/:slug", element: <ArticlePage /> },
          { path: "/thu-vien-video", element: <VideoLibraryPage /> },
          { path: "/dung-trap", element: <ChallengePage /> },
          {
            element: <RoleArea role="customer" />,
            children: [
              {
                path: "/tai-khoan",
                element: <AccountLayout />,
                children: [
                  { index: true, element: <Navigate to="ho-so" replace /> },
                  { path: "ho-so", element: <ProfilePage /> },
                  { path: "dia-chi", element: <AddressesPage /> },
                  { path: "doi-mat-khau", element: <PasswordPage /> },
                  { path: "email", element: <PasswordPage email /> },
                  { path: "thong-bao", element: <NotificationsPage /> },
                  { path: "don-hang", element: <OrdersPage /> },
                  { path: "danh-gia", element: <ReviewsPage /> },
                  { path: "ho-tro", element: <SupportPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  managementRoutes("admin"),
  managementRoutes("staff"),
  {
    path: "/quan-ly/*",
    element: <ManagementRedirect />,
    errorElement: <RouteErrorBoundary />,
  },
  ...[400, 401, 403, 404, 409, 413, 429, 500, 503].map((status) => ({
    path: `/loi/${status}`,
    element: <ErrorPage status={status} />,
  })),
  {
    path: "*",
    element: <NotFoundPage />,
    errorElement: <RouteErrorBoundary />,
  },
];
export const router = createBrowserRouter(appRoutes);
