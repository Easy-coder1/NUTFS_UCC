import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import { Sidebar } from './components/Sidebar';
import { RegistrationForm } from './components/RegistrationForm';
import { ThankYouView } from './components/ThankYouView';
import { AdminDashboard } from './components/AdminDashboard';

function AppContent() {
  const [activeTab, setActiveTab] = useState('register');
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'register' && (
          <RegistrationForm onSuccess={handleRegistrationSuccess} />
        )}

        {activeTab === 'thankyou' && (
          <ThankYouView
            submittedData={submittedData}
            onReset={handleReset}
          />
        )}

        {activeTab === 'dashboard' && (
          <AdminDashboard onBack={() => setActiveTab('register')} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 py-4 px-6 mt-auto no-print text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto">
        <span>© {new Date().getFullYear()} NUTFS UCC Student Registration Portal • University of Cape Coast</span>
        <button
          type="button"
          onClick={() => {
            setActiveTab(activeTab === 'dashboard' ? 'register' : 'dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-slate-500 hover:text-slate-800 underline text-xs mt-2 sm:mt-0 transition-colors"
        >
          {activeTab === 'dashboard' ? '← Member Registration' : 'Admin Portal Sign In'}
        </button>
      </footer>
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
