import React from 'react';
import { 
  CheckCircle2, 
  Printer, 
  UserPlus, 
  LayoutDashboard, 
  Church, 
  Building2, 
  User, 
  Phone, 
  BookOpen 
} from 'lucide-react';

export const ThankYouView = ({ submittedData, onReset, onViewDashboard }) => {
  const handlePrint = () => {
    window.print();
  };

  if (!submittedData) {
    return (
      <div className="w-full max-w-lg mx-auto p-8 text-center bg-white rounded-2xl shadow-card border border-outline-variant my-12">
        <p className="text-on-surface-variant text-sm mb-4">No recent registration record found in current session.</p>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-academic-midnight transition-colors"
        >
          Open Registration Form
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Confirmation Banner */}
      <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-4 no-print shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-emerald-900">
              Registration Successfully Completed!
            </h2>
            <p className="text-xs text-emerald-700">
              Welcome to the NUTFS UCC Fellowship community.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Slip</span>
        </button>
      </div>

      {/* Printable Official Fellowship Card */}
      <div className="bg-white rounded-2xl border border-outline-variant shadow-elevated p-6 md:p-8 accent-gold-top printable-slip space-y-6">
        <div className="border-b border-outline-variant/60 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <Church className="w-5 h-5 text-gold-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-serif text-primary">
                NUTFS UCC Digital Sanctuary
              </h1>
              <p className="text-xs text-outline">
                National Union of Teshie Fellowship Students • UCC
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
            Member Pass
          </span>
        </div>

        {/* Member Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 rounded-xl bg-surface-container-low border border-outline-variant">
          <div className="w-24 h-24 rounded-2xl border-2 border-secondary overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-sm">
            {submittedData.passportPhoto ? (
              <img
                src={submittedData.passportPhoto}
                alt={submittedData.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-outline" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
            <div>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">
                University of Cape Coast
              </span>
              <h2 className="text-xl font-bold font-serif text-primary">
                {submittedData.fullName}
              </h2>
              <p className="text-xs text-on-surface font-medium">
                {submittedData.programOfStudy} • Level {submittedData.level}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant/60 text-xs">
              <div>
                <span className="text-[10px] font-bold text-outline uppercase block">Hall of Affiliation</span>
                <span className="font-semibold text-primary">{submittedData.hallOfAffiliation}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-outline uppercase block">Residence</span>
                <span className="font-semibold text-primary">
                  {submittedData.residenceType === 'Hall'
                    ? `Room ${submittedData.roomNumber}`
                    : 'Hostel Resident'}
                </span>
              </div>
            </div>

            <div className="pt-1 text-xs text-outline font-mono">
              Phone: {submittedData.phone}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-outline text-center">
          May your stay and fellowship at the University of Cape Coast be a blessing.
        </div>
      </div>

      {/* Trailing Actions */}
      <div className="flex flex-wrap justify-between items-center gap-4 no-print pt-2">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-outline-variant text-primary rounded-xl text-xs font-bold hover:bg-surface-container transition-colors shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Another Member</span>
        </button>

        <button
          onClick={onViewDashboard}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-academic-midnight transition-colors shadow-sm"
        >
          <LayoutDashboard className="w-4 h-4 text-gold-300" />
          <span>Go to Admin Dashboard</span>
        </button>
      </div>
    </div>
  );
};
