import React, { useState } from 'react';
import { 
  GraduationCap, 
  Mail, 
  FileText, 
  Check, 
  X, 
  Clock, 
  ExternalLink, 
  MessageSquare, 
  Award,
  Sparkles
} from 'lucide-react';
import SkillBadge from './SkillBadge.jsx';
import MatchGauge from './MatchGauge.jsx';

export default function ApplicantCard({ 
  application, 
  onUpdateStatus 
}) {
  const [showNote, setShowNote] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState(application.feedback || '');
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);

  const {
    _id,
    studentName,
    studentEmail,
    studentAvatar,
    studentUniversity,
    studentDegree,
    projectTitle,
    matchPercentage,
    matchedSkills = [],
    missingSkills = [],
    coverNote,
    status,
    appliedAt,
    feedback
  } = application;

  const handleStatusChange = (newStatus) => {
    onUpdateStatus(_id, newStatus, feedbackInput);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between">
      
      <div>
        {/* Header: Student Info & Match Gauge */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
          
          <div className="flex items-start gap-3.5">
            <img
              src={studentAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt={studentName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{studentName}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                  status === 'Accepted'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : status === 'Shortlisted'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : status === 'Rejected'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {status}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>{studentUniversity} • {studentDegree}</span>
              </div>

              <div className="text-xs text-indigo-600 font-medium mt-1">
                Applied for: <span className="font-semibold text-slate-800">{projectTitle}</span>
              </div>
            </div>
          </div>

          {/* Prominent Match Gauge Indicator */}
          <div className="shrink-0 sm:self-center">
            <MatchGauge
              percentage={matchPercentage}
              matchedCount={matchedSkills.length}
              totalCount={matchedSkills.length + missingSkills.length}
              size="sm"
            />
          </div>
        </div>

        {/* Skills Breakdown */}
        <div className="py-4 space-y-2.5">
          <div>
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Matched Skills ({matchedSkills.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.map(skill => (
                <SkillBadge key={skill} skill={skill} variant="matched" size="sm" />
              ))}
              {matchedSkills.length === 0 && (
                <span className="text-xs text-slate-400 italic">No skills directly matched</span>
              )}
            </div>
          </div>

          {missingSkills.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Missing Skill Requirements ({missingSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map(skill => (
                  <SkillBadge key={skill} skill={skill} variant="missing" size="sm" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cover Note Section */}
        {coverNote && (
          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 border border-slate-100 mb-4">
            <div className="font-bold text-slate-500 text-[10px] uppercase mb-1">Candidate Statement</div>
            <p className="line-clamp-3 italic">"{coverNote}"</p>
          </div>
        )}

        {/* Feedback Display */}
        {feedback && (
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 mb-4">
            <span className="font-bold text-[10px] uppercase text-indigo-700 block mb-0.5">Recruiter Feedback Note:</span>
            <p>{feedback}</p>
          </div>
        )}
      </div>

      {/* Action Pipeline: Shortlist / Accept / Reject */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date(appliedAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2">
          {status !== 'Shortlisted' && status !== 'Accepted' && (
            <button
              onClick={() => handleStatusChange('Shortlisted')}
              className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Shortlist</span>
            </button>
          )}

          {status !== 'Accepted' && (
            <button
              onClick={() => handleStatusChange('Accepted')}
              className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept</span>
            </button>
          )}

          {status !== 'Rejected' && (
            <button
              onClick={() => handleStatusChange('Rejected')}
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
