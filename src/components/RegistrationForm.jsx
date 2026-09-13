import React, { useState, useRef } from 'react';
import { HALLS_OF_AFFILIATION, LEVELS } from '../constants/data';
import { useStudents } from '../context/StudentContext';
import { 
  Upload, 
  Send, 
  AlertCircle, 
  X,
  Loader2
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
    passportPhotoFile: null
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'residenceType' && value === 'Hostel') {
        updated.roomNumber = '';
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
      newErrors.phone = 'Please enter a valid phone number.';
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

  return (
    <div className="w-full max-w-2xl mx-auto px-4 md:px-6 pb-16 pt-4">
      {/* Header */}
      <div className="mb-8 border-b border-slate-200 pb-5 text-center">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
          NUTFS UCC Member Registration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete the form below to register with the NUTFS UCC fellowship community.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 md:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Section 1: Personal & Academic Info */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900 pb-2 border-b border-slate-100">
              Personal & Academic Details
            </h2>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="e.g. Kwame Mensah"
                className={`w-full px-3.5 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                  errors.fullName
                    ? 'border-red-500 bg-red-50/30 focus:border-red-500'
                    : 'border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary'
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="e.g. 0541234567"
                className={`w-full px-3.5 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                  errors.phone
                    ? 'border-red-500 bg-red-50/30 focus:border-red-500'
                    : 'border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary'
                }`}
              />
              {errors.phone && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                </p>
              )}
            </div>

            {/* Program of Study */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Program of Study <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.programOfStudy}
                onChange={(e) => handleInputChange('programOfStudy', e.target.value)}
                placeholder="e.g. BSc. Computer Science"
                className={`w-full px-3.5 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                  errors.programOfStudy
                    ? 'border-red-500 bg-red-50/30 focus:border-red-500'
                    : 'border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary'
                }`}
              />
              {errors.programOfStudy && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.programOfStudy}
                </p>
              )}
            </div>

            {/* Level of Study */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Level of Study <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {LEVELS.map((lvl) => {
                  const isSelected = formData.level === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleInputChange('level', lvl)}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
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

          {/* Section 2: Residential Details */}
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-semibold text-slate-900 pb-2 border-b border-slate-100">
              Residential Information
            </h2>

            {/* Hall of Affiliation */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Hall of Affiliation <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.hallOfAffiliation}
                onChange={(e) => handleInputChange('hallOfAffiliation', e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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

            {/* Residence Type Radio */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Residence Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.residenceType === 'Hall'
                      ? 'bg-slate-50 border-slate-900 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
                  <div>
                    <p className="text-xs font-medium">Hall Resident</p>
                    <p className="text-[11px] text-slate-400">On campus hall</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.residenceType === 'Hostel'
                      ? 'bg-slate-50 border-slate-900 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
                  <div>
                    <p className="text-xs font-medium">Hostel</p>
                    <p className="text-[11px] text-slate-400">Off campus hostel</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Room Number */}
            {formData.residenceType === 'Hall' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Room Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                  placeholder="e.g. C34"
                  className={`w-full px-3.5 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    errors.roomNumber
                      ? 'border-red-500 bg-red-50/30 focus:border-red-500'
                      : 'border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary'
                  }`}
                />
                {errors.roomNumber && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.roomNumber}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Passport Photo */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-semibold text-slate-900 pb-2 border-b border-slate-100">
              Passport Photo
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50"
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
                    className="w-24 h-24 object-cover rounded-lg border border-slate-300 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-slate-800 text-white p-1 rounded-full shadow hover:bg-slate-900 transition-colors"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-medium text-slate-700">Click to upload photo</p>
                  <p className="text-[11px] text-slate-400">JPG or PNG up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Registration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
