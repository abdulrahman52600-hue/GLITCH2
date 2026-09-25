import React from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';
import SkillBadge from './SkillBadge.jsx';
import MatchGauge from './MatchGauge.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProjectCard({ 
  project, 
  onViewDetails, 
  onApply,
  userApplications = [] 
}) {
  const { role, user } = useAuth();

  // Check if current student has applied
  const existingApp = userApplications.find(a => a.projectId === project._id);
  const hasApplied = Boolean(existingApp);

  const isStudent = role === 'student';
  const matchPct = project.matchPercentage;
  const matchedSkills = project.matchedSkills || [];
  const missingSkills = project.missingSkills || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Banner & Company Header */}
      <div className="p-5 sm:p-6 pb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          
          <div className="flex items-center gap-3">
            <img
              src={project.companyLogo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"}
              alt={project.companyName}
              className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm shrink-0"
            />
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>{project.companyName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="text-slate-400 font-normal">{project.industry}</span>
              </h4>
              <h3 
                onClick={() => onViewDetails(project._id)}
                className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors leading-snug line-clamp-1"
              >
                {project.title}
              </h3>
            </div>
          </div>

          {/* Type Badge */}
          <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
            project.type === 'Internship'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : project.type === 'Fellowship'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {project.type}
          </span>
        </div>

        {/* Key Metadata Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-4 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1 text-slate-700 font-semibold">
            <IndianRupee className="w-3.5 h-3.5 text-primary" />
            <span>{project.stipend}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{project.duration}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{project.location}</span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* SKILL MATCHING SECTION (The core feature) */}
        {isStudent && matchPct !== null && matchPct !== undefined ? (
          <div className="mb-4">
            <MatchGauge
              percentage={matchPct}
              matchedCount={matchedSkills.length}
              totalCount={project.requiredSkills?.length || 0}
              showDetails={false}
            />

            {/* Matched & Missing Chips Preview */}
            <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
              {matchedSkills.map(skill => (
                <SkillBadge key={skill} skill={skill} variant="matched" size="sm" />
              ))}
              {missingSkills.map(skill => (
                <SkillBadge key={skill} skill={skill} variant="missing" size="sm" />
              ))}
            </div>
          </div>
        ) : (
          /* Neutral Skill list for Company / General view */
          <div className="mb-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Required Skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.requiredSkills?.map(skill => (
                <SkillBadge key={skill} skill={skill} variant="neutral" size="sm" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: Deadline & Action Buttons */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Apply by {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(project._id)}
            className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            Details
          </button>

          {isStudent && (
            hasApplied ? (
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border ${
                existingApp.status === 'Accepted'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : existingApp.status === 'Shortlisted'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{existingApp.status}</span>
              </span>
            ) : (
              <button
                onClick={() => onApply(project)}
                className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
              >
                <span>Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )
          )}

          {role === 'company' && project.companyId === user?._id && (
            <span className="text-xs font-semibold text-slate-500">
              {project.applicantsCount || 0} applicant{project.applicantsCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
