import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudents } from '../context/StudentContext';
import { supabase } from '../lib/supabase';
import { HALLS_OF_AFFILIATION, LEVELS } from '../constants/data';
import { 
  User, 
  Printer, 
  LogOut, 
  Loader2, 
  Phone, 
  Mail, 
  Edit,
  CheckCircle2,
  X,
  Camera,
  AlertCircle,
  GraduationCap,
  Building,
  Home,
  ShieldCheck,
  Calendar,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export const StudentProfileCard = () => {
  const { user, signOut } = useAuth();
  const { updateStudent } = useStudents();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal & Form State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    programOfStudy: '',
    level: '100',
    hallOfAffiliation: HALLS_OF_AFFILIATION[0] || 'Casely Hayford Hall',
    residenceType: 'Hall',
    roomNumber: '',
    hostelName: '',
    passportPhoto: '',
    photoPreview: '',
    newPassword: ''
  });
  const [newPhotoFile, setNewPhotoFile] = useState(null);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const cleanEmail = user.email.trim().toLowerCase();

        // 1. Direct ID match (auth.users.id === students.id)
        let { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        // 2. Fallback: match by email for legacy records
        if (!data) {
          const { data: emailData } = await supabase
            .from('students')
            .select('*')
            .ilike('email', cleanEmail)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (emailData) data = emailData;
        }

        // 3. Fallback: match by phone
        if (!data && user.user_metadata?.phone) {
          const { data: phoneData } = await supabase
            .from('students')
            .select('*')
            .eq('phone', user.user_metadata.phone.trim())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (phoneData) data = phoneData;
        }

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

  const handleOpenEdit = () => {
    if (!student) return;
    setEditFormData({
      fullName: student.fullName || '',
      phone: student.phone || '',
      programOfStudy: student.programOfStudy || '',
      level: student.level || '100',
      hallOfAffiliation: student.hallOfAffiliation || HALLS_OF_AFFILIATION[0],
      residenceType: student.residenceType || 'Hall',
      roomNumber: student.roomNumber || '',
      hostelName: student.hostelName || '',
      passportPhoto: student.passportPhoto || '',
      photoPreview: student.passportPhoto || '',
      newPassword: ''
    });
    setNewPhotoFile(null);
    setShowEditPassword(false);
    setEditErrors({});
    setSaveError('');
    setIsEditing(true);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setEditErrors((prev) => ({ ...prev, photo: 'Please upload a valid image file (PNG, JPG).' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setEditErrors((prev) => ({ ...prev, photo: 'Image size must be less than 5MB.' }));
      return;
    }

    setNewPhotoFile(file);
    setEditErrors((prev) => {
      const next = { ...prev };
      delete next.photo;
      return next;
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditFormData((prev) => ({ ...prev, photoPreview: event.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  const validateEditForm = () => {
    const errs = {};
    if (!editFormData.fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!editFormData.phone.trim()) errs.phone = 'Phone number is required.';
    if (!editFormData.programOfStudy.trim()) errs.programOfStudy = 'Program of study is required.';
    if (!editFormData.level) errs.level = 'Level is required.';
    if (!editFormData.hallOfAffiliation) errs.hallOfAffiliation = 'Hall of affiliation is required.';
    
    if (editFormData.residenceType === 'Hall' && !editFormData.roomNumber.trim()) {
      errs.roomNumber = 'Room number is required.';
    }
    if (editFormData.residenceType === 'Hostel' && !editFormData.hostelName.trim()) {
      errs.hostelName = 'Hostel name is required.';
    }
    if (editFormData.newPassword && editFormData.newPassword.trim().length < 6) {
      errs.newPassword = 'New password must be at least 6 characters.';
    }

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaveError('');

    if (!validateEditForm()) return;

    setIsSaving(true);
    try {
      const updated = await updateStudent(
        student.id,
        {
          fullName: editFormData.fullName.trim(),
          phone: editFormData.phone.trim(),
          programOfStudy: editFormData.programOfStudy.trim(),
          level: editFormData.level,
          hallOfAffiliation: editFormData.hallOfAffiliation,
          residenceType: editFormData.residenceType,
          roomNumber: editFormData.residenceType === 'Hall' ? editFormData.roomNumber.trim() : '',
          hostelName: editFormData.residenceType === 'Hostel' ? editFormData.hostelName.trim() : '',
          passportPhoto: editFormData.passportPhoto,
          email: student.email
        },
        newPhotoFile
      );

      // If user provided a new password, update credentials in Supabase Auth
      if (editFormData.newPassword && editFormData.newPassword.trim()) {
        const { error: pwdErr } = await supabase.auth.updateUser({
          password: editFormData.newPassword.trim()
        });
        if (pwdErr) throw pwdErr;
      }

      setStudent((prev) => ({
        ...prev,
        ...updated,
        passportPhoto: updated.passportPhoto || prev.passportPhoto
      }));

      setIsEditing(false);
      setSuccessMessage('Your profile card and credentials have been updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error saving profile changes:', err);
      setSaveError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading your student portal page...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center bg-white rounded-2xl border border-slate-200 my-16 space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">No Student Profile Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <span className="font-semibold text-slate-700">{user?.email}</span>. No student record is currently linked to this email address.
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-2">
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
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-5">
      {/* Toast Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 no-print animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Student Page Welcome Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 border-b-4 border-amber-500 shadow-md flex flex-col gap-4 no-print">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-amber-400/60 overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center relative group shadow-sm">
            {student.passportPhoto ? (
              <img
                src={student.passportPhoto}
                alt={student.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-slate-400" />
            )}
            <button
              type="button"
              onClick={handleOpenEdit}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px]"
              title="Change Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                Active Member
              </span>
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
                NUTFS UCC
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
              {student.fullName}
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              {student.programOfStudy} • Level {student.level}
            </p>
          </div>
        </div>

        {/* Primary Page Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-slate-900 text-xs font-semibold hover:bg-amber-400 transition-colors shadow-xs"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profile & Password</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 border border-white/15 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Print Slip</span>
          </button>

          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-red-400 hover:bg-white/5 text-xs transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Student Page Grid: Digital Card & Information Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* Left / Main: The Official Member Card / Printable Slip */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between no-print px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Official Membership Card
            </h2>
            <button
              type="button"
              onClick={handleOpenEdit}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1"
            >
              <Edit className="w-3 h-3" />
              <span>Quick Edit</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 printable-slip space-y-5 relative">
            {/* Card Header */}
            <div className="border-b border-slate-200 pb-3.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-5 px-1.5 rounded bg-slate-900 text-amber-400 font-bold text-[10px] tracking-wider flex items-center">
                    NUTFS
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    NUTFS UCC Member Slip
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  National Union of True Faith Students • University of Cape Coast Chapter
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Member
              </span>
            </div>

            {/* Member Details Row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-xs relative">
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
                  <h3 className="text-lg font-bold text-slate-900 font-sans">
                    {student.fullName}
                  </h3>
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

            {/* Card Footer Note */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 font-sans">
              <span>Status: Active Fellowship Member</span>
              <span>UCC Chapter</span>
            </div>
          </div>
        </div>

        {/* Right: Detailed Student Breakdown & Account Security */}
        <div className="lg:col-span-5 space-y-4 no-print">
          
          {/* Academic Information Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wide">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span>Academic Details</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Programme:</span>
                <span className="font-semibold text-slate-900 text-right max-w-[65%] truncate">
                  {student.programOfStudy}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Current Level:</span>
                <span className="font-semibold text-slate-900">Level {student.level}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Affiliation:</span>
                <span className="font-semibold text-slate-900 text-right">{student.hallOfAffiliation}</span>
              </div>
            </div>
          </div>

          {/* Accommodation Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wide">
                <Home className="w-4 h-4 text-amber-600" />
                <span>Accommodation</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Residence Type:</span>
                <span className="font-semibold text-slate-900">{student.residenceType} Resident</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">
                  {student.residenceType === 'Hall' ? 'Room Number:' : 'Hostel Name:'}
                </span>
                <span className="font-semibold text-slate-900">
                  {student.residenceType === 'Hall' ? (student.roomNumber || 'Not specified') : (student.hostelName || 'Not specified')}
                </span>
              </div>
            </div>
          </div>

          {/* Account Credentials Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wide">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Account & Sign In</span>
              </div>
              <button
                type="button"
                onClick={handleOpenEdit}
                className="text-[11px] font-semibold text-amber-700 hover:underline"
              >
                Change
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Sign In Email:</span>
                <span className="font-mono text-slate-800 text-[11px]">{student.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Phone Contact:</span>
                <span className="font-mono text-slate-800 text-[11px]">{student.phone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Password:</span>
                <span className="font-mono text-slate-400 text-[11px]">••••••••</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile & Password Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Edit Student Profile & Card
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {saveError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Photo Upload Row */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 flex items-center justify-center relative">
                  {editFormData.photoPreview ? (
                    <img
                      src={editFormData.photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-slate-800">
                    Passport Photo
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload New Photo</span>
                  </button>
                  {editErrors.photo && (
                    <p className="text-[11px] text-red-600">{editErrors.photo}</p>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                  placeholder="e.g. Kwame Mensah"
                />
                {editErrors.fullName && (
                  <p className="text-[11px] text-red-600 mt-1">{editErrors.fullName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                  placeholder="e.g. 0244123456"
                />
                {editErrors.phone && (
                  <p className="text-[11px] text-red-600 mt-1">{editErrors.phone}</p>
                )}
              </div>

              {/* Program of Study */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Program of Study <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.programOfStudy}
                  onChange={(e) => setEditFormData({ ...editFormData, programOfStudy: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                  placeholder="e.g. BSc. Computer Science"
                />
                {editErrors.programOfStudy && (
                  <p className="text-[11px] text-red-600 mt-1">{editErrors.programOfStudy}</p>
                )}
              </div>

              {/* Level & Hall of Affiliation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.level}
                    onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors bg-white"
                  >
                    {LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>Level {lvl}</option>
                    ))}
                  </select>
                  {editErrors.level && (
                    <p className="text-[11px] text-red-600 mt-1">{editErrors.level}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hall of Affiliation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.hallOfAffiliation}
                    onChange={(e) => setEditFormData({ ...editFormData, hallOfAffiliation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors bg-white"
                  >
                    {HALLS_OF_AFFILIATION.map((hall) => (
                      <option key={hall} value={hall}>{hall}</option>
                    ))}
                  </select>
                  {editErrors.hallOfAffiliation && (
                    <p className="text-[11px] text-red-600 mt-1">{editErrors.hallOfAffiliation}</p>
                  )}
                </div>
              </div>

              {/* Residence Type & Room / Hostel */}
              <div className="space-y-2 pt-1 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700">
                  Residential Status
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, residenceType: 'Hall' })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      editFormData.residenceType === 'Hall'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Hall Resident
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, residenceType: 'Hostel' })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      editFormData.residenceType === 'Hostel'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Hostel / Private Resident
                  </button>
                </div>

                {editFormData.residenceType === 'Hall' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Room Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.roomNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, roomNumber: e.target.value })}
                      placeholder="e.g. A12, Room 4"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                    />
                    {editErrors.roomNumber && (
                      <p className="text-[11px] text-red-600 mt-1">{editErrors.roomNumber}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hostel Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.hostelName}
                      onChange={(e) => setEditFormData({ ...editFormData, hostelName: e.target.value })}
                      placeholder="e.g. Kingdom Hostel, Diaspora"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                    />
                    {editErrors.hostelName && (
                      <p className="text-[11px] text-red-600 mt-1">{editErrors.hostelName}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Update Password Option */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Change Password <span className="text-[10px] text-slate-400 font-normal">(Optional — leave blank to keep current)</span>
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editFormData.newPassword || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                    placeholder="Min. 6 characters if updating"
                    autoComplete="new-password"
                    className="w-full pl-3.5 pr-10 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    tabIndex={-1}
                    aria-label={showEditPassword ? "Hide password" : "Show password"}
                  >
                    {showEditPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {editErrors.newPassword && (
                  <p className="text-[11px] text-red-600 mt-1">{editErrors.newPassword}</p>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60 shadow-xs"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
