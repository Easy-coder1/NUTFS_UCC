import React from 'react';
import { 
  CheckCircle2, 
  User,
  Printer
} from 'lucide-react';

export const ThankYouView = ({ submittedData, onReset, onViewCard }) => {
  if (!submittedData) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center bg-white rounded-xl border border-slate-200 my-12">
        <p className="text-slate-600 text-sm mb-4">No recent registration record found.</p>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          Open Registration Form
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Confirmation Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h2 className="text-sm font-semibold text-emerald-900">
              Registration Complete
            </h2>
            <p className="text-xs text-emerald-700">
              Thank you for registering with NUTFS UCC.
            </p>
          </div>
        </div>
      </div>

      {/* Printable Slip Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-7 printable-slip space-y-5">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-900">
              NUTFS UCC Member Slip
            </h1>
            <p className="text-xs text-slate-500">
              National Union of True Faith Students • UCC Chapter
            </p>
          </div>
        </div>

        {/* Member Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="w-20 h-20 rounded-lg border border-slate-200 overflow-hidden bg-white shrink-0 flex items-center justify-center">
            {submittedData.passportPhoto ? (
              <img
                src={submittedData.passportPhoto}
                alt={submittedData.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-slate-300" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {submittedData.fullName}
              </h2>
              <p className="text-xs text-slate-600">
                {submittedData.programOfStudy} • Level {submittedData.level}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Hall of Affiliation</span>
                <span className="font-medium text-slate-800">{submittedData.hallOfAffiliation}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Residence</span>
                <span className="font-medium text-slate-800">
                  {submittedData.residenceType === 'Hall'
                    ? `Room ${submittedData.roomNumber}`
                    : (submittedData.hostelName ? `Hostel: ${submittedData.hostelName}` : 'Hostel Resident')}
                </span>
              </div>
            </div>

            <div className="pt-1 text-xs text-slate-500 font-mono">
              Phone: {submittedData.phone}
            </div>
          </div>
        </div>
      </div>

      {/* Trailing Actions */}
      <div className="flex flex-wrap justify-center items-center gap-3 no-print">
        {onViewCard && (
          <button
            type="button"
            onClick={onViewCard}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 text-slate-900 rounded-lg text-xs font-semibold hover:bg-amber-400 transition-colors shadow-xs"
          >
            <User className="w-3.5 h-3.5" />
            <span>Go to My Student Page</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Slip / Card</span>
        </button>
      </div>
    </div>
  );
};
