import React, { useState, useMemo } from 'react';
import { useStudents } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';
import { HALLS_OF_AFFILIATION, LEVELS } from '../constants/data';
import { 
  Users, 
  Building2, 
  Phone, 
  BookOpen, 
  Home, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  ChevronDown, 
  ChevronUp,
  LayoutGrid,
  List,
  GraduationCap,
  Sparkles,
  Church,
  ShieldCheck,
  LogOut,
  Loader2
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { students, loading: studentsLoading, refetch, exportToCSV } = useStudents();
  const [selectedLevel, setSelectedLevel] = useState('All'); // 'All' | '100' | '200' | '300' | '400' | '500' | '600'
  const [selectedHall, setSelectedHall] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [collapsedHalls, setCollapsedHalls] = useState({});

  const toggleHallCollapse = (hall) => {
    setCollapsedHalls((prev) => ({
      ...prev,
      [hall]: !prev[hall]
    }));
  };

  // Filter students based on level, hall, and search query
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesLevel = selectedLevel === 'All' ? true : student.level === selectedLevel;
      const matchesHall = selectedHall === 'All' ? true : student.hallOfAffiliation === selectedHall;
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        student.fullName.toLowerCase().includes(q) ||
        student.programOfStudy.toLowerCase().includes(q) ||
        student.hallOfAffiliation.toLowerCase().includes(q) ||
        student.phone.includes(q);

      return matchesLevel && matchesHall && matchesSearch;
    });
  }, [students, selectedLevel, selectedHall, searchQuery]);

  // Group filtered students into the 8 official UCC Halls
  const hallGroupedData = useMemo(() => {
    const grouped = {};
    HALLS_OF_AFFILIATION.forEach((hall) => {
      grouped[hall] = [];
    });

    filteredStudents.forEach((student) => {
      if (grouped[student.hallOfAffiliation]) {
        grouped[student.hallOfAffiliation].push(student);
      } else {
        if (!grouped['Other']) grouped['Other'] = [];
        grouped['Other'].push(student);
      }
    });

    return grouped;
  }, [filteredStudents]);

  // Level counts for quick filter pills
  const levelCounts = useMemo(() => {
    const counts = { All: students.length };
    LEVELS.forEach((lvl) => {
      counts[lvl] = students.filter((s) => s.level === lvl).length;
    });
    return counts;
  }, [students]);

  // General Metrics
  const hallResidentsCount = students.filter((s) => s.residenceType === 'Hall').length;
  const hostelResidentsCount = students.filter((s) => s.residenceType === 'Hostel').length;

  // If still checking auth, show nothing
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // If not authenticated, show login modal
  if (!user) {
    return (
      <div className="flex-1 w-full max-w-container-max mx-auto px-4 md:px-8 pb-16">
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold font-serif text-primary">Admin Access Required</h2>
            <p className="text-sm text-on-surface-variant max-w-md">
              Sign in with your admin credentials to access the fellowship dashboard and manage member registrations.
            </p>
          </div>
          <LoginModal />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-container-max mx-auto px-4 md:px-8 pb-16">
      {/* Header Metric Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-outline-variant/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
              Fellowship Administration
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              University of Cape Coast Chapter
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-primary tracking-tight">
            NUTFS UCC Admin Dashboard
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant mt-1">
            Manage fellowship member registrations across all 8 Halls of Affiliation and academic levels.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-outline-variant text-primary rounded-xl text-xs font-bold hover:bg-surface-container transition-colors shadow-sm"
            title="Download CSV export"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Members (CSV)</span>
          </button>

          <button
            onClick={() => refetch()}
            className="p-2.5 bg-white border border-outline-variant text-outline rounded-xl hover:text-primary hover:border-primary/40 transition-colors shadow-sm"
            title="Refresh member data"
          >
            <RefreshCw className={`w-4 h-4 ${studentsLoading ? 'animate-spin text-primary' : ''}`} />
          </button>

          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-outline-variant text-on-surface-variant rounded-xl text-xs font-bold hover:text-error hover:border-error/40 transition-colors shadow-sm"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Total Members */}
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/80 shadow-soft flex items-center gap-4 accent-gold-top">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
            <Users className="w-6 h-6 text-gold-300" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-outline uppercase tracking-wider">Total Members</p>
            <p className="text-2xl font-bold font-serif text-primary">{students.length}</p>
          </div>
        </div>

        {/* Hall Residents */}
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/80 shadow-soft flex items-center gap-4 accent-gold-top">
          <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary border border-secondary/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-outline uppercase tracking-wider">Hall Residents</p>
            <p className="text-2xl font-bold font-serif text-primary">{hallResidentsCount}</p>
          </div>
        </div>

        {/* Hostel Residents */}
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/80 shadow-soft flex items-center gap-4 accent-gold-top">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-outline uppercase tracking-wider">Hostel Residents</p>
            <p className="text-2xl font-bold font-serif text-primary">{hostelResidentsCount}</p>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Hall Selector, Level Pills & View Toggle */}
      <div className="bg-white rounded-2xl p-5 shadow-card border border-outline-variant/80 mb-8 space-y-4">
        {/* Search & Hall dropdown */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by member name, program, hall, or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-outline hover:text-primary"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Hall Dropdown Filter */}
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-xs font-semibold text-on-surface focus:border-primary"
            >
              <option value="All">All Halls of Affiliation</option>
              {HALLS_OF_AFFILIATION.map((hall) => (
                <option key={hall} value={hall}>
                  {hall}
                </option>
              ))}
            </select>

            {/* View Mode Toggle: Grid vs Table */}
            <div className="flex items-center bg-surface-container rounded-xl p-1 border border-outline-variant/60">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-outline hover:text-primary'
                }`}
                title="Hall Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-outline hover:text-primary'
                }`}
                title="Directory Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Level Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-outline-variant/60">
          <span className="text-xs font-bold uppercase tracking-wider text-outline mr-2">Level:</span>
          {['All', ...LEVELS].map((lvl) => {
            const isSelected = selectedLevel === lvl;
            const count = levelCounts[lvl] || 0;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span>{lvl === 'All' ? 'All Levels' : `Level ${lvl}`}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white text-outline'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE 1: Hall-by-Hall Grouped Cards (The Iconic NUTFS UCC View) */}
      {viewMode === 'grid' && (
        <div className="space-y-6">
          {Object.entries(hallGroupedData).map(([hallName, hallMembers]) => {
            if (selectedHall !== 'All' && selectedHall !== hallName) return null;
            const isCollapsed = collapsedHalls[hallName];

            return (
              <div
                key={hallName}
                className="bg-white rounded-2xl border border-outline-variant/80 shadow-soft overflow-hidden"
              >
                {/* Hall Header Bar */}
                <div
                  onClick={() => toggleHallCollapse(hallName)}
                  className="px-6 py-4 bg-surface-container-low flex justify-between items-center cursor-pointer hover:bg-surface-container transition-colors border-b border-outline-variant/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold font-serif text-primary">
                        {hallName}
                      </h2>
                      <p className="text-xs text-outline">
                        {hallMembers.length} {hallMembers.length === 1 ? 'registered member' : 'registered members'}
                      </p>
                    </div>
                  </div>

                  <button className="p-1 rounded-lg text-outline hover:text-primary">
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </button>
                </div>

                {/* Members in this Hall */}
                {!isCollapsed && (
                  <div className="p-6">
                    {hallMembers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hallMembers.map((student) => (
                          <div
                            key={student.id}
                            className="bg-surface-container-low rounded-xl p-4 border border-outline-variant hover:border-primary/40 hover:shadow-card transition-all space-y-3"
                          >
                            <div className="flex items-start gap-3">
                              {/* Member Photo */}
                              <div className="w-14 h-14 rounded-xl border border-outline-variant overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-xs">
                                {student.passportPhoto ? (
                                  <img
                                    src={student.passportPhoto}
                                    alt={student.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Users className="w-6 h-6 text-outline" />
                                )}
                              </div>

                              {/* Member Details */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                                    Level {student.level}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                      student.residenceType === 'Hall'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {student.residenceType}
                                  </span>
                                </div>
                                <h3 className="font-bold text-sm text-primary font-serif truncate mt-1">
                                  {student.fullName}
                                </h3>
                                <p className="text-xs text-on-surface-variant truncate">
                                  {student.programOfStudy}
                                </p>
                              </div>
                            </div>

                            {/* Room & Contact */}
                            <div className="pt-2 border-t border-outline-variant/60 flex justify-between items-center text-xs text-outline">
                              <span className="truncate">
                                {student.residenceType === 'Hall'
                                  ? `Room: ${student.roomNumber || 'Assigned'}`
                                  : 'Off-Campus Hostel'}
                              </span>
                              <a
                                href={`tel:${student.phone}`}
                                className="flex items-center gap-1 text-primary font-semibold hover:underline"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{student.phone}</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-outline italic text-center py-4">
                        No registered members in {hallName} matching the current filters.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: Comprehensive Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl shadow-card border border-outline-variant/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant text-[11px] font-bold uppercase tracking-wider text-outline">
                  <th className="py-3.5 px-4">Member Name</th>
                  <th className="py-3.5 px-4">Program of Study</th>
                  <th className="py-3.5 px-3 text-center">Level</th>
                  <th className="py-3.5 px-4">Hall of Affiliation</th>
                  <th className="py-3.5 px-4">Residence & Room</th>
                  <th className="py-3.5 px-4">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-xs">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg border border-outline-variant overflow-hidden bg-surface-container shrink-0 flex items-center justify-center">
                            {student.passportPhoto ? (
                              <img
                                src={student.passportPhoto}
                                alt={student.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-4 h-4 text-outline" />
                            )}
                          </div>
                          <span className="font-bold text-primary font-serif">
                            {student.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-on-surface truncate max-w-xs">
                        {student.programOfStudy}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary">
                          {student.level}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-primary">
                        {student.hallOfAffiliation}
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant">
                        {student.residenceType === 'Hall'
                          ? `Room ${student.roomNumber || '—'}`
                          : 'Hostel Resident'}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <a href={`tel:${student.phone}`} className="text-primary hover:underline font-semibold">
                          {student.phone}
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-outline">
                      No members match the active search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
