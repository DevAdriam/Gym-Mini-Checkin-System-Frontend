import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { queryClient } from "./lib/query-client";
import AdminLoginPage from "./admins/auth/LoginPage";
import AdminLayout from "./admins/AdminLayout";
import AdminMembersPage from "./admins/members/MembersPage";
import AdminMembershipPackagesPage from "./admins/membership-packages/MembershipPackagesPage";
import AdminCheckInLogsPage from "./admins/checkin-logs/CheckInLogsPage";
import MemberRegisterPage from "./members/register/RegisterPage";
import RegisterSuccessPage from "./members/register/RegisterSuccessPage";
import MemberDashboard from "./members/dashboard/MemberDashboard";
import QRScannerPage from "./qr/QRScannerPage";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="members" element={<AdminMembersPage />} />
            <Route
              path="membership-packages"
              element={<AdminMembershipPackagesPage />}
            />
            <Route path="checkin-logs" element={<AdminCheckInLogsPage />} />
            <Route index element={<Navigate to="/admin/members" replace />} />
          </Route>

          {/* Member Routes */}
          <Route path="/members/register" element={<MemberRegisterPage />} />
          <Route
            path="/members/register/success"
            element={<RegisterSuccessPage />}
          />
          <Route path="/members/dashboard" element={<MemberDashboard />} />

          {/* QR Scanner Route */}
          <Route path="/qr/scanner" element={<QRScannerPage />} />

          {/* Default redirect */}
          <Route
            path="/"
            element={<Navigate to="/members/register" replace />}
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
