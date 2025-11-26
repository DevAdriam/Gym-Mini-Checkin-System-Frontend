import { Link, Outlet, useLocation } from "react-router-dom";
import { useAdminLogout } from "../lib/hooks/use-admin-auth";

export default function AdminLayout() {
  const location = useLocation();
  const logoutMutation = useAdminLogout();

  const navItems = [
    { path: "/admin/members", label: "Members" },
    { path: "/admin/membership-packages", label: "Packages" },
    { path: "/admin/checkin-logs", label: "Check-in Logs" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link
                to="/admin/members"
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                Gym Admin
              </Link>
              <div className="flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
