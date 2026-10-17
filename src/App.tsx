import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { NotificationModal } from './components/NotificationModal';
import { LoginView } from './components/LoginView';

// Pages
import { DashboardView } from './pages/DashboardView';
import { ClassesView } from './pages/ClassesView';
import { MaterialsView } from './pages/MaterialsView';
import { AssignmentsView } from './pages/AssignmentsView';
import { PeerAssessmentView } from './pages/PeerAssessmentView';
import { FormativeAssessmentView } from './pages/FormativeAssessmentView';
import { ReflectionsView } from './pages/ReflectionsView';
import { LeaveRequestsView } from './pages/LeaveRequestsView';
import { ReportsView } from './pages/ReportsView';
import { SettingsView } from './pages/SettingsView';

const TAB_TITLES: Record<NavTab, string> = {
  dashboard: 'Dashboard',
  classes: 'Kelas Saya',
  materials: 'Materi Pembelajaran',
  assignments: 'Tugas & Pengumpulan',
  peer_assessments: 'Asesmen Praktik Antarteman',
  formative: 'Asesmen Formatif',
  reflections: 'Refleksi Pembelajaran',
  leave_requests: 'Surat Izin Murid',
  reports: 'Nilai dan Laporan',
  settings: 'Pengaturan & Integrasi Sheets'
};

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'classes':
        return <ClassesView />;
      case 'materials':
        return <MaterialsView />;
      case 'assignments':
        return <AssignmentsView />;
      case 'peer_assessments':
        return <PeerAssessmentView />;
      case 'formative':
        return <FormativeAssessmentView />;
      case 'reflections':
        return <ReflectionsView />;
      case 'leave_requests':
        return <LeaveRequestsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView onOpenSheetsModal={() => setShowSheetsModal(true)} />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <Header
        activeTabTitle={TAB_TITLES[activeTab]}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenSheetsConfig={() => setShowSheetsModal(true)}
        onOpenNotifications={() => setShowNotificationsModal(true)}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex w-full">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Google Sheets Modal */}
      <GoogleSheetsModal
        isOpen={showSheetsModal}
        onClose={() => setShowSheetsModal(false)}
      />

      {/* Notifications Drawer/Modal */}
      <NotificationModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainLayout />
      </DataProvider>
    </AuthProvider>
  );
}
