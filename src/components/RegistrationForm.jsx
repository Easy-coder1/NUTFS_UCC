import React, { useState, useRef } from 'react';
import { HALLS_OF_AFFILIATION, LEVELS } from '../constants/data';
import { useStudents } from '../context/StudentContext';
import { 
  Upload, 
  Send, 
  AlertCircle, 
  X,
  Loader2,
  ShieldCheck,
  CheckSquare,
  Square,
  Info
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
    hostelName: '',
    passportPhoto: '',
    passportPhotoFile: null
  });

  const [isDeclared, setIsDeclared] = useState(false);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'residenceType') {
        if (value === 'Hostel') {
          updated.roomNumber = '';
        } else if (value === 'Hall') {
          updated.hostelName = '';
        }
      }
      return updated;
    });

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
      newErrors.phone = 'Please enter a valid telephone number.';
    }

    if (!formData.programOfStudy.trim()) {
      newErrors.programOfStudy = 'Program of study is required.';
    }

    if (!formData.level) {
      newErrors.level = 'Please select your academic level.';
    }

    if (!formData.hallOfAffiliation) {
      newErrors.hallOfAffiliation = 'Please select your hall of affiliation.';
    }

    if (formData.residenceType === 'Hall' && !formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required for Hall residents.';
    }

    if (formData.residenceType === 'Hostel' && !formData.hostelName.trim()) {
      newErrors.hostelName = 'Hostel name is required for Hostel residents.';
    }

    if (!isDeclared) {
      newErrors.declaration = 'You must certify the declaration before submitting.';
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
        hostelName: formData.residenceType === 'Hostel' ? formData.hostelName.trim() : '',
        passportPhoto: formData.passportPhoto,
        passportPhotoFile: formData.passportPhotoFile
      });
      onSuccess(created);
    } catch (err) {
      console.error('Registration error:', err);
      setSubmitError(err.message || 'Registration submission failed. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Official Page Banner */}
      <div className="mb-6 bg-slate-900 text-white rounded-t-xl p-6 border-b-4 border-amber-500 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider block">
              National Union of Teshie Fellowship Students
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Official Member Registration Form
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              University of Cape Coast Chapter • Academic Records Department
            </p>
          </div>
          <div className="shrink-0 pt-2 sm:pt-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-white/10 text-slate-200 border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Secure Registration
            </span>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 shadow-sm p-6 sm:p-8 space-y-8">
        {/* Important Notice */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-slate-800 text-xs">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900 block mb-0.5">Notice to All Applicants:</span>
            <span>
              Please ensure all details entered below match your official University of Cape Coast student records. Fields marked with an asterisk (<span className="text-red-600 font-bold">*</span>) are mandatory.
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* SECTION 1: Personal & Academic Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Personal & Academic Profile
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (Surname First) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="e.g. Mensah, Kwame"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    errors.fullName
                      ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                      : 'border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telephone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="e.g. 0541234567"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    errors.phone
                      ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                      : 'border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Program of Study */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Program of Study <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.programOfStudy}
                  onChange={(e) => handleInputChange('programOfStudy', e.target.value)}
                  placeholder="e.g. Bachelor of Science in Computer Science"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    errors.programOfStudy
                      ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                      : 'border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
                  }`}
                />
                {errors.programOfStudy && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.programOfStudy}
                  </p>
                )}
              </div>

              {/* Level of Study */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Academic Level <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {LEVELS.map((lvl) => {
                    const isSelected = formData.level === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleInputChange('level', lvl)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Level {lvl}
                      </button>
                    );
                  })}
                </div>
                {errors.level && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.level}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Residential & Accommodation Data */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Residential & Accommodation Data
              </h2>
            </div>

            <div className="space-y-4">
              {/* Hall of Affiliation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Hall of Affiliation <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.hallOfAffiliation}
                  onChange={(e) => handleInputChange('hallOfAffiliation', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  {HALLS_OF_AFFILIATION.map((hall) => (
                    <option key={hall} value={hall}>
                      {hall}
                    </option>
                  ))}
                </select>
                {errors.hallOfAffiliation && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.hallOfAffiliation}
                  </p>
                )}
              </div>

              {/* Residence Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Residence on Campus <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.residenceType === 'Hall'
                        ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                        : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="residenceType"
                      value="Hall"
                      checked={formData.residenceType === 'Hall'}
                      onChange={() => handleInputChange('residenceType', 'Hall')}
                      className="accent-slate-900"
                    />
                    <span className="text-xs">Hall Resident</span>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.residenceType === 'Hostel'
                        ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                        : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="residenceType"
                      value="Hostel"
                      checked={formData.residenceType === 'Hostel'}
                      onChange={() => handleInputChange('residenceType', 'Hostel')}
                      className="accent-slate-900"
                    />
                    <span className="text-xs">Hostel Resident</span>
                  </label>
                </div>
              </div>

              {/* Room Number (Hall) */}
              {formData.residenceType === 'Hall' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hall Room Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                    placeholder="e.g. Block C, Room 34"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                      errors.roomNumber
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                        : 'border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
                    }`}
                  />
                  {errors.roomNumber && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.roomNumber}
                    </p>
                  )}
                </div>
              )}

              {/* Hostel Name (Hostel) */}
              {formData.residenceType === 'Hostel' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hostel Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.hostelName}
                    onChange={(e) => handleInputChange('hostelName', e.target.value)}
                    placeholder="e.g. Amamoma Hostel, Ayensu Hostel"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                      errors.hostelName
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                        : 'border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
                    }`}
                  />
                  {errors.hostelName && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.hostelName}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: Passport Photograph Upload */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Passport Photograph Upload
              </h2>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/60"
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
                    alt="Passport Photograph"
                    className="w-28 h-28 object-cover rounded-md border-2 border-slate-900 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-slate-900 text-white p-1 rounded-full shadow hover:bg-red-600 transition-colors"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-1.5">
                  <Upload className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-800">Upload Official Passport Photo</p>
                  <p className="text-[11px] text-slate-500">Supported formats: JPG, PNG • Max size: 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: Declaration & Certification */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div 
                className="mt-0.5 shrink-0" 
                onClick={() => {
                  setIsDeclared(!isDeclared);
                  if (errors.declaration) setErrors((prev) => ({ ...prev, declaration: '' }));
                }}
              >
                {isDeclared ? (
                  <CheckSquare className="w-4 h-4 text-slate-900" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                )}
              </div>
              <span className="text-xs text-slate-700 leading-relaxed">
                I hereby declare that all particulars furnished in this registration form are true, complete, and correct to the best of my knowledge and belief.
              </span>
            </label>
            {errors.declaration && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.declaration}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/30 disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Registration...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Official Registration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
