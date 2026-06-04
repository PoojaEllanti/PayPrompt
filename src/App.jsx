import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleBasedRoute from "./components/auth/RoleBasedRoute";

// Layout
import Layout from "./components/layout/Layout";

// Admin Pages
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import DeliveryStaff from "./pages/DeliveryStaff";
import AssignDeliveries from "./pages/AssignDeliveries";
// 📊 Analytics Pages
import CustomerAnalytics from "./pages/CustomerAnalytics";
import DeliveryAnalytics from "./pages/DeliveryAnalytics";

// Customer Pages
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerOrders from "./pages/CustomerOrders";
import Account from "./pages/Account";
import Subscriptions from "./pages/Subscriptions";

// 🚴 DELIVERY STAFF PAGES
import DeliveryDashboard from "./pages/DeliveryDashboard";
import MyDeliveries from "./pages/MyDeliveries";
import DeliveryAccount from "./pages/DeliveryAccount";

// Auth Provider
import { AuthProvider } from "./context/AuthContext";

// 🔔 Real‑time notifications
import RealtimeNotificationListener from "./components/RealtimeNotificationListener";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global realtime notifications */}
        <RealtimeNotificationListener />

        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ================= ADMIN ROUTES ================= */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <RoleBasedRoute role="admin">
                  <Layout>
                    <Dashboard />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <RoleBasedRoute role="admin">
                  <Layout>
                    <Customers />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <RoleBasedRoute role="admin">
                  <Layout>
                    <Orders />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/assign-deliveries"
            element={
              <ProtectedRoute>
                <RoleBasedRoute role="admin">
                  <Layout>
                    <AssignDeliveries />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <RoleBasedRoute role="admin">
                  <Layout>
                    <Inventory />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/delivery-staff"
            element={
              <ProtectedRoute>
                <RoleBasedRoute role="admin">
                  <Layout>
                    <DeliveryStaff />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <RoleBasedRoute role="admin">
                  <Layout>
                    <Analytics />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* ================= CUSTOMER ROUTES ================= */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute>
                <RoleBasedRoute role="customer">
                  <Layout>
                    <CustomerDashboard />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/orders"
            element={
              <ProtectedRoute>
                <RoleBasedRoute role="customer">
                  <Layout>
                    <CustomerOrders />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
  path="/customer/analytics"
  element={
    <ProtectedRoute>
      <RoleBasedRoute role="customer">
        <Layout>
          <CustomerAnalytics />
        </Layout>
      </RoleBasedRoute>
    </ProtectedRoute>
  }
/>


          <Route
            path="/customer/subscriptions"
            element={
              <ProtectedRoute>
                <RoleBasedRoute role="customer">
                  <Layout>
                    <Subscriptions />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/account"
            element={
              <ProtectedRoute>
                <RoleBasedRoute role="customer">
                  <Layout>
                    <Account />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* ================= DELIVERY STAFF ROUTES ================= */}
          <Route
            path="/delivery/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DeliveryDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
  path="/delivery/analytics"
  element={
    <ProtectedRoute>
      <Layout>
        <DeliveryAnalytics />
      </Layout>
    </ProtectedRoute>
  }
/>


          <Route
            path="/delivery/orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyDeliveries />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/delivery/account"
            element={
              <ProtectedRoute>
                <Layout>
                  <DeliveryAccount />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ================= SHARED ROUTES ================= */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
