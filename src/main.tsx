import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CreditRemoversCheckout from "./pages/CreditRemoversCheckout";
import CustomerAccount from "./pages/CustomerAccount";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import { AdminAuthProvider } from "./hooks/useAdmin";
import AdminLayout from "./components/admin/AdminLayout";
import DashboardHome from "./components/admin/DashboardHome";
import ContactSubmissions from "./components/admin/ContactSubmissions";
import CheckoutSubmissions from "./components/admin/CheckoutSubmissions";
import EmailTemplates from "./components/admin/EmailTemplates";
import SettingsPage from "./components/admin/SettingsPage";
import SiteSettings from "./components/admin/SiteSettings";
import ContentManager from "./components/admin/ContentManager";
import AccountSettings from "./components/admin/AccountSettings";
import NewsManager from "./components/admin/NewsManager";
import AuditLogs from "./components/admin/AuditLogs";
import CustomersList from "./components/admin/CustomersList";
import CustomerDetail from "./components/admin/CustomerDetail";
import "./index.css";

function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthProvider>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/checkout", element: <CreditRemoversCheckout /> },
  { path: "/account", element: <CustomerAccount /> },
  { path: "/news", element: <News /> },
  { path: "/news/:slug", element: <NewsArticle /> },

  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms-of-service", element: <TermsOfService /> },

  { path: "/admin", element: <AdminPage><DashboardHome /></AdminPage> },
  { path: "/admin/contacts", element: <AdminPage><ContactSubmissions /></AdminPage> },
  { path: "/admin/checkouts", element: <AdminPage><CheckoutSubmissions /></AdminPage> },
  { path: "/admin/customers", element: <AdminPage><CustomersList /></AdminPage> },
  { path: "/admin/customers/:id", element: <AdminPage><CustomerDetail /></AdminPage> },
  { path: "/admin/news", element: <AdminPage><NewsManager /></AdminPage> },
  { path: "/admin/audit", element: <AdminPage><AuditLogs /></AdminPage> },
  { path: "/admin/emails", element: <AdminPage><EmailTemplates /></AdminPage> },
  { path: "/admin/settings", element: <AdminPage><SettingsPage /></AdminPage> },
  { path: "/admin/site", element: <AdminPage><SiteSettings /></AdminPage> },
  { path: "/admin/content", element: <AdminPage><ContentManager /></AdminPage> },
  { path: "/admin/account", element: <AdminPage><AccountSettings /></AdminPage> },
]);

createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
