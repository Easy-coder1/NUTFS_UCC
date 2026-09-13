import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import { Sidebar } from './components/Sidebar';
import { RegistrationForm } from './components/RegistrationForm';
import { ThankYouView } from './components/ThankYouView';
import { AdminDashboard } from './components/AdminDashboard';

function AppContent() {
  const [activeTab, setActiveTab] = useState('register');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const handleRegistrationSuccess = (data) => {
    setSubmittedData(data);
    setActiveTab('thankyou');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSubmittedData(null);
    setActiveTab('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDashboard = () => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen pt-16 md:pt-6">
        <main className="flex-1">
          {activeTab === 'register' && (
            <RegistrationForm onSuccess={handleRegistrationSuccess} />
          )}

          {activeTab === 'thankyou' && (
            <ThankYouView
              submittedData={submittedData}
              onReset={handleReset}
              onViewDashboard={handleViewDashboard}
            />
          )}

          {activeTab === 'dashboard' && (
            <AdminDashboard />
          )}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-200/80 py-4 px-6 md:px-10 mt-auto no-print text-center text-xs text-slate-400">
          © {new Date().getFullYear()} NUTFS UCC Student Registration Portal • University of Cape Coast
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StudentProvider>
        <AppContent />
      </StudentProvider>
    </AuthProvider>
  );
}
