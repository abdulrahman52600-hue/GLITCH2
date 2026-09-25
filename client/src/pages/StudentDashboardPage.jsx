import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function StudentDashboardPage({ 
  projects = [], 
  applications = [], 
  mentorRequests = [], 
  onViewDetails, 
  onApply, 
  setActivePage 
}) {
  const { user, switchRole } = useAuth();
  const { showToast } = useToast();

  const [activeViewMode, setActiveViewMode] = useState('student'); // 'student' | 'company'
  const [prSubmitted, setPrSubmitted] = useState(false);

  const handleShareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Student profile link copied to clipboard!', 'success');
  };

  const handleSubmitPr = () => {
    setPrSubmitted(true);
    showToast('Milestone 3 Pull Request dispatched to CloudScale engineering team!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 min-h-screen">
      <div className="flex flex-col w-full space-y-4">
        
        {/* View Switcher Segmented Control */}
        <div className="w-full bg-surface-container-high p-1 rounded-full flex items-center shadow-xs">
          <button 
            onClick={() => setActiveViewMode('student')}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeViewMode === 'student'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            id="tab-student"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            Student View
          </button>
          
          <button 
            onClick={() => {
              setActiveViewMode('company');
              showToast('Previewing profile as seen by verified hiring partners & recruiters.', 'info');
            }}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeViewMode === 'company'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            id="tab-company"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            Preview Company View
          </button>
        </div>

        {/* Company View Notification Banner */}
        {activeViewMode === 'company' && (
          <div className="p-3 rounded-xl bg-primary-fixed text-on-primary-fixed text-xs font-medium flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">visibility</span>
              <span><strong>Recruiter Preview Mode:</strong> This is how top fintech and AI teams see Zubair Khan's verified stack.</span>
            </div>
            <button 
              onClick={() => setActiveViewMode('student')} 
              className="text-primary font-bold underline ml-2"
            >
              Exit
            </button>
          </div>
        )}

        {/* Student Profile Header Card */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-sm border border-outline-variant/20 relative overflow-hidden">
          {/* Ambient Accent Glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-primary-fixed/40 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="relative flex-shrink-0">
              <img 
                alt="Zubair Khan" 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-md ring-2 ring-primary-fixed" 
                src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBIXfx4rAhfmr-j1tvTrycgZSYhAhJmbRnfpSj95b5Yr8T6_e2CiVVYzlalVrtbd9GLTNSjRvZm1t7q9b3qLJiX4A2G-2xWicEsAIdFhxFp8wcMKQb_OBNfVqSWjkJElANx4y7Jhpctb2Xh4ns_2thsqgvxToPBngjDOrbdv0Vtv5hnEM4ziN9wRin88TUAtBD2huXCJgBc6dkDbrbueu8qLfrK_m3zqin74JznPrPwFcIt-LV_k-pk"}
              />
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm" title="Verified Collegiate Talent">
                <span className="material-symbols-outlined text-[14px]">verified</span>
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface truncate">
                  {user?.name || 'Zubair Khan'}
                </h1>
                <button 
                  onClick={handleShareProfile}
                  aria-label="Share Profile" 
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                </button>
              </div>
              <p className="text-xs text-on-surface-variant truncate mt-0.5 font-medium">
                {user?.university ? `${user.university} • B.S. ${user.major || 'Computer Science'} '${user.gradYear || '25'}` : "UC Berkeley • B.S. Computer Science '25"}
              </p>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">school</span>
                  Campus Verified
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-mono text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  4.9/5 (6 Sprints)
                </span>
              </div>
            </div>
          </div>

          {/* Bio Statement */}
          <p className="text-xs sm:text-sm text-on-surface-variant mt-4 leading-relaxed font-medium">
            Full-stack builder passionate about developer tooling, API design, and distributed systems.
          </p>

          {/* Quick Status Pills */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-1">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low border border-outline-variant/15">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-on-surface">Available for Fall '24</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low border border-outline-variant/15">
              <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
              <span className="text-xs font-semibold text-on-surface">15-20 hrs / week</span>
            </div>
          </div>
        </div>

        {/* Performance & Career Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium">Earned to Date</span>
              <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-on-surface tracking-tight">₹42,000</div>
              <span className="font-mono text-[10px] font-bold text-[#244b16] bg-[#B8D8A2]/30 border border-[#B8D8A2]/50 px-1.5 py-0.5 rounded mt-1 inline-block">+100% Guaranteed</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium">Completed</span>
              <span className="material-symbols-outlined text-secondary text-[20px]">task_alt</span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-on-surface tracking-tight">6 Sprints</div>
              <span className="font-mono text-[10px] font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded mt-1 inline-block">100% Delivery Score</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium">On-Time Rate</span>
              <span className="material-symbols-outlined text-primary text-[20px]">speed</span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-on-surface tracking-tight">98%</div>
              <span className="font-mono text-[10px] font-bold text-[#244b16] bg-[#B8D8A2]/30 border border-[#B8D8A2]/50 px-1.5 py-0.5 rounded mt-1 inline-block">Top 5% Talent</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium">Rehire Rate</span>
              <span className="material-symbols-outlined text-tertiary-container text-[20px]">recommend</span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-on-surface tracking-tight">100%</div>
              <span className="font-mono text-[10px] font-bold text-[#244b16] bg-[#B8D8A2]/30 border border-[#B8D8A2]/50 px-1.5 py-0.5 rounded mt-1 inline-block">All Clients Rec.</span>
            </div>
          </div>
        </div>

        {/* Active Sprints & Status Trackers */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
              <h2 className="font-bold text-base text-on-surface">Active Sprint</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-mono text-[11px] font-bold">
              IN PROGRESS
            </span>
          </div>

          {/* Active Sprint Card */}
          <div className="p-4 rounded-xl bg-surface-container-low shadow-xs border border-outline-variant/15">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider">CloudScale Inc.</span>
                <h3 className="text-base font-bold text-on-surface mt-0.5">Auth0 & RBAC Module</h3>
              </div>
              <span className="text-base font-bold text-primary">₹25,000</span>
            </div>

            {/* Timeline & Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5 font-semibold">
                <span>Day 9 of 14</span>
                <span className="font-mono text-primary font-bold">65% Complete</span>
              </div>
              <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-[#87B769] rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
              </div>
            </div>

            {/* Milestone Trackers */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/15">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-xs text-on-surface font-medium">M1: Architecture Review & Schema</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-600 font-bold">₹7,000 Paid</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/15">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-xs text-on-surface font-medium">M2: Token Handlers & Test Suite</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-600 font-bold">₹12,000 Released</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/15">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[18px] ${prSubmitted ? 'text-emerald-600' : 'text-primary animate-spin'}`}>
                    {prSubmitted ? 'check_circle' : 'sync'}
                  </span>
                  <span className="text-xs text-on-surface font-bold">
                    M3: Production Deploy & RBAC UI
                  </span>
                </div>
                <span className="font-mono text-[11px] text-primary font-bold">
                  {prSubmitted ? 'PR Submitted' : 'In Review'}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons for Sprint */}
            <div className="flex items-center gap-2 mt-4">
              <button 
                onClick={handleSubmitPr}
                disabled={prSubmitted}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                  prSubmitted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-primary text-on-primary hover:bg-primary-container'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">terminal</span>
                {prSubmitted ? 'PR Under Review' : 'Submit M3 PR'}
              </button>

              <button 
                onClick={() => showToast('Opening direct Slack channel with CloudScale mentor.', 'info')}
                className="py-2.5 px-3 rounded-lg bg-surface-container-highest text-on-surface text-xs font-bold flex items-center justify-center gap-1 hover:bg-surface-container transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Client
              </button>
            </div>
          </div>
        </div>

        {/* GitHub & Portfolio Links Section */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-on-surface">Verified Work & Repos</h2>
            <span className="font-mono text-[11px] text-[#244b16] bg-[#B8D8A2]/30 border border-[#B8D8A2]/50 px-2 py-0.5 rounded-full flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#6a9e48] animate-pulse"></span>
              Live Synced
            </span>
          </div>

          <div className="space-y-3">
            {/* GitHub Card */}
            <a 
              className="block p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all group border border-outline-variant/15" 
              href="https://github.com" 
              rel="noopener noreferrer" 
              target="_blank"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-inverse-surface text-inverse-on-surface flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-1">
                      github.com/zubairkhan-dev
                      <span className="material-symbols-outlined text-[16px]">north_east</span>
                    </div>
                    <span className="font-mono text-xs text-on-surface-variant font-medium">Top: Next.js, Python</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#B8D8A2]/35 text-[#244b16] border border-[#B8D8A2]/50 font-mono text-[10px] font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-2 text-on-surface-variant text-xs">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">folder_special</span>
                  <strong className="text-on-surface font-semibold">48</strong> Repos
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">commit</span>
                  <strong className="text-on-surface font-semibold">1.2k</strong> Commits (Year)
                </span>
              </div>
            </a>

            {/* Live Portfolio Card */}
            <a 
              className="block p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all group border border-outline-variant/15" 
              href="https://zubairkhan.dev" 
              rel="noopener noreferrer" 
              target="_blank"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">web</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-1">
                      zubairkhan.dev/work
                      <span className="material-symbols-outlined text-[16px]">north_east</span>
                    </div>
                    <span className="text-xs text-on-surface-variant font-medium">Interactive Design & Architecture Showcase</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward_ios</span>
              </div>
            </a>

            {/* Connected Badges */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center gap-2 border border-outline-variant/15">
                <span className="material-symbols-outlined text-amber-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                <div className="min-w-0">
                  <div className="text-xs text-on-surface font-bold truncate">Devpost Winner</div>
                  <div className="text-[11px] text-on-surface-variant font-medium">2x Hackathon 1st</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center gap-2 border border-outline-variant/15">
                <span className="material-symbols-outlined text-primary text-[20px]">link</span>
                <div className="min-w-0">
                  <div className="text-xs text-on-surface font-bold truncate">LinkedIn Synced</div>
                  <div className="text-[11px] text-on-surface-variant font-medium">500+ Connections</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Skills & Match Inventory */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-base text-on-surface">Skill Inventory</h2>
              <p className="text-xs text-on-surface-variant">Benchmarked against 140+ hiring rubrics</p>
            </div>
            <button 
              onClick={() => setActivePage('profile')}
              className="px-3 py-1.5 rounded-lg bg-surface-container text-primary text-xs font-bold flex items-center gap-1 hover:bg-primary-fixed transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit
            </button>
          </div>

          <div className="space-y-3 mt-3">
            <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider block font-semibold">Verified Core Proficiencies</span>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed font-mono text-xs font-semibold">
                React <strong className="text-primary text-[10px] uppercase font-bold bg-surface-container-lowest px-1.5 py-0.5 rounded-full">Expert</strong>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed font-mono text-xs font-semibold">
                TypeScript <strong className="text-primary text-[10px] uppercase font-bold bg-surface-container-lowest px-1.5 py-0.5 rounded-full">Adv</strong>
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface font-mono text-xs font-semibold">
                Next.js
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface font-mono text-xs font-semibold">
                TailwindCSS
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface font-mono text-xs font-semibold">
                Python
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface font-mono text-xs font-semibold">
                FastAPI
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface font-mono text-xs font-semibold">
                PostgreSQL
              </span>
            </div>
          </div>

          {/* Skills in Progress */}
          <div className="space-y-3 mt-4 pt-2">
            <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider block font-semibold">Skills in Progress (Learning)</span>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-mono text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                GraphQL
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-mono text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Docker
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-mono text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Redis
              </span>
            </div>
          </div>
        </div>

        {/* Client Testimonial Spotlight */}
        <div className="w-full bg-gradient-to-br from-surface-container-low to-surface-container rounded-xl p-4 sm:p-5 shadow-sm border border-outline-variant/15">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
            <span className="text-xs text-on-surface-variant font-bold">Previous Sprint Review</span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface italic leading-relaxed">
            “Zubair wrote cleaner auth endpoints and GraphQL schemas than engineers with 4 years of tenure. Delivered two days ahead of schedule.”
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-on-surface font-bold">— Ayaan Siddiqui, VP of Engineering at HyperTrack</span>
            <span className="font-mono text-[11px] text-primary font-bold">Verified Review</span>
          </div>
        </div>

      </div>
    </div>
  );
}
