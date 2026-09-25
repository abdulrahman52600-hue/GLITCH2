import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PostProjectModal from '../components/PostProjectModal.jsx';
import { api } from '../services/api.js';

export default function CompanyDashboardPage({ 
  projects = [], 
  applications = [], 
  onRefreshData,
  onViewProject 
}) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'sprints'
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('All');
  const [searchCandidate, setSearchCandidate] = useState('');

  // Company's projects
  const myProjects = projects.filter(p => 
    p.companyId === user?._id || p.companyName === user?.companyName || user?.role === 'admin'
  );

  // Applications submitted to company's projects
  let companyApplications = applications.filter(a => 
    a.companyId === user?._id || a.companyName === user?.companyName || user?.role === 'admin'
  );

  if (selectedProjectFilter !== 'All') {
    companyApplications = companyApplications.filter(a => a.projectId === selectedProjectFilter);
  }

  if (searchCandidate.trim()) {
    const q = searchCandidate.toLowerCase();
    companyApplications = companyApplications.filter(a => 
      a.studentName?.toLowerCase().includes(q) || 
      (a.studentSkills || []).some(s => s.toLowerCase().includes(q))
    );
  }

  // Sort by highest match % first
  companyApplications.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

  const handleUpdateStatus = async (appId, status) => {
    try {
      const res = await api.updateApplicationStatus(appId, status, `Updated to ${status} by hiring manager.`);
      if (res.success) {
        showToast(`Candidate marked as ${status}!`, 'success');
        if (onRefreshData) onRefreshData();
      } else {
        showToast(res.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Error updating application status', 'error');
    }
  };

  const handlePostSuccess = () => {
    setIsPostModalOpen(false);
    showToast('New micro-sprint published to campus boards!', 'success');
    if (onRefreshData) onRefreshData();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 min-h-screen">
      <div className="flex flex-col w-full pb-6 space-y-4">
        
        {/* Company Profile Header Card */}
        <div className="relative w-full rounded-xl bg-surface-container-lowest p-4 sm:p-6 shadow-sm border border-outline-variant/20 overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent pointer-events-none"></div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="relative w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden border border-outline-variant/15">
              <img 
                className="w-full h-full object-cover" 
                alt="FinFlow Technologies"
                src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBrDzUqjheRtuX_BZD99Fnto3bxL12evFBZcM1H_xaUYdRMi07K3KhpZXImw8qhdVVxEAbAbT_AJmfNalzaSoVBvDNB6IT8bnxH_BcYf--QLbQ7wQ7nlqpVEdHrd5Jvt4pgPzQxnWSzhf1SkAzsWijTLEPkyQ3tAyug3IEUlb8GV_cCe6oe7B306gVUAufwmNdcG93cKfAl0kqhMOD0GLUUcg4yvQk-u5-sZinGl00"}
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary-container rounded-full ring-2 ring-surface-container-lowest flex items-center justify-center">
                <span className="material-symbols-outlined text-[10px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-xl sm:text-2xl text-on-surface truncate">
                  {user?.companyName || 'FinFlow Technologies'}
                </h1>
                <span className="text-xs text-on-surface-variant font-medium">
                  Recruiter Portal • Managed by <strong className="text-on-surface font-bold">{user?.name || 'Ayaan Siddiqui'}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5 text-on-surface-variant flex-wrap text-xs">
                <span className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">location_on</span>
                  San Francisco, CA
                </span>
                <span className="text-outline-variant">•</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-mono text-[11px] text-primary font-bold">
                  Series B
                </span>
              </div>

              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Verified Enterprise Partner
                </span>
                <div className="inline-flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                  <span className="material-symbols-outlined text-[16px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-bold text-on-surface">4.9</span>
                  <span>(18 sprints)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Button Row */}
          <div className="mt-4 pt-2 flex items-center gap-2">
            <button 
              onClick={() => setIsPostModalOpen(true)}
              className="flex-1 h-11 rounded-xl bg-primary-container hover:bg-primary active:scale-[0.98] transition-all text-on-primary text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-primary/20" 
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Post New Micro-Project</span>
            </button>
            <button 
              onClick={() => showToast('Company settings & recruiting webhook configurations saved.', 'info')}
              aria-label="Company Settings" 
              className="w-11 h-11 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-colors border border-outline-variant/15" 
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Metrics (2x2 Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              </span>
              <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Live</span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-extrabold text-on-surface">3</div>
              <div className="text-xs text-on-surface-variant truncate font-medium">Active Sprints</div>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                <span className="material-symbols-outlined text-[18px]">group</span>
              </span>
              <span className="font-mono text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">+4 new</span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-extrabold text-on-surface">12</div>
              <div className="text-xs text-on-surface-variant truncate font-medium">Candidates Reviewing</div>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                <span className="material-symbols-outlined text-[18px]">target</span>
              </span>
              <span className="font-mono text-[10px] font-bold text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded">Top 2%</span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-extrabold text-on-surface">94%</div>
              <div className="text-xs text-on-surface-variant truncate font-medium">Avg Match Score</div>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </span>
              <span className="font-mono text-[10px] font-bold text-[#244b16] bg-[#B8D8A2]/30 px-1.5 py-0.5 rounded">Escrow</span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-extrabold text-on-surface">₹3,80,000</div>
              <div className="text-xs text-on-surface-variant truncate font-medium">Disbursed to Talent</div>
            </div>
          </div>
        </div>

        {/* CANDIDATE PIPELINE MANAGER */}
        <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-sm border border-outline-variant/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-on-surface">Applicant Review Pipeline</h2>
              <p className="text-xs text-on-surface-variant">Ranked automatically by algorithmic tech stack compatibility</p>
            </div>

            {/* Filter by project */}
            <div className="flex items-center gap-2">
              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className="text-xs font-semibold rounded-lg border border-outline-variant/30 px-2.5 py-1.5 bg-surface-container-low text-on-surface focus:outline-none"
              >
                <option value="All">All Projects ({myProjects.length})</option>
                {myProjects.map(p => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Applicant Cards List */}
          <div className="space-y-3">
            {companyApplications.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant text-xs space-y-2">
                <span className="material-symbols-outlined text-[32px] text-outline">group_off</span>
                <p>No applicants currently matching filter criteria.</p>
              </div>
            ) : (
              companyApplications.map(app => {
                const matchScore = app.matchPercentage ?? 96;

                return (
                  <article key={app._id} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-primary/20" 
                          alt={app.studentName}
                          src={app.studentAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBIXfx4rAhfmr-j1tvTrycgZSYhAhJmbRnfpSj95b5Yr8T6_e2CiVVYzlalVrtbd9GLTNSjRvZm1t7q9b3qLJiX4A2G-2xWicEsAIdFhxFp8wcMKQb_OBNfVqSWjkJElANx4y7Jhpctb2Xh4ns_2thsqgvxToPBngjDOrbdv0Vtv5hnEM4ziN9wRin88TUAtBD2huXCJgBc6dkDbrbueu8qLfrK_m3zqin74JznPrPwFcIt-LV_k-pk"}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-bold text-on-surface">{app.studentName}</h3>
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-container font-semibold text-on-surface-variant">
                              {app.studentUniversity || "UC Berkeley"}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-0.5">Applied to: <strong className="text-on-surface font-semibold">{app.projectTitle}</strong></p>
                        </div>
                      </div>

                      {/* Match Badge */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono text-xs font-bold shadow-xs">
                        🎯 {matchScore}% Match
                      </div>
                    </div>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1">
                      {(app.studentSkills || ['React', 'TypeScript', 'Tailwind', 'Next.js', 'Python']).map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[10px] text-on-surface-variant font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Recruiter Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-outline-variant/15 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-on-surface-variant font-medium">Status:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          app.status === 'Accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'Shortlisted'
                            ? 'bg-primary-fixed text-primary'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleUpdateStatus(app._id, 'Shortlisted')}
                          className="px-2.5 py-1 rounded-lg bg-surface-container-high text-primary hover:bg-primary-fixed font-bold text-xs transition-colors"
                          type="button"
                        >
                          Shortlist
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app._id, 'Accepted')}
                          className="px-2.5 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-bold text-xs transition-colors shadow-xs"
                          type="button"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                          className="px-2 py-1 rounded-lg text-outline hover:text-error transition-colors"
                          title="Reject applicant"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

      </div>

      {/* Post Project Modal */}
      <PostProjectModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={handlePostSuccess}
      />
    </div>
  );
}
