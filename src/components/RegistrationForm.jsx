import React, { useState, useRef } from 'react';

import { HALLS_OF_AFFILIATION, LEVELS } from '../constants/data';
import { useStudents } from '../context/StudentContext';
import { 
  User, 
  Phone, 
  BookOpen, 
  GraduationCap, 
  Home, 
  Camera, 
  Upload, 
  Send, 
  AlertCircle, 
  CheckCircle2,
  X,
  Sparkles,
  Church,
  ShieldCheck,
  Building2,
  IdCard
} from 'lucide-react';

export const RegistrationForm = ({ onSuccess }) => {
  const { addStudent } = useStudents();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    programOfStudy: '',
    level: '100',
    hallOfAffiliation: HALLS_OF_AFFILIATION[0],
    residenceType: 'Hall', // 'Hall' | 'Hostel'
    roomNumber: '',
    passportPhoto: '',
    passportPhotoFile: null // Raw File object for Supabase Storage upload
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Reactive state logic: if residenceType is changed to Hostel, clear roomNumber
      if (field === 'residenceType' && value === 'Hostel') {
        updated.roomNumber = '';
      }
      return updated;
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, passportPhoto: 'File size must be under 5MB.' }));
        return;
      }
      // Use object URL for instant preview; store raw File for Supabase upload
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      setFormData((prev) => ({ ...prev, passportPhoto: previewUrl, passportPhotoFile: file }));
      setErrors((prev) => ({ ...prev, passportPhoto: '' }));
    }
  };

  const removePhoto = (e) => {
    e.stopPropagation();
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview('');
    setFormData((prev) => ({ ...prev, passportPhoto: '', passportPhotoFile: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[\d\s+\-()]{9,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (e.g. 0541234567).';
    }

    if (!formData.programOfStudy.trim()) {
      newErrors.programOfStudy = 'Program of study is required.';
    }

    if (!formData.level) {
      newErrors.level = 'Please select your level.';
    }

    if (!formData.hallOfAffiliation) {
      newErrors.hallOfAffiliation = 'Please select your hall of affiliation.';
    }

    if (formData.residenceType === 'Hall' && !formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required when residing in a Hall.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const created = await addStudent({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        programOfStudy: formData.programOfStudy.trim(),
        level: formData.level,
        hallOfAffiliation: formData.hallOfAffiliation,
        residenceType: formData.residenceType,
        roomNumber: formData.residenceType === 'Hall' ? formData.roomNumber.trim() : '',
        passportPhoto: formData.passportPhoto,
        passportPhotoFile: formData.passportPhotoFile
      });
      onSuccess(created);
    } catch (err) {
      console.error('Registration error:', err);
      setSubmitError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper to demonstrate the registration seamlessly to professors
  const handleQuickDemoFill = () => {
    const demoStudent = {
      fullName: "Kwame Asante Mensah",
      phone: "0548923451",
      programOfStudy: "BSc. Computer Science",
      level: "300",
      hallOfAffiliation: "Casely Hayford Hall",
      residenceType: "Hall",
      roomNumber: "C34",
      passportPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      passportPhotoFile: null
    };
    setFormData(demoStudent);
    setPhotoPreview(demoStudent.passportPhoto);
    setErrors({});
    setSubmitError('');
  };

  return (
    <div className="w-full max-w-container-max mx-auto px-4 md:px-8 pb-16">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
              Member Registration
            </span>
            <span className="text-xs text-on-surface-variant">
              University of Cape Coast Chapter
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-primary tracking-tight">
            Student Registration Form
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant mt-1">
            Join the NUTFS UCC Digital Sanctuary fellowship community.
          </p>
        </div>

        {/* Demo Fill Trigger */}
        <button
          type="button"
          onClick={handleQuickDemoFill}
          className="flex items-center gap-2 px-3.5 py-2 bg-secondary/15 text-primary border border-secondary/30 rounded-lg text-xs font-bold hover:bg-secondary hover:text-white transition-all shadow-xs"
          title="Auto-fill sample student data for demonstration"
        >
          <Sparkles className="w-4 h-4 text-secondary" />
          <span>Demo Auto-Fill</span>
        </button>
      </div>

      {/* Main Grid: Form (Left) + Live Fellowship Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-outline-variant/80 shadow-card p-6 md:p-8 accent-gold-top">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Section 1: Personal & Academic Info */}
            <div className="space-y-4">
              <div className="border-b border-outline-variant/60 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <User className="w-4 h-4 text-secondary" />
                  Personal & Academic Information
                </h2>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Full Name <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="e.g. Kwame Mensah"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all ${
                      errors.fullName
                        ? 'border-error ring-1 ring-error bg-red-50/20'
                        : 'border-outline-variant bg-surface hover:border-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/10'
                    }`}
                  />
                  <User className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Phone Number <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g. 0541234567"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all ${
                      errors.phone
                        ? 'border-error ring-1 ring-error bg-red-50/20'
                        : 'border-outline-variant bg-surface hover:border-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/10'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {errors.phone && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Program of Study */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Program of Study <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.programOfStudy}
                    onChange={(e) => handleInputChange('programOfStudy', e.target.value)}
                    placeholder="e.g. BSc. Computer Science, BCom. Accounting"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all ${
                      errors.programOfStudy
                        ? 'border-error ring-1 ring-error bg-red-50/20'
                        : 'border-outline-variant bg-surface hover:border-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/10'
                    }`}
                  />
                  <BookOpen className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {errors.programOfStudy && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.programOfStudy}
                  </p>
                )}
              </div>

              {/* Level of Study */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Level of Study <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {LEVELS.map((lvl) => {
                    const isSelected = formData.level === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleInputChange('level', lvl)}
                        className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20'
                            : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
                {errors.level && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.level}
                  </p>
                )}
              </div>
            </div>

            {/* Section 2: Residential Details */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-outline-variant/60 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Home className="w-4 h-4 text-secondary" />
                  Residential Details
                </h2>
              </div>

              {/* Hall of Affiliation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Hall of Affiliation <span className="text-error">*</span>
                </label>
                <select
                  value={formData.hallOfAffiliation}
                  onChange={(e) => handleInputChange('hallOfAffiliation', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  {HALLS_OF_AFFILIATION.map((hall) => (
                    <option key={hall} value={hall}>
                      {hall}
                    </option>
                  ))}
                </select>
                {errors.hallOfAffiliation && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.hallOfAffiliation}
                  </p>
                )}
              </div>

              {/* Residence Type Radio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Residence Type <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.residenceType === 'Hall'
                        ? 'bg-primary/5 border-primary ring-1 ring-primary'
                        : 'bg-surface border-outline-variant hover:bg-surface-container'
                    }`}
                  >
                    <input
                      type="radio"
                      name="residenceType"
                      value="Hall"
                      checked={formData.residenceType === 'Hall'}
                      onChange={() => handleInputChange('residenceType', 'Hall')}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="text-sm font-bold text-primary">Hall Resident</p>
                      <p className="text-xs text-outline">Residing in campus hall</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.residenceType === 'Hostel'
                        ? 'bg-primary/5 border-primary ring-1 ring-primary'
                        : 'bg-surface border-outline-variant hover:bg-surface-container'
                    }`}
                  >
                    <input
                      type="radio"
                      name="residenceType"
                      value="Hostel"
                      checked={formData.residenceType === 'Hostel'}
                      onChange={() => handleInputChange('residenceType', 'Hostel')}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="text-sm font-bold text-primary">Hostel</p>
                      <p className="text-xs text-outline">Off-campus residence</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Room Number (Conditioned on Hall) */}
              {formData.residenceType === 'Hall' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Room Number <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                    placeholder="e.g. C34, A12, Room 4"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                      errors.roomNumber
                        ? 'border-error ring-1 ring-error bg-red-50/20'
                        : 'border-outline-variant bg-surface hover:border-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/10'
                    }`}
                  />
                  {errors.roomNumber && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.roomNumber}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Section 3: Passport Photo */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-outline-variant/60 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Camera className="w-4 h-4 text-secondary" />
                  Passport Photo
                </h2>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-outline-variant hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface-container-low"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                {photoPreview ? (
                  <div className="relative group">
                    <img
                      src={photoPreview}
                      alt="Student Preview"
                      className="w-28 h-28 object-cover rounded-xl border-2 border-secondary shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 bg-error text-white p-1 rounded-full shadow hover:scale-110 transition-transform"
                      title="Remove Photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">Click to upload passport photo</p>
                      <p className="text-[11px] text-outline">JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs font-medium">{submitError}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-outline-variant/60">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-primary text-white rounded-xl text-sm font-bold hover:bg-academic-midnight transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering...' : 'Register Member'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Fellowship Member Card (Right Column) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="bg-white rounded-2xl border border-outline-variant/80 shadow-card p-6 overflow-hidden accent-gold-top">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                  <Church className="w-4 h-4 text-gold-300" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                    Fellowship Pass
                  </h3>
                  <p className="text-[10px] text-outline">Live Member Card Preview</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                NUTFS UCC
              </span>
            </div>

            {/* Card Content */}
            <div className="mt-5 p-5 rounded-xl bg-surface-container-low border border-outline-variant space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl border-2 border-secondary overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-sm">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Member Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-outline" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">
                    University of Cape Coast
                  </span>
                  <h4 className="text-base font-bold font-serif text-primary truncate">
                    {formData.fullName || 'Student Full Name'}
                  </h4>
                  <p className="text-xs text-on-surface font-medium truncate">
                    {formData.programOfStudy || 'Programme of Study'}
                  </p>
                  <p className="text-[11px] text-outline">
                    Level {formData.level} • {formData.phone || 'Phone Number'}
                  </p>
                </div>
              </div>

              {/* Hall Details */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-outline-variant text-xs">
                <div>
                  <span className="text-outline uppercase text-[10px] font-bold block">Hall</span>
                  <span className="font-semibold text-primary">{formData.hallOfAffiliation}</span>
                </div>
                <div>
                  <span className="text-outline uppercase text-[10px] font-bold block">Residence</span>
                  <span className="font-semibold text-primary">
                    {formData.residenceType === 'Hall'
                      ? `Room ${formData.roomNumber || '—'}`
                      : 'Hostel Resident'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-outline mt-3 text-center">
              The digital pass updates in real-time as registration fields are completed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
