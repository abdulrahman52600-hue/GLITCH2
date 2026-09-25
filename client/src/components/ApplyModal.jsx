import React, { useState } from 'react';
import { X, Send, Sparkles, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import MatchGauge from './MatchGauge.jsx';
import SkillBadge from './SkillBadge.jsx';

export default function ApplyModal({ project, isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [coverNote, setCoverNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in as a student to apply.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createApplication({
        projectId: project._id,
        studentId: user._id,
        coverNote
      });

      if (res.success) {
        showToast(`Application successfully sent to ${project.companyName}!`, 'success');
        onSuccess(res.application);
        onClose();
      } else {
        showToast(res.error || 'Failed to submit application', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error submitting application', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                Apply for {project.type}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2">{project.title}</h2>
            <p className="text-xs text-slate-500 font-medium">{project.companyName} • {project.stipend}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Match Summary Box */}
        <div className="my-5 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 p-4 rounded-2xl border border-indigo-100/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Your Skill Alignment
            </span>
            <span className="text-xs font-bold text-indigo-700">{project.matchPercentage ?? 0}% Match</span>
          </div>

          <MatchGauge
            percentage={project.matchPercentage ?? 0}
            matchedCount={project.matchedSkills?.length || 0}
            totalCount={project.requiredSkills?.length || 0}
            showDetails={true}
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.matchedSkills?.map(s => (
              <SkillBadge key={s} skill={s} variant="matched" size="sm" />
            ))}
            {project.missingSkills?.map(s => (
              <SkillBadge key={s} skill={s} variant="missing" size="sm" />
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
              Cover Note & Statement of Interest
            </label>
            <textarea
              required
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight your relevant course projects, passion for this company, and how your skills fulfill their deliverables..."
              className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Student Profile Info Preview */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between items-center text-slate-800 font-semibold">
              <span>Applying as:</span>
              <span className="text-indigo-600 font-bold">{user?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>University:</span>
              <span>{user?.university || 'Stanford University'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Attached Resume:</span>
              <span className="font-mono text-[11px] text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                {user?.resumeFilename || 'Alex_Chen_Software_Engineer_Resume.pdf'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Availability:</span>
              <span className="font-semibold text-emerald-700">{user?.availability || '20 hrs/week Part-Time'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
