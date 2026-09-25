import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import MatchGauge from '../components/MatchGauge.jsx';
import SkillBadge from '../components/SkillBadge.jsx';

export default function HomePage({ 
  projects = [], 
  onViewDetails, 
  onApply, 
  setActivePage 
}) {
  const { switchRole } = useAuth();
  const { showToast } = useToast();

  // Interactive Live Skill Match Simulator state
  const [simStudentSkills, setSimStudentSkills] = useState(['React', 'Python', 'SQL']);
  const [simProjectSkills, setSimProjectSkills] = useState(['React', 'Python', 'Java']);

  const normStudent = simStudentSkills.map(s => s.toLowerCase().trim());
  const matchedSim = simProjectSkills.filter(s => normStudent.includes(s.toLowerCase().trim()));
  const missingSim = simProjectSkills.filter(s => !normStudent.includes(s.toLowerCase().trim()));
  const simMatchPct = simProjectSkills.length > 0 
    ? Math.round((matchedSim.length / simProjectSkills.length) * 100) 
    : 100;

  const toggleStudentSkill = (skill) => {
    if (simStudentSkills.includes(skill)) {
      setSimStudentSkills(simStudentSkills.filter(s => s !== skill));
    } else {
      setSimStudentSkills([...simStudentSkills, skill]);
    }
  };

  const handleSyncGithub = () => {
    showToast('GitHub Account Synced! Verified AST commits imported.', 'success');
  };

  return (
    <div className="w-full pb-20 pt-16">
      
      {/* Top Ambient Glow & Live Announcement Tag */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed shadow-sm">
          <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          <span className="font-mono text-xs font-bold uppercase tracking-wider">University Hackathon Edition 2026</span>
        </div>

        {/* Hero Title & Subtext */}
        <h1 className="mt-4 sm:mt-6 font-sans text-3xl sm:text-5xl lg:text-6xl text-on-surface tracking-tight font-extrabold leading-[1.15]">
          Launch Your Career in <span className="bg-gradient-to-r from-primary via-primary-container to-secondary bg-clip-text text-transparent">2-4 Week</span> Micro-Internships
        </h1>

        <p className="mt-4 font-sans text-sm sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Work directly on production code and real business deliverables. Get paid, earn faculty-backed references, and get hired faster.
        </p>

        {/* Live Community Indicator */}
        <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs sm:text-sm font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span>418 CS &amp; Design students actively matching now</span>
        </div>

      </div>

      {/* Role Toggle / Persona Split Cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Student Card */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-6 shadow-md border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">University Talent</span>
                  <h2 className="text-lg font-bold text-on-surface">For Students</h2>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-full text-xs">
                <span className="material-symbols-outlined text-xs text-primary">verified</span>
                <span className="text-on-surface-variant font-medium">Zero Tuition Fee</span>
              </div>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Match with paid real-world sprints based on your GitHub commits &amp; tech stack. Skip generic resume screens entirely.
            </p>

            {/* Student Mini Preview Box */}
            <div className="mt-4 p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-mono font-bold text-xs">
                  GH
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-semibold text-on-surface">repo: /distributed-cache</span>
                  <span className="text-[11px] text-on-surface-variant">TypeScript • 34 PRs Verified</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1 rounded-full shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="font-mono text-xs font-bold text-primary">98% Match</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              switchRole('student');
              setActivePage('explore');
            }}
            className="mt-6 w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow hover:bg-primary-container active:scale-[0.98] transition-all"
          >
            <span>Explore as Student</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>

        {/* Company Card */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">Engineering Teams</span>
                  <h2 className="text-lg font-bold text-on-surface">For Companies</h2>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-xs text-on-surface-variant font-medium">SOC-2 Ready</span>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Access pre-vetted campus talent with verified technical skills, fast IP assignment, and direct mentorship handoffs.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-surface-container-lowest flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">Active sponsor pipeline:</span>
              <span className="font-bold text-secondary">14 Stanford &amp; Berkeley finalists</span>
            </div>
          </div>

          <button 
            onClick={() => {
              switchRole('company');
              setActivePage('company-dashboard');
            }}
            className="mt-6 w-full py-3 px-4 rounded-xl bg-surface-container-lowest text-on-surface font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-surface-container-high active:scale-[0.98] transition-all border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-base text-secondary">add_circle</span>
            <span>Post a Micro-Project</span>
          </button>
        </div>

      </div>

      {/* Hero Visual Banner: Collegiate Bridge */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <div className="relative w-full rounded-2xl overflow-hidden bg-surface-container-highest shadow-inner p-4">
          <img 
            className="w-full h-44 sm:h-56 object-cover rounded-xl shadow-sm" 
            alt="Dynamic tech incubator laboratory" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU0RUtytHtzdBoD4JQXRCVQwVbBy8yWhFWHl0RbKfqn7wKHwPvqtHSVc3ozNJkZRaheyb8CTVgWMuVqYYuTxCR7tDvkZUriAmwqKlkior-rWsqMANUIs67xhodV1i_tiB-e1dcVFtYH2m-aH4CQn8ifCoCetrNRs8wzaIBAnX1_XkjYSE_4jXuarcm8tX9SJxyiIGfhuUGost46XDkIE3QXJjD1M7c4PgRXhfK0G4"
          />
          <div className="absolute bottom-6 left-6 right-6 p-3 rounded-xl bg-surface-container-lowest/95 backdrop-blur-md flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-secondary text-xl">school</span>
              <div className="truncate">
                <p className="font-semibold text-xs sm:text-sm text-on-surface truncate">Stanford, CMU, Waterloo &amp; MIT</p>
                <p className="text-[11px] text-on-surface-variant">Direct university platform integration</p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full shrink-0">Active 2025</span>
          </div>
        </div>
      </div>

      {/* LIVE INTERACTIVE SKILL-MATCHING SIMULATOR */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
        <div className="rounded-2xl bg-gradient-to-br from-primary via-primary-container to-secondary p-6 sm:p-8 text-on-primary shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-on-primary">calculate</span>
              <h3 className="font-bold text-base sm:text-lg">Live Skill-Matching Engine Calculator</h3>
            </div>
            <span className="font-mono text-xs bg-white/20 px-2.5 py-0.5 rounded-full">Interactive Formula</span>
          </div>

          <p className="text-xs sm:text-sm text-on-primary/90 mb-5">
            Click any skill to see the exact formula <span className="font-mono bg-white/20 px-1 rounded">|Matched| / |Required|</span> calculate in real-time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-xs font-bold uppercase tracking-wider block mb-2">Student Skills (Toggle on/off)</span>
              <div className="flex flex-wrap gap-1.5">
                {['React', 'Python', 'SQL', 'TypeScript', 'Java', 'Docker', 'AWS'].map(s => {
                  const active = simStudentSkills.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStudentSkill(s)}
                      className={`text-xs px-2.5 py-1 rounded-full font-mono transition-all ${
                        active ? 'bg-white text-primary font-bold shadow-sm' : 'bg-white/10 text-white/80'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}{s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block text-white/80">Project Required: React, Python, Java</span>
                <span className="text-[11px] text-white/80 font-mono mt-1 block">
                  Matched: {matchedSim.join(', ') || 'None'} ({matchedSim.length}/3)
                </span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-mono font-extrabold block">{simMatchPct}%</span>
                <span className="text-[10px] uppercase font-bold text-white/90">
                  {simMatchPct >= 80 ? 'High Match' : simMatchPct >= 50 ? 'Strong Match' : 'Developing'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Highlights Metric Grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Real Impact</p>
            <h3 className="text-xl font-bold text-on-surface">Platform Highlights</h3>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">insights</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-2">
              <span className="material-symbols-outlined text-lg">payments</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">₹15k - ₹45k</span>
              <p className="text-xs text-on-surface-variant mt-0.5">Avg stipend per micro-sprint</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-2">
              <span className="material-symbols-outlined text-lg">target</span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">94%</span>
                <span className="font-mono text-[10px] text-primary font-bold">Verified</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">Skill match accuracy</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary mb-2">
              <span className="material-symbols-outlined text-lg">schedule</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">14 Days</span>
              <p className="text-xs text-on-surface-variant mt-0.5">Average sprint turnaround</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-2">
              <span className="material-symbols-outlined text-lg">handshake</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">85+</span>
              <p className="text-xs text-on-surface-variant mt-0.5">Stripe, Datadog &amp; Figma partners</p>
            </div>
          </div>
        </div>

        {/* Company Partner Badges Ticker */}
        <div className="mt-4 p-3 rounded-xl bg-surface-container-low flex items-center justify-around gap-2 text-on-surface-variant font-mono font-bold text-xs tracking-wider">
          <span>STRIPE</span>
          <span className="text-outline-variant">•</span>
          <span>DATADOG</span>
          <span className="text-outline-variant">•</span>
          <span>FIGMA</span>
          <span className="text-outline-variant">•</span>
          <span>NOTION</span>
        </div>
      </div>

      {/* How It Works: 3-Step Visual Flow Cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-12">
        <div className="flex flex-col mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">Frictionless Path</span>
          <h3 className="text-xl font-bold text-on-surface">How Micro-Sprints Work</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">From repo scan to paid corporate reference in three phases.</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">Connect GitHub &amp; Stack</h4>
              <p className="text-xs text-on-surface-variant mt-1">
                Automatic skill extraction pulls validated commits, pull requests, and framework proficiencies in 30 seconds.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">git clone</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">AST analysis</span>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">auto-verified</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary font-bold text-sm flex items-center justify-center shrink-0">
              2
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-on-surface">Instant Match Score</h4>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-mono text-xs font-bold">
                  96% Accuracy
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                AI calculates your compatibility against active open issues, recommending ideal sprints or adjacent tech stacks.
              </p>
              <div className="mt-2 w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary font-bold text-sm flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">Deliver &amp; Dual Review</h4>
              <p className="text-xs text-on-surface-variant mt-1">
                Complete the milestone, transfer branch PR, receive guaranteed escrow payout, and unlock faculty-shareable endorsements.
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-sm">lock</span>
                <span className="font-medium">Escrow Protected Payouts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Tech Stack Horizontal Carousel */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">code</span>
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Trending Tech Stacks</span>
          </div>
          <span className="text-xs text-on-surface-variant">142 Open Sprints</span>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar font-mono text-xs">
          <div className="shrink-0 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            #React
          </div>
          <div className="shrink-0 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface">
            #TypeScript
          </div>
          <div className="shrink-0 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface">
            #Python
          </div>
          <div className="shrink-0 px-3 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">local_fire_department</span>
            #FastAPI
          </div>
          <div className="shrink-0 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface">
            #PyTorch
          </div>
          <div className="shrink-0 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface">
            #TailwindCSS
          </div>
          <div className="shrink-0 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface">
            #NodeJS
          </div>
        </div>
      </div>

      {/* Student Spotlight Proof Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-sm">
          <div className="flex items-center gap-4">
            <img 
              className="w-14 h-14 rounded-full object-cover shadow-sm shrink-0 ring-2 ring-primary-fixed" 
              alt="Zubair Khan" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIXfx4rAhfmr-j1tvTrycgZSYhAhJmbRnfpSj95b5Yr8T6_e2CiVVYzlalVrtbd9GLTNSjRvZm1t7q9b3qLJiX4A2G-2xWicEsAIdFhxFp8wcMKQb_OBNfVqSWjkJElANx4y7Jhpctb2Xh4ns_2thsqgvxToPBngjDOrbdv0Vtv5hnEM4ziN9wRin88TUAtBD2huXCJgBc6dkDbrbueu8qLfrK_m3zqin74JznPrPwFcIt-LV_k-pk"
            />
            <div className="min-w-0 flex-1">
              <div className="flex text-amber-500 text-xs">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs sm:text-sm text-on-surface italic mt-0.5">
                "Shipped an enterprise-grade auth module and webhook terminal in 10 days. Got paid ₹28,000 and a full-time return offer."
              </p>
              <p className="text-xs text-on-surface-variant font-semibold mt-1">
                Zubair Khan • Senior at UC Berkeley
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quick Start CTA Bottom Dock */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary to-secondary text-on-primary shadow-xl flex flex-col items-center text-center relative overflow-hidden">
          <span className="material-symbols-outlined text-3xl mb-2">rocket_launch</span>
          <h3 className="text-xl sm:text-2xl font-bold text-on-primary">Ready to Start Your Sprint?</h3>
          <p className="text-xs sm:text-sm text-on-primary-container mt-1 max-w-sm">
            Connect your GitHub in under 60 seconds and view your match score immediately.
          </p>

          <div className="w-full max-w-md mt-5 flex flex-col gap-2">
            <button 
              onClick={handleSyncGithub}
              className="w-full py-3.5 px-4 rounded-xl bg-surface-container-lowest text-primary font-bold text-sm shadow hover:bg-surface-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">sync_saved_locally</span>
              <span>Sync GitHub Account</span>
            </button>
            <button 
              onClick={() => setActivePage('explore')}
              className="w-full py-2.5 px-4 rounded-xl text-on-primary font-semibold text-xs sm:text-sm hover:bg-on-primary/10 transition-colors"
            >
              Browse 80+ Open Projects Without Account
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-on-primary-container">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">lock</span> Verified Stacks
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">account_balance</span> Direct Deposit
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
