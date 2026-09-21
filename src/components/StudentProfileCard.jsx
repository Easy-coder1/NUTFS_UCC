import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Printer, 
  LogOut, 
  ShieldCheck, 
  ExternalLink, 
  Loader2, 
  Phone, 
  Mail, 
  Home, 
  GraduationCap, 
  FileText 
} from 'lucide-react';

export const StudentProfileCard = ({ onOpenRegistration, onOpenDashboard }) => {
  const { user, isAdmin, signOut } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.warn('Profile fetch note:', error.message);
        }

        if (data) {
          setStudent({
            id: data.id,
            fullName: data.full_name,
            phone: data.phone,
            email: data.email || user.email,
            programOfStudy: data.program_of_study,
            level: data.level,
            hallOfAffiliation: data.hall_of_affiliation,
            residenceType: data.residence_type,
            roomNumber: data.residence_type === 'Hall' ? (data.room_number || '') : '',
            hostelName: data.residence_type === 'Hostel' ? (data.room_number || '') : '',
            passportPhoto: data.passport_photo_url || '',
            createdAt: data.created_at,
          });
        }
      } catch (err) {
        console.error('Error fetching student profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading your membership profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center bg-white rounded-2xl border border-slate-200 my-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">No Member Profile Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <span className="font-semibold text-slate-700">{user?.email}</span>. No student record is currently linked to this email address.
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          {onOpenRegistration && (
            <button
              onClick={onOpenRegistration}
              className="w-full px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Fill Member Registration Form
            </button>
          )}
          {isAdmin && onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="w-full px-4 py-2.5 bg-amber-500 text-slate-900 text-xs font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              Go to Admin Dashboard
            </button>
          )}
          <button
            onClick={signOut}
            className="text-xs text-slate-500 hover:text-slate-800 underline mt-1"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Admin Notice banner if this student is also an admin */}
      {isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You have <strong>Administrator</strong> privileges.</span>
          </div>
          {onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="text-xs font-semibold text-amber-900 underline hover:text-amber-700 shrink-0 flex items-center gap-1"
            >
              <span>Admin Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Profile Card / Printable Slip */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 printable-slip space-y-5">
        {/* Card Header */}
        <div className="border-b border-slate-200 pb-3.5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-5 px-1.5 rounded bg-slate-900 text-amber-400 font-bold text-[10px] tracking-wider flex items-center">
                NUTFS
              </span>
              <h1 className="text-base font-bold text-slate-900">
                NUTFS UCC Member Slip
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              National Union of True Faith Students • University of Cape Coast
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Registered Member
          </span>
        </div>

        {/* Member Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-xs">
            {student.passportPhoto ? (
              <img
                src={student.passportPhoto}
                alt={student.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-slate-300" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2.5 text-center sm:text-left w-full">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-sans">
                {student.fullName}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-0.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white">
                  Level {student.level}
                </span>
                <span className="text-xs text-slate-600 truncate font-medium">
                  {student.programOfStudy}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Hall of Affiliation</span>
                <span className="font-semibold text-slate-800">{student.hallOfAffiliation}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Residence</span>
                <span className="font-semibold text-slate-800">
                  {student.residenceType === 'Hall'
                    ? `Room ${student.roomNumber || 'Assigned'}`
                    : (student.hostelName ? `Hostel: ${student.hostelName}` : 'Hostel Resident')}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-1 font-mono">
              <span className="flex items-center justify-center sm:justify-start gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {student.phone}
              </span>
              <span className="flex items-center justify-center sm:justify-start gap-1 font-sans text-slate-500 text-[11px]">
                <Mail className="w-3 h-3 text-slate-400" />
                {student.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center items-center gap-3 no-print pt-1">
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Slip / Card</span>
        </button>

        {onOpenRegistration && (
          <button
            type="button"
            onClick={onOpenRegistration}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Registration Form</span>
          </button>
        )}

        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 text-slate-600 rounded-lg text-xs font-semibold hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
