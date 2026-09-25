import React, { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';

export default function ApplicationsPage({ 
  applications = [], 
  onRefreshData,
  onViewProject,
  setActivePage 
}) {
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'in-review' | 'active' | 'completed'
  const [tipDismissed, setTipDismissed] = useState(false);
  const [m3Submitted, setM3Submitted] = useState(false);

  const handleSubmitMilestone3 = () => {
    setM3Submitted(true);
    showToast('Milestone 3 PR package submitted to CloudScale lead mentor!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 min-h-screen">
      <div className="flex flex-col w-full pb-6 space-y-4">
        
        {/* Top Greeting & Scope Indicator */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-xl sm:text-2xl text-on-surface tracking-tight">Applications & Sprints</span>
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              1 active sprint • 2 pending sponsor reviews
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shadow-sm flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">bolt</span>
          </div>
        </div>

        {/* Filter Pills Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`tab-btn px-3.5 py-1.5 rounded-full font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeFilter === 'all'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span>All</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 font-mono text-[11px]">4</span>
          </button>

          <button 
            onClick={() => setActiveFilter('in-review')}
            className={`tab-btn px-3.5 py-1.5 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeFilter === 'in-review'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span>In Review</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container-highest text-on-surface-variant font-mono text-[11px]">2</span>
          </button>

          <button 
            onClick={() => setActiveFilter('active')}
            className={`tab-btn px-3.5 py-1.5 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeFilter === 'active'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span>Active</span>
            <span className="px-1.5 py-0.2 rounded-full bg-primary-fixed text-on-primary-fixed font-mono text-[11px]">1</span>
          </button>

          <button 
            onClick={() => setActiveFilter('completed')}
            className={`tab-btn px-3.5 py-1.5 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeFilter === 'completed'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span>Completed</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container-highest text-on-surface-variant font-mono text-[11px]">6</span>
          </button>
        </div>

        {/* SECTION: ACTIVE SPRINT HIGHLIGHT CARD */}
        {(activeFilter === 'all' || activeFilter === 'active') && (
          <section className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>sprint</span>
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Active Sprint Spotlight</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono text-[11px] font-bold">
                Milestone 3 / 4
              </span>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-md p-4 sm:p-5 space-y-4 border border-outline-variant/20">
              {/* Glow accent corner */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>

              {/* Top Row: Enterprise info & Live tracker */}
              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                    <img 
                      className="w-full h-full object-cover" 
                      alt="CloudScale Inc"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAuDsp4Yw91dFQxK7qw7E4EZ8P-p1Np_Pqr8Ul-t8-lU4Ad-D6KCdZYQU0eSD8MYMahWlsntLLCCSj2nsNiyW5PlwdBvKJsnsM8pzse8KpC3XNuan9Bqidsr-NFTuMx5SZtMrzhZVEdB0FSe4fTqNFJ5WiLKJXch-TOG1DmJfPDhuPYqA10hQABkqUTiROVRzPBXXq-KIChPzZ8-z2F-wSNoCWtDTrNReXZ-emqkc"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold text-on-surface truncate">CloudScale Inc.</span>
                      <span className="w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant truncate font-medium">Auth0 & RBAC Module Sprint</span>
                  </div>
                </div>

                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-mono text-xs font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                    Day 9 of 14
                  </span>
                </div>
              </div>

              {/* Sprint Stepper Tracker */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-on-surface-variant font-mono text-[11px]">
                  <span className="text-primary font-bold">M1 • Architecture</span>
                  <span className="text-primary font-bold">M2 • Auth Flow</span>
                  <span className="text-on-surface font-extrabold underline">M3 • RBAC Matrix</span>
                  <span>M4 • Audit</span>
                </div>
                {/* Stepper track bar */}
                <div className="w-full h-2 rounded-full bg-surface-container flex overflow-hidden">
                  <div className="h-full bg-primary w-2/4"></div>
                  <div className="h-full bg-secondary-container w-1/4 animate-pulse"></div>
                  <div className="h-full bg-transparent w-1/4"></div>
                </div>
              </div>

              {/* Metric Tiles Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-lg bg-surface-container-low flex flex-col justify-between border border-outline-variant/15">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="text-[11px] font-semibold">Next Deliverable</span>
                    <span className="material-symbols-outlined text-[16px] text-error">hourglass_top</span>
                  </div>
                  <div className="mt-1">
                    <div className="text-sm font-bold text-on-surface">Milestone 3</div>
                    <span className="text-xs text-error font-medium">Due in 2 days (48 hrs)</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-container-low flex flex-col justify-between border border-outline-variant/15">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="text-[11px] font-semibold">Sprint Stipend</span>
                    <span className="material-symbols-outlined text-[16px] text-primary">payments</span>
                  </div>
                  <div className="mt-1">
                    <div className="text-sm font-bold text-on-surface">₹25,000</div>
                    <span className="text-xs text-on-surface-variant font-medium">₹12,000 escrow released</span>
                  </div>
                </div>
              </div>

              {/* Lead Mentor Micro-Tile */}
              <div className="p-2.5 rounded-lg bg-surface-container-high/60 flex items-center justify-between border border-outline-variant/15">
                <div className="flex items-center gap-2 min-w-0">
                  <img 
                    className="w-7 h-7 rounded-full object-cover" 
                    alt="Dr. Aris Thorne"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFhVV8Cq-dkl96SVP6-Y_nTWaqnzqk_PHQiLAIRMGHR_EBhqNdC3ikvIAzKygcVS7QqT8FHAoGuTs7G9WgGNPxwUtX2nUpU3kBRE06iC5CTLkjxhpl78Z5ZqsUc51nEKSuQvAE5jOshX8HrxvbmpPwPVREln2SZkAajrtrYOqU6Qzmb88utnuubtryxKzyFqxZ5e4vow5f0h-caA_VhH9ovDiDW5lA0biJbgjUY1k"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-on-surface font-semibold truncate">Dr. Aris Thorne • Lead Staff Mentor</span>
                    <span className="text-[11px] text-on-surface-variant truncate">Next sync: Today, 4:30 PM EST</span>
                  </div>
                </div>
                <button 
                  onClick={() => showToast('Opening direct mentorship chat with Dr. Aris Thorne.', 'info')}
                  className="material-symbols-outlined text-primary text-[18px] hover:scale-110 transition-transform"
                >
                  chat_bubble_outline
                </button>
              </div>

              {/* Action Button Group */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button 
                  onClick={handleSubmitMilestone3}
                  className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                    m3Submitted 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-primary text-on-primary hover:bg-primary-container'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {m3Submitted ? 'check_circle' : 'cloud_upload'}
                  </span>
                  {m3Submitted ? 'Milestone 3 Submitted' : 'Submit Milestone 3'}
                </button>

                <button 
                  onClick={() => showToast('Opening Slack channel #cloudscale-sprint-internal', 'info')}
                  className="w-full py-2.5 px-4 rounded-lg bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">groups</span>
                  Open Slack / Mentorship
                </button>
              </div>
            </div>
          </section>
        )}

        {/* PRO-TIP BANNER */}
        {!tipDismissed && (
          <aside className="p-4 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-start gap-3 shadow-xs relative overflow-hidden border border-tertiary/20">
            <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center flex-shrink-0 text-tertiary">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            </div>
            <div className="flex flex-col min-w-0 pr-4">
              <span className="text-xs font-bold">Pro-Tip for Micro-Interns</span>
              <p className="text-xs text-on-tertiary-fixed leading-relaxed mt-0.5 font-medium">
                Profiles with pinned, production-ready GitHub repos receive sponsor interview callbacks in under 24 hours.
              </p>
            </div>
            <button 
              onClick={() => setTipDismissed(true)}
              aria-label="Dismiss tip" 
              className="absolute top-2.5 right-2.5 text-on-tertiary-fixed/60 hover:text-on-tertiary-fixed" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </aside>
        )}

        {/* SECTION: IN REVIEW APPLICATIONS */}
        {(activeFilter === 'all' || activeFilter === 'in-review') && (
          <section className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">pending_actions</span>
                <h2 className="text-base font-bold text-on-surface">In Review Applications (2)</h2>
              </div>
              <button 
                onClick={() => showToast('Sorted applications by calculated match score.', 'info')}
                className="text-xs font-semibold text-primary flex items-center gap-0.5 hover:underline" 
                type="button"
              >
                Sort by match
                <span className="material-symbols-outlined text-[16px]">swap_vert</span>
              </button>
            </div>

            {/* Application 1: FinFlow Technologies */}
            <article className="p-4 sm:p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col space-y-3 border border-outline-variant/20 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      className="w-full h-full object-cover" 
                      alt="FinFlow Technologies"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWvWV45IkVTAORoMHTq_u5q24SQ7SUlCJJNdXWkCPxB5Ezti-wE8Xl7VS1oYsMO9x30i2VEEHVlFSQUKFY78U-fakoVAGseWmBEOgw7LuMDyhiAjH80QqxZ5eYhai9DBujMlK1zU_ZZAppg84k-7-IlQJjXFuns03Poi23PAOaRhUZ9MHXl2o3bzCdI3djeDPV0eiaKRRoLzTqWniYxOjSxxbgtiFJsWVlPsBUpgs"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-on-surface truncate">FinFlow Technologies</span>
                      <span className="px-1.5 py-0.2 rounded bg-surface-container font-mono text-[10px] text-on-surface-variant font-semibold">Fintech</span>
                    </div>
                    <span 
                      onClick={() => onViewProject && onViewProject('proj_1')}
                      className="text-sm font-bold text-on-surface leading-snug mt-0.5 cursor-pointer hover:text-primary transition-colors"
                    >
                      Build Real-Time Webhook Dashboard
                    </span>
                  </div>
                </div>

                {/* 96% Match Badge with mini SVG ring */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed/60 text-on-primary-fixed flex-shrink-0">
                  <svg className="w-4 h-4 -rotate-90" viewBox="0 0 36 36">
                    <path className="text-surface-container-highest" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                    <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="96, 100" strokeLinecap="round" strokeWidth="4"></path>
                  </svg>
                  <span className="font-mono text-xs font-bold">96%</span>
                </div>
              </div>

              {/* Status Pill & Shortlist Highlight */}
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col space-y-1.5 border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                    <span className="text-xs text-secondary font-bold">Shortlisted</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">Applied yesterday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-mono text-[10px] font-bold">AS</div>
                  <p className="text-xs text-on-surface truncate">
                    Reviewed & shortlisted by <span className="font-bold">Ayaan Siddiqui</span> (Lead Architect)
                  </p>
                </div>
              </div>

              {/* Attached Github Repo Badge */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-high/40 border border-outline-variant/15">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">terminal</span>
                  <span className="font-mono text-xs text-on-surface truncate font-semibold">
                    github.com/zubairkhan-dev/webhook-visualizer
                  </span>
                </div>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="material-symbols-outlined text-[16px] text-primary flex-shrink-0"
                >
                  open_in_new
                </a>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button 
                  onClick={() => onViewProject && onViewProject('proj_1')}
                  className="flex-1 py-2 px-3 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
                  type="button"
                >
                  <span>View Application</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
                <button 
                  onClick={() => showToast('Opening direct channel with Ayaan Siddiqui (FinFlow).', 'info')}
                  aria-label="FinFlow Messages" 
                  className="w-9 h-9 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">forum</span>
                </button>
              </div>
            </article>

            {/* Application 2: HealthBridge AI */}
            <article className="p-4 sm:p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col space-y-3 border border-outline-variant/20 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      className="w-full h-full object-cover" 
                      alt="HealthBridge AI"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBh2GByxwJS15tDmtniQTbGtUSix6ZtnCJrryNrkm4xpXNMb298BU3gwSnOj4vJvDyJeLBzsm2WpVeHQKweCaZqkwj2dWn-1ClaLV1qZdIy4sY1d1iDCTVHiu4ew4f989uHKHm2hgg5KWSChEnxTo8QP7nH14zjCa8LZpS5rRBcQqeolGqKjIIsm3qcI6vX1rm8MXdZksDmlDPmMqlJ3gG_kEaoQ1_e5GvHdHTczM"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-on-surface truncate">HealthBridge AI</span>
                      <span className="px-1.5 py-0.2 rounded bg-surface-container font-mono text-[10px] text-on-surface-variant font-semibold">HealthTech</span>
                    </div>
                    <span 
                      onClick={() => onViewProject && onViewProject('proj_2')}
                      className="text-sm font-bold text-on-surface leading-snug mt-0.5 cursor-pointer hover:text-primary transition-colors"
                    >
                      FHIR Data Ingestion Pipeline
                    </span>
                  </div>
                </div>

                {/* 91% Match Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed flex-shrink-0">
                  <svg className="w-4 h-4 -rotate-90" viewBox="0 0 36 36">
                    <path className="text-surface-container-highest" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                    <path className="text-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="91, 100" strokeLinecap="round" strokeWidth="4"></path>
                  </svg>
                  <span className="font-mono text-xs font-bold">91%</span>
                </div>
              </div>

              {/* Status Highlight: Under Faculty Review */}
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col space-y-1.5 border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">hourglass_bottom</span>
                    <span className="text-xs text-tertiary font-bold">Review in Progress</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">Applied 3 days ago</span>
                </div>
                <p className="text-xs text-on-surface">
                  Under Faculty & Sponsor Review • Co-op credit approval pending
                </p>
              </div>

              {/* Skill tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface-variant font-semibold">Python</span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface-variant font-semibold">HL7 / FHIR</span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-on-surface-variant font-semibold">Apache Kafka</span>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed/40 text-primary font-mono text-[11px] font-bold">+3 verified</span>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button 
                  onClick={() => showToast('Application notes updated with latest GitHub branch.', 'info')}
                  className="flex-1 py-2 px-3 rounded-lg bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-1.5"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  Withdraw or Edit
                </button>
                <button 
                  onClick={() => showToast('Next review milestone: Friday 5:00 PM PST', 'info')}
                  className="py-2 px-3 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-bold hover:text-on-surface flex items-center justify-center"
                  type="button"
                >
                  Timeline
                </button>
              </div>
            </article>
          </section>
        )}

        {/* QUICK ACTION / DISCOVERY TEASER */}
        <div className="p-4 rounded-xl bg-surface-container flex items-center justify-between gap-3 border border-outline-variant/15">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">travel_explore</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-on-surface truncate">Ready for another challenge?</span>
              <span className="text-[11px] text-on-surface-variant truncate">14 sprints match your verified Python skills</span>
            </div>
          </div>
          <button 
            onClick={() => setActivePage && setActivePage('explore')}
            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary text-xs font-bold shadow-xs hover:bg-white flex-shrink-0 flex items-center gap-1"
            type="button"
          >
            Browse
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  );
}
