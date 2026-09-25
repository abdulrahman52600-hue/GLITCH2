import React, { useState } from 'react';
import { X, Plus, Sparkles, Building2, Calendar, IndianRupee, Clock, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import SkillBadge from './SkillBadge.jsx';

const POPULAR_SKILLS = [
  'React', 'Python', 'SQL', 'TypeScript', 'Java', 'Docker', 
  'Node.js', 'AWS', 'Kubernetes', 'Machine Learning', 'Tailwind CSS', 'Figma'
];

export default function PostProjectModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    type: 'Internship',
    industry: 'Enterprise AI & Cloud',
    location: 'Remote',
    duration: '12 Weeks',
    deadline: '2026-11-30',
    stipend: '₹35,000 / sprint',
    description: '',
    deliverables: 'Architecture document, core MVP prototype, integration test suite'
  });

  const [requiredSkills, setRequiredSkills] = useState(['React', 'Python', 'SQL']);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!requiredSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setRequiredSkills([...requiredSkills, trimmed]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiredSkills.length === 0) {
      showToast('Please add at least one required skill for matching.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createProject({
        ...formData,
        companyId: user?._id || 'comp_1',
        companyName: user?.companyName || user?.name || 'NovaTech Solutions',
        companyLogo: user?.avatar || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
        requiredSkills,
        deliverables: formData.deliverables.split(',').map(d => d.trim()).filter(Boolean)
      });

      if (res.success) {
        showToast('Project listing posted successfully!', 'success');
        onSuccess(res.project);
        onClose();
      } else {
        showToast(res.error || 'Failed to post project', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error creating project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Employer Portal
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2">Post Project or Internship</h2>
            <p className="text-xs text-slate-500">
              Students will be matched against your required skills automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Distributed Vector Search Engine or Full-Stack Telemetry Hub"
              className="w-full text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">
                Opportunity Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Internship">Internship</option>
                <option value="Short-Term Project">Short-Term Project</option>
                <option value="Fellowship">Fellowship</option>
                <option value="Capstone">Capstone</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">
                Duration *
              </label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 10 Weeks"
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">
                Application Deadline *
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">
                Stipend / Compensation *
              </label>
              <input
                type="text"
                required
                value={formData.stipend}
                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                placeholder="e.g. ₹28,000 / sprint or ₹35,000 Award"
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">
                Location & Work Mode
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Remote or Hybrid (San Francisco, CA)"
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* REQUIRED SKILLS BUILDER (The Matching Core) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-bold uppercase text-indigo-950 tracking-wider mb-1 flex items-center justify-between">
              <span>Required Skills for Matching Formula *</span>
              <span className="text-[11px] font-normal text-slate-500">Press Enter to add</span>
            </label>
            
            <div className="flex gap-2 mb-2.5">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(skillInput);
                  }
                }}
                placeholder="Type skill (e.g. React, Python, Docker) and click Add..."
                className="flex-1 text-sm rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(skillInput)}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
              >
                Add Skill
              </button>
            </div>

            {/* Current Selected Required Skills */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center mb-3">
              {requiredSkills.map(skill => (
                <SkillBadge 
                  key={skill} 
                  skill={skill} 
                  variant="brand" 
                  onRemove={handleRemoveSkill} 
                />
              ))}
              {requiredSkills.length === 0 && (
                <span className="text-xs text-rose-500 font-medium">Add at least one required skill tag</span>
              )}
            </div>

            {/* Popular Suggestions */}
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/60">
              <span className="font-semibold text-slate-700">Quick add:</span>
              {POPULAR_SKILLS.filter(s => !requiredSkills.includes(s)).slice(0, 6).map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => handleAddSkill(s)}
                  className="px-2 py-0.5 rounded-full bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 text-xs transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">
              Project Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline the core objective, tech stack context, and team mentorship structure..."
              className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">
              Key Deliverables (comma separated)
            </label>
            <input
              type="text"
              value={formData.deliverables}
              onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
              placeholder="e.g. Telemetry widget, benchmark report, unit tests"
              className="w-full text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
