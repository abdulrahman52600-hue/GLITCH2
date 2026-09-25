import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ApplicantCard from '../components/ApplicantCard.jsx';

export default function ProjectDetailsPage({ 
  project, 
  applications = [], 
  onBack, 
  onApply, 
  onUpdateStatus 
}) {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [hasAppliedLocal, setHasAppliedLocal] = useState(false);

  if (!project) return null;

  // Check if current student has applied
  const existingApp = applications.find(a => a.projectId === project._id && a.studentId === user?._id);
  const isApplied = hasAppliedLocal || Boolean(existingApp);

  // Applicants for this specific project (when viewed by company or admin)
  const projectApplicants = applications.filter(a => a.projectId === project._id);
  const isCompanyOwner = role === 'company' && (project.companyId === user?._id || project.companyName === user?.companyName);
  const isAdmin = role === 'admin';

  const matchPct = project.matchPercentage ?? 96;

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    showToast(!isBookmarked ? 'Sprint saved to bookmarks!' : 'Removed from bookmarks.', 'info');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: `Check out this sprint on NexBridge: ${project.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Sprint link copied to clipboard!', 'success');
    }
  };

  const handleAskMentor = () => {
    const mentorName = project.leadMentor?.name || 'Ayaan Siddiqui';
    const query = prompt(`Ask ${mentorName} a question about this sprint:`);
    if (query && query.trim()) {
      showToast(`Question sent to ${mentorName} via NexBridge Mentor Sync!`, 'success');
    }
  };

  const handleApplyClick = () => {
    if (isApplied) return;
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setHasAppliedLocal(true);
      showToast('Application successfully submitted with GitHub & verified skills!', 'success');
      if (onApply) onApply(project);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-32 min-h-screen">
      <div className="flex flex-col w-full space-y-5">
        
        {/* Top Breadcrumb & Status Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
              title="Go back"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-mono text-xs font-semibold">
              {project.sprintCode || 'SPRINT-FIN-409'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#B8D8A2]/20 border border-[#B8D8A2]/50 text-[#274c19] text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8D8A2]"></span>
              Active Intake
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              aria-label="Share sprint" 
              className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors" 
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
            <button 
              onClick={handleBookmarkToggle}
              aria-label="Save project" 
              className={`w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center transition-colors ${
                isBookmarked ? 'text-primary' : 'text-on-surface hover:bg-surface-container-high'
              }`}
              type="button"
            >
              <span 
                className="material-symbols-outlined text-[20px]" 
                style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
              >
                {isBookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>
          </div>
        </div>

        {/* SECTION: COMPANY & SPRINT OVERVIEW */}
        <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-sm space-y-4 border border-outline-variant/20 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm flex-shrink-0 overflow-hidden">
                {project.companyLogo ? (
                  <img src={project.companyLogo} alt={project.companyName} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[32px]">sync_alt</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-on-surface truncate">{project.companyName}</h2>
                  <span className="inline-flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-full text-primary text-xs font-semibold flex-shrink-0">
                    <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Verified
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {project.industry || 'FinTech'} • {project.stage || 'Series B (₹350 Cr)'} • {project.location || 'San Francisco, CA'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface leading-tight">
              {project.title}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* 4-Stat Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-3 rounded-lg bg-surface-container-low flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-on-surface-variant block font-medium">Stipend</span>
                <span className="text-sm font-bold text-on-surface">{project.stipend || '₹28,000 Stipend'}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-on-surface-variant block font-medium">Duration</span>
                <span className="text-sm font-bold text-on-surface">{project.duration || '2 Weeks'}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-tertiary flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">supervisor_account</span>
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-on-surface-variant block font-medium">Team Support</span>
                <span className="text-sm font-bold text-on-surface truncate block">1:1 Staff Eng</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">school</span>
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-on-surface-variant block font-medium">Level</span>
                <span className="text-sm font-bold text-on-surface truncate block">Undergrad / Grad</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: ALGORITHMIC TALENT MATCH GAUGE */}
        <section className="bg-gradient-to-br from-primary-fixed/40 via-surface-container-lowest to-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-sm space-y-4 border border-outline-variant/20">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#2f5c1d] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="font-bold text-base text-on-surface">Algorithmic Talent Match</h3>
              </div>
              <p className="text-xs text-on-surface-variant">Parsed from your verified GitHub commits and portfolio</p>
            </div>

            {/* Circular SVG Ring Gauge */}
            <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-full bg-[#B8D8A2]/15">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path 
                  className="text-surface-container-highest" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3.5"
                />
                <path 
                  style={{ color: '#B8D8A2' }} 
                  className="transition-all duration-1000 ease-out" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeDasharray={`${matchPct}, 100`} 
                  strokeLinecap="round" 
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute font-mono text-sm text-[#274c19] font-bold">{matchPct}%</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#B8D8A2]/20 border border-[#B8D8A2]/50 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#274c19] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            <p className="text-xs sm:text-sm text-[#274c19] font-bold">
              You are a {matchPct}% Match for this sprint!
            </p>
          </div>

          {/* Matched Profile Qualifications Checklist */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">Matched Profile Qualifications</span>
            
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-surface-container-lowest shadow-xs flex items-start gap-2.5 border border-outline-variant/15">
                <span className="w-5 h-5 rounded-full bg-[#B8D8A2]/30 text-[#274c19] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-on-surface">React 18 & Hooks <span className="text-error font-normal text-[11px]">(Required)</span></p>
                  <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                    Matches portfolio repo 
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-[#B8D8A2]/20 border border-[#B8D8A2]/50 font-mono text-[10px] text-[#274c19] font-bold">
                      webhook-visualizer
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-lowest shadow-xs flex items-start gap-2.5 border border-outline-variant/15">
                <span className="w-5 h-5 rounded-full bg-[#B8D8A2]/30 text-[#274c19] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-on-surface">TypeScript Strict Mode <span className="text-error font-normal text-[11px]">(Required)</span></p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Verified on GitHub via 24 production commits</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-lowest shadow-xs flex items-start gap-2.5 border border-outline-variant/15">
                <span className="w-5 h-5 rounded-full bg-[#B8D8A2]/30 text-[#274c19] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-on-surface">Tailwind CSS <span className="text-error font-normal text-[11px]">(Required)</span></p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Verified proficiency across 3 public projects</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-lowest shadow-xs flex items-start gap-2.5 border border-outline-variant/15">
                <span className="w-5 h-5 rounded-full bg-[#B8D8A2]/30 text-[#274c19] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-on-surface">REST & WebSocket Consumption <span className="text-secondary font-normal text-[11px]">(Preferred)</span></p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Matched past academic network laboratory assignment</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-highest/60 flex items-start gap-2.5 border border-outline-variant/15">
                <span className="w-5 h-5 rounded-full bg-[#B8D8A2]/30 text-[#274c19] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] font-bold">priority_high</span>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-on-surface">Redis Pub/Sub Concepts <span className="text-tertiary font-normal text-[11px]">(Nice to have)</span></p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Bonus technical guide & architecture slides unlocked upon start</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: DELIVERABLES ROADMAP */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-on-surface">Deliverables Roadmap</h3>
              <p className="text-xs text-on-surface-variant">Escrow payouts released as milestones pass CI checks</p>
            </div>
            <span className="font-mono text-xs bg-surface-container px-2.5 py-1 rounded-full text-on-surface font-semibold">
              3 Milestones
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Milestone 1 */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-2 border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-mono text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">flag</span>
                  Day 1 – 4
                </span>
                <span className="text-sm font-bold text-primary">₹8,000</span>
              </div>
              <h4 className="text-sm font-bold text-on-surface">Milestone 1: UI Scaffold & Mock Stream</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Implement reactive dashboard layout using Tailwind CSS. Setup simulated EventEmitter that dispatches incoming mock webhook payloads (Stripe, Twilio, Sendgrid schemas) at 2 Hz.
              </p>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface-variant">React 18</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface-variant">Tailwind</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface-variant">Figma Hand-off</span>
              </div>
            </div>

            {/* Milestone 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-2 border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  Day 5 – 10
                </span>
                <span className="text-sm font-bold text-primary">₹12,000</span>
              </div>
              <h4 className="text-sm font-bold text-on-surface">Milestone 2: WebSocket Feed & Filtering Engine</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Connect to staging WebSocket endpoint. Add real-time query filtering by HTTP response status code (200 OK vs 500 error bursts) with syntax-highlighted JSON viewer.
              </p>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface-variant">WebSockets</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface-variant">JSON Schema</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface-variant">Zod Validation</span>
              </div>
            </div>

            {/* Milestone 3 */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-2 border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">replay</span>
                  Day 11 – 14
                </span>
                <span className="text-sm font-bold text-primary">₹8,000</span>
              </div>
              <h4 className="text-sm font-bold text-on-surface">Milestone 3: Retries Action Trigger & PR Merged</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Build manual exponential back-off trigger buttons to initiate replay requests to backend workers. Submit production-ready GitHub PR with clean unit tests.
              </p>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface-variant">Vitest</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface-variant">PR Review</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface-variant">Docker Sandbox</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: LEAD MENTOR */}
        <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-sm space-y-3 border border-outline-variant/20">
          <div className="flex items-center gap-3">
            <img 
              className="w-14 h-14 rounded-full object-cover shadow-sm flex-shrink-0" 
              alt="Ayaan Siddiqui" 
              src={project.leadMentor?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCJuuxNkh6whyCVTFBsqnUBhPlh3AJYDh3QBVBQsEidJ0ZnjJ-thhZDhHb9LOgn3uB3AGfZK_FBz5EEMomRMKOcd7yhhqFVWFGs1F-FcBa87OUObHjVurDiXDPhkuzFbLHfGTdCTjK-NhY2EQDG-nZ__0XrcO3MjouhbzDQzn0AQ35pusjoapqXsqZpa4c4S61rv8iPTh7bGaW9VAfty99Px7xRc5z4H1CpvuDr4uEkP1Kg-yEjkz8P"}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-on-surface truncate">{project.leadMentor?.name || 'Ayaan Siddiqui'}</h4>
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <p className="text-xs text-on-surface-variant">{project.leadMentor?.role || 'Lead Infrastructure Architect'} • {project.companyName}</p>
              <p className="text-xs text-primary font-medium mt-0.5">{project.leadMentor?.tagline || 'Ex-Stripe Core Infra • 14 micro-interns mentored'}</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-surface-container-low text-xs text-on-surface-variant italic leading-relaxed">
            "Our team is building resilient transaction infrastructure. You will work on an actual internal engineering console that our on-call engineers will touch daily. Looking forward to pairing on design decisions!"
          </div>
        </section>

        {/* RECRUITER / COMPANY OWNER PIPELINE (When company owns this project) */}
        {(isCompanyOwner || isAdmin) && (
          <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-sm space-y-4 border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-on-surface">Candidate Review Pipeline</h3>
                <p className="text-xs text-on-surface-variant">{projectApplicants.length} applicants for this posting</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-mono text-xs font-bold">
                Recruiter View
              </span>
            </div>

            {projectApplicants.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-4 text-center">No applicants yet for this listing.</p>
            ) : (
              <div className="space-y-3">
                {projectApplicants.map(app => (
                  <ApplicantCard
                    key={app._id}
                    application={app}
                    onUpdateStatus={(appId, status, feedback) => {
                      if (onUpdateStatus) onUpdateStatus(appId, status, feedback);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

      </div>

      {/* FIXED BOTTOM FLOATING DOCK */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/90 backdrop-blur-xl px-4 py-3 shadow-xl flex items-center gap-3 border-t border-outline-variant/20">
        <div className="max-w-4xl mx-auto w-full flex items-center gap-3">
          <button 
            onClick={handleAskMentor}
            aria-label="Ask Mentor a Question" 
            className="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-container-highest active:scale-95 transition-all flex-shrink-0 shadow-xs" 
            title="Ask Mentor a Question"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">chat</span>
          </button>

          {isApplied ? (
            <div className="flex-1 h-12 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Application Submitted to {project.companyName}</span>
            </div>
          ) : (
            <button 
              disabled={isApplying}
              onClick={handleApplyClick}
              className="flex-1 h-12 bg-primary text-on-primary rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:bg-primary-container active:scale-[0.98] transition-all"
              type="button"
            >
              {isApplying ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  <span>Syncing GitHub & Applying...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  <span>Apply with Profile & GitHub</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
