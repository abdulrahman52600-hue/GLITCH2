import React, { useState } from 'react';
import { 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Mail, 
  User, 
  Lock,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export default function LoginPage({ setActivePage }) {
  const { demoUsers, loginUser, switchRole } = useAuth();
  const { showToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    university: '',
    companyName: '',
    skills: 'React, Python, SQL, Tailwind CSS'
  });
  const [loading, setLoading] = useState(false);

  const studentUser = demoUsers.find(u => u.role === 'student');
  const companyUser = demoUsers.find(u => u.role === 'company');
  const adminUser = demoUsers.find(u => u.role === 'admin');

  const handleDemoLogin = (role) => {
    switchRole(role);
    showToast(`Logged in successfully as Demo ${role.charAt(0).toUpperCase() + role.slice(1)}!`, 'success');
    if (role === 'student') setActivePage('student-dashboard');
    else if (role === 'company') setActivePage('company-dashboard');
    else setActivePage('admin-dashboard');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          university: formData.role === 'student' ? formData.university : undefined,
          companyName: formData.role === 'company' ? formData.companyName : undefined,
          skills: formData.role === 'student' ? formData.skills.split(',').map(s => s.trim()) : []
        });

        if (res.success && res.user) {
          loginUser(res.user);
          showToast(`Welcome to Student-Industry Bridge, ${res.user.name}!`, 'success');
          setActivePage(formData.role === 'student' ? 'student-dashboard' : 'company-dashboard');
        } else {
          showToast(res.error || 'Registration failed', 'error');
        }
      } else {
        const res = await api.login({ email: formData.email });
        if (res.success && res.user) {
          loginUser(res.user);
          showToast(`Welcome back, ${res.user.name}!`, 'success');
          setActivePage(res.user.role === 'company' ? 'company-dashboard' : res.user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
        } else {
          showToast(res.error || 'User not found. Use 1-Click Demo Login.', 'error');
        }
      }
    } catch (err) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Page Title */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Role Access Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Sign In or Choose a Demo Persona
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          For evaluation & testing, select any of the 3 pre-configured verified demo roles below.
        </p>
      </div>

      {/* 3 ONE-CLICK DEMO LOGIN CARDS */}
      <div className="mb-14">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
          ⚡ 1-Click Instant Demo Profiles
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Student Persona */}
          <div 
            onClick={() => handleDemoLogin('student')}
            className="group cursor-pointer bg-white rounded-2xl p-6 border-2 border-indigo-100 hover:border-indigo-500 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-wider border border-indigo-200">
                  Role 1: Student
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <img
                  src={studentUser?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBIXfx4rAhfmr-j1tvTrycgZSYhAhJmbRnfpSj95b5Yr8T6_e2CiVVYzlalVrtbd9GLTNSjRvZm1t7q9b3qLJiX4A2G-2xWicEsAIdFhxFp8wcMKQb_OBNfVqSWjkJElANx4y7Jhpctb2Xh4ns_2thsqgvxToPBngjDOrbdv0Vtv5hnEM4ziN9wRin88TUAtBD2huXCJgBc6dkDbrbueu8qLfrK_m3zqin74JznPrPwFcIt-LV_k-pk"}
                  alt="Student"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                    Zubair Khan
                  </h3>
                  <p className="text-xs text-slate-500">UC Berkeley • CS '25</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p><strong className="text-slate-700">Skills:</strong> React, Python, SQL, TS, Next.js</p>
                <p><strong className="text-slate-700">Availability:</strong> 15-20 hrs/wk Part-Time</p>
                <p><strong className="text-slate-700">Status:</strong> 1 Active Sprint • 2 In Review</p>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Login as Zubair Khan (Student)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Company Persona */}
          <div 
            onClick={() => handleDemoLogin('company')}
            className="group cursor-pointer bg-white rounded-2xl p-6 border-2 border-outline-variant/30 hover:border-primary hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-container text-on-surface uppercase tracking-wider border border-outline-variant/30">
                  Role 2: Company
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <img
                  src={companyUser?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCJuuxNkh6whyCVTFBsqnUBhPlh3AJYDh3QBVBQsEidJ0ZnjJ-thhZDhHb9LOgn3uB3AGfZK_FBz5EEMomRMKOcd7yhhqFVWFGs1F-FcBa87OUObHjVurDiXDPhkuzFbLHfGTdCTjK-NhY2EQDG-nZ__0XrcO3MjouhbzDQzn0AQ35pusjoapqXsqZpa4c4S61rv8iPTh7bGaW9VAfty99Px7xRc5z4H1CpvuDr4uEkP1Kg-yEjkz8P"}
                  alt="Company"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                    Ayaan Siddiqui
                  </h3>
                  <p className="text-xs text-slate-500">FinFlow Technologies • Talent Partner</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p><strong className="text-slate-700">Industry:</strong> B2B Financial Orchestration</p>
                <p><strong className="text-slate-700">Open Postings:</strong> 3 Active Sprints</p>
                <p><strong className="text-slate-700">Hiring Pipeline:</strong> 12 Candidates</p>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Login as Ayaan Siddiqui (Company)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin Persona */}
          <div 
            onClick={() => handleDemoLogin('admin')}
            className="group cursor-pointer bg-white rounded-2xl p-6 border-2 border-outline-variant/30 hover:border-primary hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-container text-on-surface uppercase tracking-wider border border-outline-variant/30">
                  Role 3: Admin
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <img
                  src={adminUser?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDTYiMi9B19n9XGVRt2FlVJn1OvwxYU-FdJKEsiCoUrG7yG0j92PyhginJHBko2kBTATYowHdAW6WgHJIeNEKUcklZNt0wl_dWJqzIpBChGE8FMrB6ahl-qppXFygM_T5GDGyQTJxXSVrrqGRVHAn06iUUR_qmFYnLSa25Z--PXdOsWjqVMGOgIRx7UQKdsW6cIpzxJD8PY-3ko7AaYsMLf5K7CEjixli0gywr-2NykvkF-d7pATh5U"}
                  alt="Admin"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                    Mohammed Saad
                  </h3>
                  <p className="text-xs text-slate-500">Platform & University Lead</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p><strong className="text-slate-700">Capabilities:</strong> System Metrics, Audits</p>
                <p><strong className="text-slate-700">Moderation:</strong> Close/Approve Postings</p>
                <p><strong className="text-slate-700">Engine:</strong> Live Persistence Diagnostics</p>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Login as Mohammed Saad (Admin)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* STANDARD LOGIN / REGISTRATION FORM */}
      <div className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        
        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              !isRegister ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              isRegister ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Create New Account
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jordan Miller"
                  className="w-full text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Choose Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'student' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                      formData.role === 'student'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'company' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                      formData.role === 'company'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Company</span>
                  </button>
                </div>
              </div>

              {formData.role === 'student' ? (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    University / College
                  </label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    placeholder="e.g. MIT, Stanford, Berkeley"
                    className="w-full text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Robotics Labs"
                    className="w-full text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={isRegister ? "your.email@university.edu" : "alex.chen@stanford.edu"}
              className="w-full text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegister ? 'Register & Continue' : 'Sign In')}
          </button>
        </form>

      </div>

    </div>
  );
}
