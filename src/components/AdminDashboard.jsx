import React, { useState, useMemo } from 'react';
import { useStudents } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';
import { HALLS_OF_AFFILIATION, LEVELS } from '../constants/data';
import { 
  Users, 
  Search, 
  RefreshCw, 
  Download, 
  ChevronDown, 
  ChevronUp,
  LayoutGrid,
  List,
  LogOut,
  Loader2,
  Phone
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { students, loading: studentsLoading, refetch, exportToCSV } = useStudents();
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedHall, setSelectedHall] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [collapsedHalls, setCollapsedHalls] = useState({});

  const toggleHallCollapse = (hall) => {
    setCollapsedHalls((prev) => ({
      ...prev,
      [hall]: !prev[hall]
    }));
  };

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

  const levelCounts = useMemo(() => {
    const counts = { All: students.length };
    LEVELS.forEach((lvl) => {
      counts[lvl] = students.filter((s) => s.level === lvl).length;
    });
    return counts;
  }, [students]);

  const hallResidentsCount = students.filter((s) => s.residenceType === 'Hall').length;
  const hostelResidentsCount = students.filter((s) => s.residenceType === 'Hostel').length;

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginModal />;
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 pb-16 pt-2">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Student registrations overview across halls and academic levels.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => refetch()}
            className="p-2 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${studentsLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-600 rounded-lg text-xs font-medium hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500">Total Members</p>
          <p className="text-2xl font-bold font-serif text-slate-900 mt-1">{students.length}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500">Hall Residents</p>
          <p className="text-2xl font-bold font-serif text-slate-900 mt-1">{hallResidentsCount}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500">Hostel Residents</p>
          <p className="text-2xl font-bold font-serif text-slate-900 mt-1">{hostelResidentsCount}</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-primary"
            >
              <option value="All">All Halls</option>
              {HALLS_OF_AFFILIATION.map((hall) => (
                <option key={hall} value={hall}>
                  {hall}
                </option>
              ))}
            </select>

            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1 rounded text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="Table"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Level Tabs */}
        <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium mr-2">Level:</span>
          {['All', ...LEVELS].map((lvl) => {
            const isSelected = selectedLevel === lvl;
            const count = levelCounts[lvl] || 0;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lvl === 'All' ? 'All' : `L${lvl}`} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          {Object.entries(hallGroupedData).map(([hallName, hallMembers]) => {
            if (selectedHall !== 'All' && selectedHall !== hallName) return null;
            const isCollapsed = collapsedHalls[hallName];

            return (
              <div key={hallName} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div
                  onClick={() => toggleHallCollapse(hallName)}
                  className="px-5 py-3.5 bg-slate-50 flex justify-between items-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 inline-block mr-2">
                      {hallName}
                    </h2>
                    <span className="text-xs text-slate-500">
                      ({hallMembers.length})
                    </span>
                  </div>

                  <button className="p-1 text-slate-400 hover:text-slate-600">
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>

                {!isCollapsed && (
                  <div className="p-5">
                    {hallMembers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {hallMembers.map((student) => (
                          <div
                            key={student.id}
                            className="bg-slate-50/60 rounded-lg p-3.5 border border-slate-200/80 space-y-2"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                                {student.passportPhoto ? (
                                  <img
                                    src={student.passportPhoto}
                                    alt={student.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Users className="w-5 h-5 text-slate-300" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-xs text-slate-900 truncate">
                                  {student.fullName}
                                </h3>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {student.programOfStudy}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  Level {student.level} • {student.residenceType}
                                </p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[11px] text-slate-500">
                              <span>
                                {student.residenceType === 'Hall'
                                  ? `Room ${student.roomNumber || '—'}`
                                  : 'Hostel'}
                              </span>
                              <a
                                href={`tel:${student.phone}`}
                                className="flex items-center gap-1 text-slate-700 font-medium hover:underline"
                              >
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{student.phone}</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-2">
                        No members found in {hallName}.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-medium text-slate-500">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-3 text-center">Level</th>
                  <th className="py-3 px-4">Hall</th>
                  <th className="py-3 px-4">Residence</th>
                  <th className="py-3 px-4">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {student.fullName}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 truncate max-w-xs">
                        {student.programOfStudy}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600">
                        Level {student.level}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800">
                        {student.hallOfAffiliation}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {student.residenceType === 'Hall'
                          ? `Room ${student.roomNumber || '—'}`
                          : 'Hostel'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <a href={`tel:${student.phone}`} className="hover:underline">
                          {student.phone}
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                      No members match the active filters.
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
