import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ExploreProjectsPage({ 
  projects = [], 
  applications = [], 
  onViewDetails, 
  onApply 
}) {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [appliedSprints, setAppliedSprints] = useState(new Set());

  // Show Quick Apply Toast
  const triggerQuickApply = (sprintTitle, project) => {
    setAppliedSprints(prev => new Set(prev).add(sprintTitle));
    setToastMessage(`Applied to ${sprintTitle}!`);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 4000);

    if (onApply && project) {
      onApply(project);
    }
  };

  // Filter projects logic
  const filteredProjects = projects.filter(p => {
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchComp = p.companyName.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchSkills = (p.requiredSkills || []).some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchComp && !matchDesc && !matchSkills) return false;
    }

    // Filter pill logic
    if (activeFilter === 'high-match') {
      return (p.matchPercentage || 0) >= 90;
    }
    if (activeFilter === 'fullstack') {
      const skills = (p.requiredSkills || []).join(' ').toLowerCase();
      return skills.includes('react') || skills.includes('next') || skills.includes('fullstack') || skills.includes('typescript');
    }
    if (activeFilter === 'ai-ml') {
      const text = (p.title + ' ' + p.industry + ' ' + (p.requiredSkills || []).join(' ')).toLowerCase();
      return text.includes('ai') || text.includes('ml') || text.includes('fhir') || text.includes('python');
    }
    if (activeFilter === 'design') {
      const text = (p.title + ' ' + (p.requiredSkills || []).join(' ')).toLowerCase();
      return text.includes('frontend') || text.includes('ui') || text.includes('telemetry') || text.includes('chart') || text.includes('tailwind');
    }
    if (activeFilter === 'duration') {
      const dur = (p.duration || '').toLowerCase();
      return dur.includes('2 week') || dur.includes('2.5 week') || dur.includes('3 week') || dur.includes('14 day');
    }

    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 min-h-screen">
      <div className="flex flex-col w-full space-y-4">
        
        {/* Student Algorithmic Match Banner */}
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-fixed via-surface-container-high to-surface-container p-4 sm:p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <img 
                  className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-primary-fixed" 
                  alt="Zubair Khan" 
                  src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBIXfx4rAhfmr-j1tvTrycgZSYhAhJmbRnfpSj95b5Yr8T6_e2CiVVYzlalVrtbd9GLTNSjRvZm1t7q9b3qLJiX4A2G-2xWicEsAIdFhxFp8wcMKQb_OBNfVqSWjkJElANx4y7Jhpctb2Xh4ns_2thsqgvxToPBngjDOrbdv0Vtv5hnEM4ziN9wRin88TUAtBD2huXCJgBc6dkDbrbueu8qLfrK_m3zqin74JznPrPwFcIt-LV_k-pk"}
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-primary-container flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-sm text-on-primary-fixed truncate">{user?.name || 'Zubair Khan'}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-primary text-on-primary font-mono text-[10px] font-bold">Active Hunter</span>
                </div>
                <p className="text-xs text-on-surface-variant truncate font-medium">
                  {user?.university ? `${user.university} • ${user.major || 'CS'} '${user.gradYear || '25'}` : "Cal Berkeley • CS '25"}
                </p>
              </div>
            </div>
            
            <button 
              aria-label="Skill Match Settings" 
              className="w-9 h-9 rounded-full bg-surface-container-lowest/80 flex items-center justify-center text-primary shadow-sm hover:bg-surface-container-lowest transition-all" 
              type="button"
              onClick={() => showToast('Skill graph matched against live GitHub AST commits.', 'info')}
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>

          {/* Verified Skill Graph Pill Stack */}
          <div className="mt-3 pt-1 relative z-10">
            <div className="flex items-center justify-between text-on-surface-variant mb-1.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-semibold">Matched against verified stack</span>
              <span className="font-mono text-[11px] font-bold text-on-primary-fixed">5/5 Verified</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(user?.skills && user.skills.length > 0 ? user.skills.slice(0, 5) : ['React', 'TypeScript', 'Next.js', 'Tailwind', 'Python']).map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-on-surface font-mono text-xs shadow-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Search & Filter Controls */}
        <section className="space-y-2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-10 pr-10 rounded-xl bg-surface-container-lowest text-on-surface text-sm placeholder:text-outline shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all border border-outline-variant/30" 
              placeholder="Search sprints, stacks, or founders..." 
              type="text"
            />
            {search ? (
              <button 
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary transition-colors" 
                type="button"
              >
                <span className="material-symbols-outlined text-[19px]">close</span>
              </button>
            ) : (
              <button 
                aria-label="Voice Search" 
                onClick={() => showToast('Voice search listening... (Speak "Full-Stack Sprints")', 'info')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary transition-colors" 
                type="button"
              >
                <span className="material-symbols-outlined text-[19px]">mic</span>
              </button>
            )}
          </div>

          {/* Filter Pills Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`filter-btn flex-shrink-0 px-3.5 py-1.5 rounded-full font-semibold text-xs shadow-sm transition-all active:scale-95 ${
                activeFilter === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              All
            </button>
            
            <button 
              onClick={() => setActiveFilter('high-match')}
              className={`filter-btn flex-shrink-0 px-3.5 py-1.5 rounded-full font-semibold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1 ${
                activeFilter === 'high-match'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              High Match (90%+)
            </button>

            <button 
              onClick={() => setActiveFilter('fullstack')}
              className={`filter-btn flex-shrink-0 px-3.5 py-1.5 rounded-full font-semibold text-xs shadow-sm transition-all active:scale-95 ${
                activeFilter === 'fullstack'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              Full-Stack
            </button>

            <button 
              onClick={() => setActiveFilter('ai-ml')}
              className={`filter-btn flex-shrink-0 px-3.5 py-1.5 rounded-full font-semibold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1 ${
                activeFilter === 'ai-ml'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">psychology</span>
              AI/ML
            </button>

            <button 
              onClick={() => setActiveFilter('design')}
              className={`filter-btn flex-shrink-0 px-3.5 py-1.5 rounded-full font-semibold text-xs shadow-sm transition-all active:scale-95 ${
                activeFilter === 'design'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              Design/UI
            </button>

            <button 
              onClick={() => setActiveFilter('duration')}
              className={`filter-btn flex-shrink-0 px-3.5 py-1.5 rounded-full font-semibold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1 ${
                activeFilter === 'duration'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-outline">timer</span>
              Under 3 Weeks
            </button>
          </div>
        </section>

        {/* Section Feed Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-on-surface">Recommended Sprints</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-[11px] font-semibold">
              {filteredProjects.length} Available
            </span>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">sort</span>
            <span className="text-xs font-semibold">Relevance</span>
          </div>
        </div>

        {/* SPRINT CARDS FEED */}
        <div className="space-y-4">
          
          {filteredProjects.map((proj, idx) => {
            const isApplied = appliedSprints.has(proj.title) || applications.some(a => a.projectId === proj._id);
            const matchScore = proj.matchPercentage ?? (idx === 0 ? 96 : idx === 1 ? 91 : 78);
            const isRelatedMatch = matchScore < 85;

            return (
              <div key={proj._id || idx} className="space-y-2">
                {/* Special Adjacent Alert Box for Related sprint */}
                {isRelatedMatch && idx === 2 && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-tertiary-fixed/60 text-on-tertiary-fixed shadow-xs">
                    <span className="material-symbols-outlined text-[20px] text-tertiary flex-shrink-0 mt-0.5">lightbulb</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">No exact 100% match?</span>
                      <span className="text-xs text-on-tertiary-fixed-variant">Recommended based on your strong adjacent React and telemetry skills.</span>
                    </div>
                  </div>
                )}

                <article className="relative flex flex-col rounded-xl bg-surface-container-lowest p-4 sm:p-5 shadow-md space-y-4 transition-all hover:shadow-lg border border-outline-variant/20">
                  
                  {/* Top Meta Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        className="w-11 h-11 rounded-lg object-cover bg-surface-container shadow-xs flex-shrink-0" 
                        alt={proj.companyName}
                        src={proj.companyLogo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80"}
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-on-surface truncate">{proj.companyName}</span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-mono text-[10px] tracking-tight font-semibold">
                            {proj.badge || (idx === 0 ? 'YC W24' : idx === 1 ? 'Series A' : 'Autonomous Fleet')}
                          </span>
                        </div>
                        <span className="text-xs text-on-surface-variant truncate font-medium">{proj.industry || 'B2B Software'}</span>
                      </div>
                    </div>

                    {/* Skill Match Badge */}
                    {matchScore >= 90 ? (
                      <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono text-xs font-bold shadow-xs">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                        </span>
                        🎯 {matchScore}% Skill Match
                      </div>
                    ) : (
                      <div className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface font-mono text-xs font-bold shadow-xs">
                        ⚡ {matchScore}% Related
                      </div>
                    )}
                  </div>

                  {/* Adjacent Skill Opportunity Banner if applicable */}
                  {isRelatedMatch && (
                    <div className="p-2 rounded-lg bg-surface-container-low flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-secondary">swap_horiz</span>
                      <p className="text-xs text-on-surface-variant">
                        <strong className="text-on-surface">Vue.js needed</strong> — your React knowledge qualifies you instantly!
                      </p>
                    </div>
                  )}

                  {/* Sprint Title & Value Prop */}
                  <div className="space-y-1">
                    <h3 
                      onClick={() => onViewDetails && onViewDetails(proj._id)}
                      className="text-base sm:text-lg font-bold text-on-surface leading-snug cursor-pointer hover:text-primary transition-colors"
                    >
                      {proj.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  {/* Micro Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-on-surface-variant text-xs py-1.5 bg-surface-container-low px-3 rounded-lg font-medium">
                    <div className="flex items-center gap-1 text-on-surface font-semibold">
                      <span className="material-symbols-outlined text-[17px] text-tertiary">payments</span>
                      <span>{proj.stipend || '₹28,000 Stipend'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[17px] text-outline">schedule</span>
                      <span>{proj.duration || '2 Weeks'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[17px] text-outline">public</span>
                      <span>{proj.location || 'Remote'}</span>
                    </div>
                  </div>

                  {/* Required Competencies / Skill Stack */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                        {isRelatedMatch ? 'Skill Conversion Track' : 'Required Competencies'}
                      </span>
                      <span className="font-mono text-[11px] text-primary font-bold">
                        {isRelatedMatch 
                          ? '+14% Match Lift' 
                          : idx === 1 
                          ? '+1 Upskill Vector' 
                          : 'All Matched'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {isRelatedMatch ? (
                        <>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono text-xs font-semibold">
                            React <span className="material-symbols-outlined text-[13px]">arrow_forward</span> Vue.js
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed/60 text-on-primary-fixed-variant font-mono text-xs font-semibold">
                            WebSockets <span className="material-symbols-outlined text-[13px] font-bold text-primary">check</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed/60 text-on-primary-fixed-variant font-mono text-xs font-semibold">
                            Chart.js <span className="material-symbols-outlined text-[13px] font-bold text-primary">check</span>
                          </span>
                        </>
                      ) : (
                        (proj.requiredSkills || ['React', 'TypeScript', 'Tailwind', 'Next.js']).map((skill, sIdx) => {
                          const isLearning = idx === 1 && skill.toLowerCase().includes('docker');
                          return (
                            <span 
                              key={skill}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-xs font-semibold ${
                                isLearning 
                                  ? 'bg-tertiary-fixed text-on-tertiary-fixed' 
                                  : 'bg-primary-fixed/60 text-on-primary-fixed-variant'
                              }`}
                            >
                              {skill}
                              {isLearning ? (
                                <span className="text-[10px] text-tertiary font-bold">(Learning +5%)</span>
                              ) : (
                                <span className="material-symbols-outlined text-[13px] font-bold text-primary">check</span>
                              )}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Urgency Footer & Actions */}
                  <div className="pt-2 flex flex-col space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-error font-semibold">
                        <span className="material-symbols-outlined text-[16px]">alarm</span>
                        {proj.urgencyText || 'Starts in 3 days'}
                      </span>
                      <span className="text-on-surface-variant font-medium">4 spots left</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button 
                        onClick={() => onViewDetails && onViewDetails(proj._id)}
                        className="w-full py-2.5 px-3 rounded-lg bg-surface-container-high text-on-surface text-xs font-bold text-center hover:bg-surface-variant transition-colors active:scale-98" 
                        type="button"
                      >
                        View Details
                      </button>

                      {isApplied ? (
                        <button 
                          disabled
                          className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold text-center shadow-sm flex items-center justify-center gap-1.5 opacity-90 cursor-default" 
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>Applied</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => triggerQuickApply(proj.title, proj)}
                          className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold text-center shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                            isRelatedMatch 
                              ? 'bg-secondary text-on-secondary hover:bg-secondary-container' 
                              : 'bg-primary text-on-primary hover:bg-primary-container'
                          }`}
                          type="button"
                        >
                          <span>{isRelatedMatch ? 'Apply with Bridge' : 'Quick Apply'}</span>
                          <span className="material-symbols-outlined text-[16px]">
                            {isRelatedMatch ? 'trending_up' : 'bolt'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                </article>
              </div>
            );
          })}

        </div>

        {/* Micro-Feedback Bottom State */}
        <div className="pt-6 pb-4 flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant shadow-sm">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <span className="font-bold text-sm text-on-surface">You're all caught up on top matches!</span>
          <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
            Our matching algorithm rescans university sprint boards every 4 hours for newly funded tech incubators.
          </p>
        </div>

      </div>

      {/* Quick Apply Feedback Toast Component */}
      <div 
        className={`fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 transform transition-all duration-300 ${
          toastVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-32 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-inverse-surface text-inverse-on-surface p-4 rounded-xl shadow-2xl flex items-center justify-between gap-3 border border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate text-white">{toastMessage || 'Application Submitted!'}</span>
              <span className="text-[11px] text-outline-variant truncate">Fast-tracked to founder review via student match score.</span>
            </div>
          </div>
          <button 
            onClick={() => setToastVisible(false)}
            className="text-inverse-on-surface hover:text-white p-1" 
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

    </div>
  );
}
