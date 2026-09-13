import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import { Sidebar } from './components/Sidebar';
import { RegistrationForm } from './components/RegistrationForm';
import { ThankYouView } from './components/ThankYouView';
import { AdminDashboard } from './components/AdminDashboard';
import { Church, Heart, ExternalLink } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'thankyou' | 'dashboard'
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
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row font-sans">
      {/* Navigation Drawer / Top App Bar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen pt-20 md:pt-8">
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

        {/* Professional Footer */}
        <footer className="w-full bg-white border-t border-outline-variant/60 py-6 px-6 md:px-10 mt-auto no-print">
          <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2 font-medium">
              <Church className="w-4 h-4 text-primary" />
              <span>© {new Date().getFullYear()} NUTFS UCC Digital Sanctuary. University of Cape Coast.</span>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={() => setActiveTab('register')} 
                className="hover:text-primary hover:underline transition-colors"
              >
                Registration Form
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className="hover:text-primary hover:underline transition-colors"
              >
                Admin Dashboard
              </button>
              <a 
                href="https://ucc.edu.gh" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-primary hover:underline transition-colors flex items-center gap-1"
              >
                <span>UCC Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
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
