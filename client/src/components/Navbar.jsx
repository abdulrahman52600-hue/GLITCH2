import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import NexBridgeLogo from './NexBridgeLogo.jsx';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, setSelectedProjectId }) {
  const { user, role, switchRole } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navigate = (page, projectId = null) => {
    if (projectId) setSelectedProjectId(projectId);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDashboardPage = () => {
    if (role === 'company') return 'company-dashboard';
    if (role === 'admin') return 'admin-dashboard';
    return 'student-dashboard';
  };

  return (
    <>
      {/* Top Fixed Header */}
      <header className="fixed top-0 w-full z-50 bg-[#ffffff]/90 backdrop-blur-xl border-b border-[#eaedff] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Logo & Subtitle */}
          <div 
            onClick={() => navigate('home')} 
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <NexBridgeLogo className="h-8 sm:h-9 w-auto" />
            <div className="hidden xl:flex flex-col border-l border-slate-200 pl-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Micro-Internships</span>
              <span className="text-[11px] text-on-surface-variant font-medium">Skill-Matched Sprints</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => navigate('home')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                activePage === 'home'
                  ? 'text-primary bg-primary-fixed/40 font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => navigate('explore')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activePage === 'explore' || activePage === 'project-details'
                  ? 'text-primary bg-primary-fixed/40 font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[19px]">explore</span>
              <span>Explore Sprints</span>
            </button>

            <button
              onClick={() => navigate('mentors')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activePage === 'mentors'
                  ? 'text-primary bg-primary-fixed/40 font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[19px]">school</span>
              <span>Mentors</span>
            </button>

            <button
              onClick={() => navigate('applications')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activePage === 'applications'
                  ? 'text-primary bg-primary-fixed/40 font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[19px]">work</span>
              <span>Applications</span>
            </button>

            <button
              onClick={() => navigate(getDashboardPage())}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activePage.includes('dashboard')
                  ? 'text-primary bg-primary-fixed/40 font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[19px]">space_dashboard</span>
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Right Action Icons & Persona Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 1-Click Role Switcher Pill Bar */}
            <div className="hidden sm:flex items-center bg-surface-container p-1 rounded-full border border-outline-variant/30 text-xs font-semibold">
              <button
                onClick={() => {
                  switchRole('student');
                  navigate('student-dashboard');
                }}
                className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                  role === 'student'
                    ? 'bg-primary text-on-primary shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                onClick={() => {
                  switchRole('company');
                  navigate('company-dashboard');
                }}
                className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                  role === 'company'
                    ? 'bg-primary text-on-primary shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Company</span>
              </button>

              <button
                onClick={() => {
                  switchRole('admin');
                  navigate('admin-dashboard');
                }}
                className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                  role === 'admin'
                    ? 'bg-primary text-on-primary shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Notification Bell */}
            <button 
              aria-label="Notifications" 
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-white"></span>
            </button>

            {/* User Profile Avatar with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-surface-container border border-outline-variant/30 transition-all"
              >
                <img
                  src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBIXfx4rAhfmr-j1tvTrycgZSYhAhJmbRnfpSj95b5Yr8T6_e2CiVVYzlalVrtbd9GLTNSjRvZm1t7q9b3qLJiX4A2G-2xWicEsAIdFhxFp8wcMKQb_OBNfVqSWjkJElANx4y7Jhpctb2Xh4ns_2thsqgvxToPBngjDOrbdv0Vtv5hnEM4ziN9wRin88TUAtBD2huXCJgBc6dkDbrbueu8qLfrK_m3zqin74JznPrPwFcIt-LV_k-pk"}
                  alt={user?.name || "Avatar"}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                />
                <span className="hidden lg:inline text-xs font-bold text-on-surface pr-1">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant pr-1" />
              </button>

              {/* Dropdown Menu */}
              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface-container-lowest shadow-2xl border border-outline-variant/30 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-surface-container">
                    <p className="text-xs text-on-surface-variant">Active Profile</p>
                    <p className="text-sm font-bold text-on-surface truncate">{user?.name}</p>
                    <p className="text-xs text-primary font-semibold capitalize flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {role} • {user?.university || user?.companyName || 'Verified'}
                    </p>
                  </div>

                  <div className="py-1">
                    {role === 'student' && (
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          navigate('profile');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-primary-fixed/30 hover:text-primary flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">account_circle</span>
                        <span>Student Profile & Skills</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        navigate(getDashboardPage());
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-primary-fixed/30 hover:text-primary flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">space_dashboard</span>
                      <span>{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        navigate('login');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-primary-fixed/30 hover:text-primary flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Switch Demo Personas</span>
                    </button>
                  </div>

                  <div className="border-t border-surface-container px-3 py-2 bg-surface-container-low">
                    <p className="text-[11px] font-bold text-on-surface-variant mb-1.5 uppercase">Switch Role</p>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => {
                          switchRole('student');
                          setRoleDropdownOpen(false);
                          navigate('student-dashboard');
                        }}
                        className={`text-[11px] py-1 px-1.5 rounded-lg font-bold text-center ${role === 'student' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                      >
                        Student
                      </button>
                      <button
                        onClick={() => {
                          switchRole('company');
                          setRoleDropdownOpen(false);
                          navigate('company-dashboard');
                        }}
                        className={`text-[11px] py-1 px-1.5 rounded-lg font-bold text-center ${role === 'company' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                      >
                        Company
                      </button>
                      <button
                        onClick={() => {
                          switchRole('admin');
                          setRoleDropdownOpen(false);
                          navigate('admin-dashboard');
                        }}
                        className={`text-[11px] py-1 px-1.5 rounded-lg font-bold text-center ${role === 'admin' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (as per the NexBridge UX spec) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-16 px-2">
          <button
            onClick={() => navigate('explore')}
            className={`flex flex-col items-center justify-center w-14 h-12 transition-colors ${
              activePage === 'explore' || activePage === 'project-details' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">explore</span>
            <span className="text-[11px] font-semibold mt-0.5">Explore</span>
          </button>

          <button
            onClick={() => navigate(getDashboardPage())}
            className={`flex flex-col items-center justify-center w-14 h-12 transition-colors ${
              activePage.includes('dashboard') ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">space_dashboard</span>
            <span className="text-[11px] font-semibold mt-0.5">Dashboard</span>
          </button>

          <button
            onClick={() => navigate('applications')}
            className={`relative flex flex-col items-center justify-center w-14 h-12 transition-colors ${
              activePage === 'applications' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">work</span>
            <span className="absolute top-0.5 right-2 min-w-[16px] h-4 px-1 rounded-full bg-primary text-on-primary font-mono text-[10px] leading-4 text-center">
              2
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Applied</span>
          </button>

          <button
            onClick={() => navigate('mentors')}
            className={`flex flex-col items-center justify-center w-14 h-12 transition-colors ${
              activePage === 'mentors' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">school</span>
            <span className="text-[11px] font-semibold mt-0.5">Mentors</span>
          </button>

          <button
            onClick={() => navigate('profile')}
            className={`flex flex-col items-center justify-center w-14 h-12 transition-colors ${
              activePage === 'profile' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">person</span>
            <span className="text-[11px] font-semibold mt-0.5">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
}
