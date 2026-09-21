import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudents } from '../context/StudentContext';
import { supabase } from '../lib/supabase';
import {
  ShieldAlert,
  Users,
  Search,
  Download,
  Trash2,
  Eye,
  X,
  ChevronUp,
  ChevronDown,
  GraduationCap,
  Home,
  Building,
  RefreshCw,
  Crown,
  User,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Filter,
} from 'lucide-react';

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
    </div>
  </div>
);

// ── Photo Modal ───────────────────────────────────────────────────────────────
const PhotoModal = ({ student, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-w-sm w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
        <div>
          <p className="text-sm font-bold text-slate-900">{student.fullName}</p>
          <p className="text-[11px] text-slate-500">{student.email}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5 flex items-center justify-center bg-slate-100 min-h-[240px]">
        {student.passportPhoto ? (
          <img
            src={student.passportPhoto}
            alt={student.fullName}
            className="max-h-64 max-w-full object-contain rounded-lg shadow"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <User className="w-16 h-16" />
            <span className="text-xs font-medium">No photo uploaded</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
const DeleteModal = ({ student, onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Delete Member</h3>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs text-slate-700 space-y-0.5">
          <p className="font-semibold">{student.fullName}</p>
          <p className="text-slate-500">{student.email}</p>
        </div>
        <p className="text-xs text-slate-600">
          The student record and their passport photo will be permanently deleted from the database.
        </p>
      </div>
      <div className="px-6 pb-5 flex gap-2">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
        >
          {isDeleting ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...</>
          ) : (
            <><Trash2 className="w-3.5 h-3.5" /> Delete</>
          )}
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export const AdminDashboard = () => {
  const { user, isAdmin, adminChecking } = useAuth();
  const { deleteStudent, exportToCSV } = useStudents();

  const [allStudents, setAllStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search / filter
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterHall, setFilterHall] = useState('');
  const [filterResidence, setFilterResidence] = useState('');

  // Sort
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  // Modals
  const [photoStudent, setPhotoStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch all students (admin only) ──────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoadingStudents(true);
    setFetchError('');
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllStudents(
        (data || []).map((row) => ({
          id: row.id,
          fullName: row.full_name || '',
          email: row.email || '',
          phone: row.phone || '',
          programOfStudy: row.program_of_study || '',
          level: row.level || '',
          hallOfAffiliation: row.hall_of_affiliation || '',
          residenceType: row.residence_type || '',
          roomNumber: row.residence_type === 'Hall' ? (row.room_number || '') : '',
          hostelName: row.residence_type === 'Hostel' ? (row.room_number || '') : '',
          passportPhoto: row.passport_photo_url || '',
          role: row.role || 'student',
          createdAt: row.created_at || '',
        }))
      );
    } catch (err) {
      setFetchError('Could not load members. Check your Supabase RLS policy allows admins to read all rows.');
      console.error('Admin fetch error:', err);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin, fetchAll]);

  // ── Derived: unique filter options ───────────────────────────────────────
  const levels = [...new Set(allStudents.map((s) => s.level).filter(Boolean))].sort();
  const halls = [...new Set(allStudents.map((s) => s.hallOfAffiliation).filter(Boolean))].sort();

  // ── Derived: filtered + sorted list ──────────────────────────────────────
  const filtered = allStudents
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.programOfStudy.toLowerCase().includes(q);
      const matchLevel = !filterLevel || s.level === filterLevel;
      const matchHall = !filterHall || s.hallOfAffiliation === filterHall;
      const matchRes = !filterResidence || s.residenceType === filterResidence;
      return matchSearch && matchLevel && matchHall && matchRes;
    })
    .sort((a, b) => {
      let va = a[sortKey] || '';
      let vb = b[sortKey] || '';
      if (sortKey === 'level') {
        va = parseInt(va) || 0;
        vb = parseInt(vb) || 0;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const total = allStudents.length;
  const hallResidents = allStudents.filter((s) => s.residenceType === 'Hall').length;
  const hostelResidents = allStudents.filter((s) => s.residenceType === 'Hostel').length;
  const adminCount = allStudents.filter((s) => s.role === 'admin').length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteStudent(deleteTarget.id);
      setAllStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setSuccessMsg(`${deleteTarget.fullName} has been removed.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFetchError(err.message || 'Failed to delete member.');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const SortIcon = ({ k }) =>
    sortKey === k
      ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />)
      : null;

  // ── Access Denied ─────────────────────────────────────────────────────────
  if (adminChecking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Access Denied</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xs">
            You do not have administrator privileges. Contact your portal admin to request access.
          </p>
        </div>
      </div>
    );
  }

  // ── Admin UI ──────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Toast */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-red-700 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border-b-4 border-amber-500 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">NUTFS UCC Member Management Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 border border-white/15 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Members" value={total} icon={Users} color="bg-slate-100 text-slate-700" />
        <StatCard label="Hall Residents" value={hallResidents} icon={Building} color="bg-blue-50 text-blue-600" />
        <StatCard label="Hostel / Private" value={hostelResidents} icon={Home} color="bg-amber-50 text-amber-600" />
        <StatCard label="Administrators" value={adminCount} icon={Crown} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone or programme..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="pl-7 pr-8 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-slate-900 bg-white appearance-none min-w-[100px]"
            >
              <option value="">All Levels</option>
              {levels.map((l) => <option key={l} value={l}>Level {l}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            <select
              value={filterHall}
              onChange={(e) => setFilterHall(e.target.value)}
              className="pl-7 pr-8 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-slate-900 bg-white appearance-none min-w-[130px]"
            >
              <option value="">All Halls</option>
              {halls.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            <select
              value={filterResidence}
              onChange={(e) => setFilterResidence(e.target.value)}
              className="pl-7 pr-8 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-slate-900 bg-white appearance-none min-w-[120px]"
            >
              <option value="">All Residences</option>
              <option value="Hall">Hall</option>
              <option value="Hostel">Hostel / Private</option>
            </select>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 font-medium">
          Showing {filtered.length} of {total} members
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loadingStudents ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
            <p className="text-xs text-slate-500">Loading members...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
            <Users className="w-10 h-10" />
            <p className="text-sm font-medium">No members match your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Photo</th>
                  <th
                    className="text-left px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:text-slate-900 whitespace-nowrap select-none"
                    onClick={() => handleSort('fullName')}
                  >Name <SortIcon k="fullName" /></th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Contact</th>
                  <th
                    className="text-left px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:text-slate-900 whitespace-nowrap select-none"
                    onClick={() => handleSort('programOfStudy')}
                  >Programme <SortIcon k="programOfStudy" /></th>
                  <th
                    className="text-left px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:text-slate-900 whitespace-nowrap select-none"
                    onClick={() => handleSort('level')}
                  >Level <SortIcon k="level" /></th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Hall</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Residence</th>
                  <th
                    className="text-left px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:text-slate-900 whitespace-nowrap select-none"
                    onClick={() => handleSort('createdAt')}
                  >Joined <SortIcon k="createdAt" /></th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Role</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-9 h-9 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                        {student.passportPhoto ? (
                          <img src={student.passportPhoto} alt={student.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap max-w-[160px] truncate">
                      {student.fullName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 space-y-0.5">
                      <p className="font-mono truncate max-w-[160px]">{student.email}</p>
                      <p className="text-slate-400">{student.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate" title={student.programOfStudy}>
                      {student.programOfStudy}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold">
                        {student.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[140px] truncate" title={student.hallOfAffiliation}>
                      {student.hallOfAffiliation}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center gap-1">
                        {student.residenceType === 'Hall'
                          ? <Building className="w-3 h-3 text-blue-500" />
                          : <Home className="w-3 h-3 text-amber-500" />}
                        <span>
                          {student.residenceType === 'Hall'
                            ? `Room ${student.roomNumber || '—'}`
                            : (student.hostelName || 'Hostel')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {student.createdAt
                        ? new Date(student.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {student.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                          <Crown className="w-2.5 h-2.5" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          <GraduationCap className="w-2.5 h-2.5" /> Student
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPhotoStudent(student)}
                          title="View Photo"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(student)}
                          title="Delete Member"
                          disabled={student.id === user?.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {photoStudent && <PhotoModal student={photoStudent} onClose={() => setPhotoStudent(null)} />}
      {deleteTarget && (
        <DeleteModal
          student={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
