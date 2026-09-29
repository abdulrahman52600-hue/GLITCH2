import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Briefcase, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Trash2, 
  AlertCircle,
  Database,
  Activity,
  Layers,
  Search,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export default function AdminDashboardPage({ projects = [], onRefreshData }) {
  const { showToast } = useToast();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    totalProjects: 0,
    totalApplications: 0,
    totalMentors: 0,
    acceptedApplications: 0,
    shortlistedApplications: 0,
    avgMatchPercentage: 0,
    systemMode: 'Loading platform status'
  });

  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [projectSearch, setProjectSearch] = useState('');

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.getAdminStats(),
          api.getAdminUsers()
        ]);
        if (statsRes.success) setStats(statsRes.stats);
        if (usersRes.success) setAllUsers(usersRes.users);
        setError('');
      } catch (err) {
        setError(err.message || 'Unable to load governance data.');
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [projects]);

  const filteredUsers = allUsers.filter((user) => {
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    const query = userSearch.trim().toLowerCase();
    const matchesSearch = !query || [user.name, user.email, user.university, user.companyName, user.role]
      .some(value => String(value || '').toLowerCase().includes(query));
    return matchesRole && matchesSearch;
  });
  const filteredProjects = projects.filter(project => {
    const query = projectSearch.trim().toLowerCase();
    return !query || [project.title, project.companyName, project.type, project.status]
      .some(value => String(value || '').toLowerCase().includes(query));
  });

  const handleToggleProjectStatus = async (projectId, currentStatus) => {
    const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
    try {
      const res = await api.setProjectStatus(projectId, newStatus);
      if (res.success) {
        showToast(`Project status changed to ${newStatus}.`, 'success');
        onRefreshData();
      }
    } catch (err) {
      showToast('Failed to update project status', 'error');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to permanently delete this project listing?')) return;
    try {
      const res = await api.deleteProject(projectId);
      if (res.success) {
        showToast('Project listing deleted by Admin.', 'info');
        onRefreshData();
      }
    } catch (err) {
      showToast('Failed to delete project', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ADMIN BANNER */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-purple-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-xs font-bold text-purple-300 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin Console · Platform Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              NexBridge Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Review platform activity, moderate opportunities, and inspect registered accounts.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2.5 rounded-2xl border border-white/15 text-xs text-purple-200">
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Engine Status:</span>
              <span className="text-[11px] text-emerald-300">{stats.systemMode}</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</div>}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Students</div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">{stats.totalStudents}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">IIIT-H, NIT-W, IITH</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Companies</div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">{stats.totalCompanies}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Verified employers</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Active Projects</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.totalProjects}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Internships & projects</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Applications</div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 mt-1">{stats.totalApplications}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{stats.shortlistedApplications} in review</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Avg Match Rate</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{stats.avgMatchPercentage}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Algorithm efficiency</div>
        </div>

      </div>

      {/* PROJECT MODERATION & MANAGEMENT TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Project Postings Moderation ({filteredProjects.length})
            </h2>
          </div>
          <label className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={projectSearch} onChange={e => setProjectSearch(e.target.value)} placeholder="Search opportunities" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Stipend</th>
                <th className="py-3 px-4">Required Skills</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map(proj => (
                <tr key={proj._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {proj.title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {proj.companyName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                      {proj.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700">
                    {proj.stipend}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate">
                    {proj.requiredSkills?.join(', ')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      proj.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleProjectStatus(proj._id, proj.status)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-[11px]"
                    >
                      {proj.status === 'Open' ? 'Close' : 'Reopen'}
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj._id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredProjects.length && <tr><td colSpan="7" className="py-10 text-center text-sm text-slate-500">{loading ? 'Loading opportunities…' : 'No opportunities match this search.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER DIRECTORY TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Platform User Directory ({filteredUsers.length})
            </h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search name, email or affiliation" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-64" />
            </label>
            <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} aria-label="Filter users by role" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              <option value="all">All roles</option><option value="student">Students</option><option value="company">Companies</option><option value="admin">Admins</option>
            </select>
            <button onClick={() => { setLoading(true); setError(''); api.getAdminStats().then(res => res.success && setStats(res.stats)).then(() => api.getAdminUsers()).then(res => res.success && setAllUsers(res.users)).catch(err => setError(err.message)).finally(() => setLoading(false)); onRefreshData?.(); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50" aria-label="Refresh admin data"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Affiliation / Institution</th>
                <th className="py-3 px-4">Skills / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => (
                <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <img
                      src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold capitalize text-[10px] ${
                      u.role === 'student'
                        ? 'bg-indigo-50 text-indigo-700'
                        : u.role === 'company'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-purple-50 text-purple-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {u.university || u.companyName || 'Platform Office'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-[220px] truncate">
                    {u.skills?.join(', ') || u.industry || 'Administrator'}
                  </td>
                </tr>
              ))}
              {!filteredUsers.length && <tr><td colSpan="5" className="py-10 text-center text-sm text-slate-500">{loading ? 'Loading accounts…' : 'No accounts match these filters.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
