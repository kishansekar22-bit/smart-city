import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";
import { Footer } from "./components/Footer";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CitizenDashboard } from "./pages/CitizenDashboard";
import { ReportIssuePage } from "./pages/ReportIssuePage";
import { ComplaintDetailPage } from "./pages/ComplaintDetailPage";
import { CityMapPage } from "./pages/CityMapPage";
import { AlertsPage } from "./pages/AlertsPage";
import { AnnouncementsPage } from "./pages/AnnouncementsPage";
import { ServicesDirectoryPage } from "./pages/ServicesDirectoryPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminComplaintsPage } from "./pages/AdminComplaintsPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { ProfilePage } from "./pages/ProfilePage";

const MainContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>("landing");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Scroll to top on navigation
  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Determine if sidebar should be shown (in authenticated dashboard or admin views)
  const isDashboardView =
    user &&
    [
      "citizen-dashboard",
      "report-issue",
      "my-complaints",
      "admin-dashboard",
      "admin-complaints",
      "profile",
    ].includes(currentPage);

  const renderPage = () => {
    if (currentPage.startsWith("complaint-detail-")) {
      const id = currentPage.replace("complaint-detail-", "");
      return <ComplaintDetailPage complaintId={id} onNavigate={navigate} />;
    }

    switch (currentPage) {
      case "landing":
        return <LandingPage onNavigate={navigate} />;
      case "login":
        return <LoginPage onNavigate={navigate} />;
      case "register":
        return <RegisterPage onNavigate={navigate} />;
      case "citizen-dashboard":
        return <CitizenDashboard onNavigate={navigate} />;
      case "report-issue":
        return <ReportIssuePage onNavigate={navigate} />;
      case "my-complaints":
        return <ProfilePage onNavigate={navigate} />;
      case "city-map":
        return <CityMapPage onNavigate={navigate} />;
      case "alerts":
        return <AlertsPage onNavigate={navigate} />;
      case "announcements":
        return <AnnouncementsPage onNavigate={navigate} />;
      case "services":
        return <ServicesDirectoryPage onNavigate={navigate} />;
      case "feedback":
        return <FeedbackPage onNavigate={navigate} />;
      case "admin-dashboard":
        return <AdminDashboard onNavigate={navigate} />;
      case "admin-complaints":
        return <AdminComplaintsPage onNavigate={navigate} />;
      case "profile":
        return <ProfilePage onNavigate={navigate} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentPage={currentPage}
        onNavigate={navigate}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex">
        {/* Responsive Sidebar for Dashboard / Operations */}
        {isDashboardView && (
          <Sidebar
            currentPage={currentPage}
            onNavigate={navigate}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Page Content Container */}
        <main
          className={`flex-1 transition-all duration-200 ${
            isDashboardView ? "lg:pl-64" : ""
          } px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl mx-auto w-full`}
        >
          {renderPage()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentPage={currentPage} onNavigate={navigate} />

      {/* Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;