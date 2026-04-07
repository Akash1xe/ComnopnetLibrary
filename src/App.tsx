import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { PageLoader } from "./components/ui/PageLoader";
import { BrandPage } from "./pages/BrandPage";
import { DocsPage } from "./pages/DocsPage";
import { HomePage } from "./pages/HomePage";
import { PricingPage } from "./pages/PricingPage";
import { useAuthStore } from "./stores/authStore";

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const GithubCallbackPage = lazy(() => import("./pages/auth/GithubCallbackPage"));
const ComponentsPage = lazy(() => import("./pages/ComponentsPage"));
const ComponentDetailPage = lazy(() => import("./pages/ComponentDetailPage"));
const OverviewPage = lazy(() => import("./pages/dashboard/OverviewPage"));
const CollectionsPage = lazy(() => import("./pages/dashboard/CollectionsPage"));
const BillingPage = lazy(() => import("./pages/dashboard/BillingPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const AdminOverviewPage = lazy(() => import("./pages/admin/AdminOverviewPage"));
const AdminComponentsPage = lazy(() => import("./pages/admin/AdminComponentsPage"));
const ComponentEditorPage = lazy(() => import("./pages/admin/ComponentEditorPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));

function MarketingLayout() {
  return (
    <div className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(26,26,26,0.8)_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.08]" />
      <div className="pointer-events-none absolute left-[-8rem] top-12 h-[600px] w-[600px] rounded-full bg-[rgba(0,212,255,0.15)] blur-[120px]" />
      <div className="pointer-events-none absolute right-[-8rem] top-24 h-[500px] w-[500px] rounded-full bg-[rgba(168,85,247,0.1)] blur-[120px]" />
      <Navbar />
      <Outlet />
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader label="Checking session..." />;
  if (!isAuthenticated) return <Navigate replace to="/login" />;
  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader label="Loading..." />;
  if (isAuthenticated) return <Navigate replace to="/dashboard" />;
  return <Outlet />;
}

function SuperuserRoute() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  if (isLoading) return <PageLoader label="Checking admin access..." />;
  if (!isAuthenticated) return <Navigate replace to="/login" />;
  if (!user?.is_superuser) return <Navigate replace to="/" />;
  return <Outlet />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader label="Loading page..." />}>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route element={<HomePage />} path="/" />
          <Route element={<BrandPage />} path="/brand" />
          <Route element={<DocsPage />} path="/docs" />
          <Route element={<PricingPage />} path="/pricing" />
        </Route>

        <Route element={<PublicOnlyRoute />}>
          <Route element={<LoginPage />} path="/login" />
          <Route element={<RegisterPage />} path="/register" />
        </Route>

        <Route element={<VerifyEmailPage />} path="/verify-email" />
        <Route element={<ForgotPasswordPage />} path="/forgot-password" />
        <Route element={<ResetPasswordPage />} path="/reset-password" />
        <Route element={<GithubCallbackPage />} path="/auth/github/callback" />
        <Route element={<ComponentsPage />} path="/components" />
        <Route element={<ComponentDetailPage />} path="/components/:slug" />

        <Route element={<ProtectedRoute />}>
          <Route element={<OverviewPage />} path="/dashboard" />
          <Route element={<CollectionsPage />} path="/dashboard/collections" />
          <Route element={<BillingPage />} path="/dashboard/billing" />
          <Route element={<SettingsPage />} path="/dashboard/settings" />
        </Route>

        <Route element={<SuperuserRoute />}>
          <Route element={<AdminOverviewPage />} path="/admin" />
          <Route element={<AdminComponentsPage />} path="/admin/components" />
          <Route element={<ComponentEditorPage />} path="/admin/components/new" />
          <Route element={<ComponentEditorPage />} path="/admin/components/:id/edit" />
          <Route element={<AdminUsersPage />} path="/admin/users" />
          <Route element={<AdminAnalyticsPage />} path="/admin/analytics" />
          <Route element={<AdminSettingsPage />} path="/admin/settings" />
        </Route>
      </Routes>
    </Suspense>
  );
}
