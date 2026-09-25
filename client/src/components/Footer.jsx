import React from 'react';
import { Briefcase, Heart, ExternalLink, Sparkles } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Student<span className="text-indigo-400">-Industry</span> Bridge
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bridging higher education and enterprise innovation through transparent, skill-first algorithmic matching.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1.5 rounded-lg w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skill Matching Engine Active</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setActivePage('explore')} className="hover:text-white transition-colors">
                  Explore Projects
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('mentors')} className="hover:text-white transition-colors">
                  Industry Mentors
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('applications')} className="hover:text-white transition-colors">
                  Application Tracker
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('student-dashboard')} className="hover:text-white transition-colors">
                  Student Portal
                </button>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Companies & Partners</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setActivePage('company-dashboard')} className="hover:text-white transition-colors">
                  Post Internships & Projects
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('company-dashboard')} className="hover:text-white transition-colors">
                  Candidate Match Analytics
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('admin-dashboard')} className="hover:text-white transition-colors">
                  Admin Verification
                </button>
              </li>
            </ul>
          </div>

          {/* Algorithm Spec */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Skill Engine Spec</h4>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-300 font-mono">
                <span>Formula:</span>
                <span className="text-indigo-400">|M| / |Required|</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-tight">
                Calculates set intersection of student skills and required specs with canonical alias normalization.
              </p>
              <div className="text-[11px] text-amber-300/90 font-mono">
                Student(3) ∩ Req(3) = 67%
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Student-Industry Bridge. Built for hackathons & university ecosystems.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> React & Express
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
