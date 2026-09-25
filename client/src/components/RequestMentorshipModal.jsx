import React, { useState } from 'react';
import { X, Calendar, Clock, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export default function RequestMentorshipModal({ mentor, isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [topic, setTopic] = useState(mentor?.topics?.[0] || 'Technical Career Roadmap & Guidance');
  const [preferredTime, setPreferredTime] = useState('Next Tuesday 6:00 PM PST');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !mentor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in as a student to book mentorship.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.requestMentorship({
        mentorId: mentor._id,
        studentId: user._id,
        topic,
        preferredTime,
        message
      });

      if (res.success) {
        showToast(`Mentorship request submitted to ${mentor.name}!`, 'success');
        onSuccess(res.request);
        onClose();
      } else {
        showToast(res.error || 'Failed to submit request', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error submitting mentorship request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
            <div>
              <h2 className="text-lg font-bold text-slate-900">{mentor.name}</h2>
              <p className="text-xs text-indigo-600 font-medium">{mentor.role} @ {mentor.company}</p>
            </div>
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
              Select Discussion Topic *
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {mentor.topics?.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="General Technical Interview Coaching">General Technical Interview Coaching</option>
              <option value="Resume & Portfolio Deep Dive">Resume & Portfolio Deep Dive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">
              Preferred Date & Time *
            </label>
            <input
              type="text"
              required
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              placeholder="e.g. Wednesday Oct 14th at 5:00 PM EST"
              className="w-full text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Mentor availability: {mentor.availability}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">
              Your Questions / Note to Mentor *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce your current stage, what specific questions you have, and what you hope to achieve from this session..."
              className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
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
              className="px-5 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending...' : 'Request Mentorship'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
