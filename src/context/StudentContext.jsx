import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all students from Supabase
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Map snake_case DB columns to camelCase for the frontend
      const mapped = (data || []).map(mapDbToFrontend);
      setStudents(mapped);
    } catch (err) {
      // Anon public users cannot list all students; ignore this expected permission restriction
      console.warn('Student roster fetch restricted for current session:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Upload a passport photo to Supabase Storage and return the public URL
  const uploadPassportPhoto = async (file) => {
    if (!file) return '';

    const fileExt = file.name?.split('.').pop() || 'jpg';
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('passport-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('passport-photos')
      .getPublicUrl(filePath);

    return urlData?.publicUrl || '';
  };

  // Delete a passport photo from Supabase Storage
  const deletePassportPhoto = async (photoUrl) => {
    if (!photoUrl) return;

    try {
      // Extract the file path from the public URL
      // URL format: .../storage/v1/object/public/passport-photos/photos/filename.ext
      const marker = 'passport-photos/';
      const markerIndex = photoUrl.indexOf(marker);
      if (markerIndex === -1) return;

      const filePath = photoUrl.substring(markerIndex + marker.length);
      if (!filePath) return;

      await supabase.storage
        .from('passport-photos')
        .remove([filePath]);
    } catch (err) {
      console.error('Error deleting photo from storage:', err);
    }
  };

  // Add a new student
  const addStudent = async (newStudentData) => {
    setError(null);
    try {
      let photoUrl = '';

      // If a File object is provided, upload it to Storage
      if (newStudentData.passportPhotoFile instanceof File) {
        photoUrl = await uploadPassportPhoto(newStudentData.passportPhotoFile);
      } else if (typeof newStudentData.passportPhoto === 'string' && newStudentData.passportPhoto.startsWith('http')) {
        // Keep external URLs (e.g. demo Unsplash links)
        photoUrl = newStudentData.passportPhoto;
      }

      const row = {
        full_name: newStudentData.fullName,
        phone: newStudentData.phone,
        program_of_study: newStudentData.programOfStudy,
        level: newStudentData.level,
        hall_of_affiliation: newStudentData.hallOfAffiliation,
        residence_type: newStudentData.residenceType,
        room_number: newStudentData.residenceType === 'Hall' ? newStudentData.roomNumber : (newStudentData.hostelName || newStudentData.roomNumber || ''),
        passport_photo_url: photoUrl,
      };

      if (newStudentData.id) {
        row.id = newStudentData.id;
      }

      if (newStudentData.email) {
        row.email = newStudentData.email.trim().toLowerCase();
      }

      // Pure INSERT without requiring SELECT privilege/policy
      let { error: insertError } = await supabase
        .from('students')
        .insert(row);

      // If insert failed because manual id wasn't accepted, retry without id
      if (insertError && row.id) {
        const fallbackRow = { ...row };
        delete fallbackRow.id;
        const retryWithGeneratedId = await supabase.from('students').insert(fallbackRow);
        if (!retryWithGeneratedId.error) {
          insertError = null;
        }
      }

      // If database doesn't have the 'email' column yet, fallback gracefully
      if (insertError && insertError.message && insertError.message.toLowerCase().includes('email')) {
        delete row.email;
        const retryResult = await supabase.from('students').insert(row);
        insertError = retryResult.error;
      }

      if (insertError) throw insertError;

      const created = {
        id: newStudentData.id || crypto.randomUUID(),
        fullName: newStudentData.fullName,
        email: newStudentData.email || '',
        phone: newStudentData.phone,
        programOfStudy: newStudentData.programOfStudy,
        level: newStudentData.level,
        hallOfAffiliation: newStudentData.hallOfAffiliation,
        residenceType: newStudentData.residenceType,
        roomNumber: newStudentData.residenceType === 'Hall' ? newStudentData.roomNumber : '',
        hostelName: newStudentData.residenceType === 'Hostel' ? (newStudentData.hostelName || newStudentData.roomNumber || '') : '',
        passportPhoto: photoUrl || newStudentData.passportPhoto || '',
        createdAt: new Date().toISOString(),
      };

      setStudents((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('Error adding student:', err);
      setError(err.message);
      throw err;
    }
  };

  // Delete a student
  const deleteStudent = async (id) => {
    setError(null);
    try {
      // Find the student to get their photo URL for cleanup
      const student = students.find((s) => s.id === id);

      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Clean up the photo from Storage
      if (student?.passportPhoto) {
        await deletePassportPhoto(student.passportPhoto);
      }

      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error deleting student:', err);
      setError(err.message);
      throw err;
    }
  };

  // Export to CSV (operates on the in-memory students array)
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Full Name',
      'Phone Number',
      'Program of Study',
      'Level',
      'Hall of Affiliation',
      'Residence Type',
      'Room Number',
      'Registered Date'
    ];

    const rows = students.map((s) => [
      `"${s.id}"`,
      `"${s.fullName}"`,
      `"${s.phone}"`,
      `"${s.programOfStudy}"`,
      `"${s.level}"`,
      `"${s.hallOfAffiliation}"`,
      `"${s.residenceType}"`,
      `"${s.roomNumber || 'N/A'}"`,
      `"${s.createdAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NUTFS_UCC_Members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update an existing student
  const updateStudent = async (id, updatedFields, newPhotoFile = null) => {
    setError(null);
    try {
      let photoUrl = updatedFields.passportPhoto || '';

      // If a new File object is provided, upload it to Storage
      if (newPhotoFile instanceof File) {
        photoUrl = await uploadPassportPhoto(newPhotoFile);
      }

      const row = {
        full_name: updatedFields.fullName,
        phone: updatedFields.phone,
        program_of_study: updatedFields.programOfStudy,
        level: updatedFields.level,
        hall_of_affiliation: updatedFields.hallOfAffiliation,
        residence_type: updatedFields.residenceType,
        room_number: updatedFields.residenceType === 'Hall' 
          ? (updatedFields.roomNumber || '') 
          : (updatedFields.hostelName || updatedFields.roomNumber || ''),
      };

      if (photoUrl) {
        row.passport_photo_url = photoUrl;
      }

      const cleanEmail = (updatedFields.email || '').trim().toLowerCase();
      if (cleanEmail) {
        row.email = cleanEmail;
      }

      let updateError = null;

      // Try updating by id first if valid
      if (id) {
        const res = await supabase
          .from('students')
          .update(row)
          .eq('id', id);
        updateError = res.error;
      }

      // If id update failed or id wasn't present, match by email
      if ((!id || updateError) && cleanEmail) {
        const retryByEmail = await supabase
          .from('students')
          .update(row)
          .ilike('email', cleanEmail);
        updateError = retryByEmail.error;
      }

      if (updateError && updateError.message && updateError.message.toLowerCase().includes('email')) {
        delete row.email;
        if (id) {
          const retryResult = await supabase.from('students').update(row).eq('id', id);
          updateError = retryResult.error;
        } else if (cleanEmail) {
          const retryResult = await supabase.from('students').update(row).ilike('email', cleanEmail);
          updateError = retryResult.error;
        }
      }

      if (updateError) throw updateError;

      const updated = {
        ...updatedFields,
        id,
        passportPhoto: photoUrl || updatedFields.passportPhoto || '',
      };

      setStudents((prev) => prev.map((s) => (s.id === id || (cleanEmail && s.email?.toLowerCase() === cleanEmail)) ? { ...s, ...updated } : s));
      return updated;
    } catch (err) {
      console.error('Error updating student:', err);
      setError(err.message);
      throw err;
    }
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        loading,
        error,
        addStudent,
        updateStudent,
        uploadPassportPhoto,
        deleteStudent,
        exportToCSV,
        refetch: fetchStudents
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
};

// Helper: map Supabase snake_case row to camelCase frontend object
function mapDbToFrontend(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email || '',
    phone: row.phone,
    programOfStudy: row.program_of_study,
    level: row.level,
    hallOfAffiliation: row.hall_of_affiliation,
    residenceType: row.residence_type,
    roomNumber: row.residence_type === 'Hall' ? (row.room_number || '') : '',
    hostelName: row.residence_type === 'Hostel' ? (row.room_number || '') : '',
    passportPhoto: row.passport_photo_url || '',
    createdAt: row.created_at,
  };
}
