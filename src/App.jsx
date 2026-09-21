import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import { Sidebar } from './components/Sidebar';
import { RegistrationForm } from './components/RegistrationForm';
import { ThankYouView } from './components/ThankYouView';
import { StudentProfileCard } from './components/StudentProfileCard';
import { LoginModal } from './components/LoginModal';
import { AdminDashboard } from './components/AdminDashboard';

function AppContent() {
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'thankyou' | 'profile' | 'admin' | 'login'
  const [submittedData, setSubmittedData] = useState(null);
  const { user, isAdmin } = useAuth();

  // Redirect to profile after sign in; redirect admins to dashboard
  useEffect(() => {
    if (user && activeTab === 'login') {
      setActiveTab(isAdmin ? 'admin' : 'profile');
    }
  }, [user, isAdmin, activeTab]);

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
            onViewCard={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'profile' && (
          user ? (
            <StudentProfileCard />
          ) : (
            <div className="flex-1 flex items-center justify-center py-12 px-4">
              <LoginModal onClose={() => setActiveTab('register')} />
            </div>
          )
        )}

        {activeTab === 'admin' && (
          user ? (
            <AdminDashboard />
          ) : (
            <div className="flex-1 flex items-center justify-center py-12 px-4">
              <LoginModal onClose={() => setActiveTab('register')} />
            </div>
          )
        )}

        {activeTab === 'login' && !user && (
          <div className="flex-1 flex items-center justify-center py-12 px-4">
            <LoginModal onClose={() => setActiveTab('register')} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 py-4 px-6 mt-auto no-print text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto">
        <span>© {new Date().getFullYear()} NUTFS UCC Student Registration Portal • University of Cape Coast</span>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`hover:text-slate-800 underline transition-colors ${activeTab === 'register' ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}
          >
            Registration
          </button>
          {user ? (
            <button
              type="button"
              onClick={() => {
                setActiveTab('profile');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`hover:text-slate-800 underline transition-colors ${activeTab === 'profile' ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}
            >
              Student Page
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-slate-500 hover:text-slate-800 underline transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
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
