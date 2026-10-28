import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { RegisterPage } from './pages/auth/RegisterPage.tsx';
import { StudentDashboard } from './pages/student/StudentDashboard.tsx';
import { SubjectManagementPage } from './pages/student/SubjectManagementPage.tsx';
import { PdfUploadPage } from './pages/student/PdfUploadPage.tsx';
import { AssessmentGeneratePage } from './pages/student/AssessmentGeneratePage.tsx';
import { TestTakingPage } from './pages/student/TestTakingPage.tsx';
import { TestResultPage } from './pages/student/TestResultPage.tsx';
import { ProgressAnalyticsPage } from './pages/student/ProgressAnalyticsPage.tsx';
import { TestHistoryPage } from './pages/student/TestHistoryPage.tsx';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard.tsx';
import { StudentDetailPage } from './pages/faculty/StudentDetailPage.tsx';
import { MeetingManagementPage } from './pages/faculty/MeetingManagementPage.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';

function MainRouter() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navState, setNavState] = useState<any>({});

  const handleNavigate = (tab: string, state?: any) => {
    setCurrentTab(tab);
    if (state) {
      setNavState(state);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If on landing, login, or register page, render full screen without applet sidebar
  if (currentTab === 'landing') {
    return <LandingPage onNavigate={handleNavigate} />;
  }
  if (currentTab === 'login') {
    return <LoginPage onNavigate={handleNavigate} />;
  }
  if (currentTab === 'register') {
    return <RegisterPage onNavigate={handleNavigate} />;
  }

  // If in active test-taking mode, render distraction-free examination view
  if (currentTab === 'test-taking' && navState.attemptId && navState.assessment) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] p-4 sm:p-6 text-slate-900">
        <TestTakingPage
          attemptId={navState.attemptId}
          assessment={navState.assessment}
          onNavigate={handleNavigate}
        />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <StudentDashboard onNavigate={handleNavigate} />;
      case 'subjects':
        return <SubjectManagementPage onNavigate={handleNavigate} />;
      case 'pdf-upload':
        return <PdfUploadPage onNavigate={handleNavigate} initialSubjectId={navState.subjectId} />;
      case 'generate-assessment':
        return (
          <AssessmentGeneratePage
            onNavigate={handleNavigate}
            initialSubjectId={navState.subjectId}
            initialDocumentId={navState.documentId}
          />
        );
      case 'test-results':
        return (
          <TestResultPage
            result={navState.result}
            attemptId={navState.attemptId}
            onNavigate={handleNavigate}
          />
        );
      case 'progress-analytics':
        return <ProgressAnalyticsPage />;
      case 'test-history':
        return <TestHistoryPage onNavigate={handleNavigate} />;
      case 'meetings':
        return <MeetingManagementPage />;

      // Faculty Routes
      case 'faculty-dashboard':
      case 'faculty-students':
      case 'faculty-reports':
        return <FacultyDashboard onNavigate={handleNavigate} />;
      case 'faculty-student-detail':
        return (
          <StudentDetailPage
            studentId={navState.studentId || 'usr-student-alex'}
            onNavigate={handleNavigate}
          />
        );
      case 'faculty-meetings':
        return <MeetingManagementPage />;

      // Admin Routes
      case 'admin-dashboard':
      case 'admin-users':
      case 'admin-subjects':
      case 'admin-settings':
      case 'admin-audit':
        return <AdminDashboard />;

      default:
        return <StudentDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col text-slate-900">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentTab={currentTab}
        onNavigate={handleNavigate}
      />

      <div className="flex flex-1">
        <Sidebar
          currentTab={currentTab}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </ToastProvider>
  );
}
