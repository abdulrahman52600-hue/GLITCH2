import React, { useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, LoaderCircle, Star, BriefcaseBusiness } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

const filters = [
  ['all', 'All'], ['in-review', 'In review'], ['active', 'Active'], ['completed', 'Completed']
];

export default function ApplicationsPage({ applications = [], onRefreshData, onViewProject, setActivePage }) {
  const { role } = useAuth();
  const { showToast } = useToast();
  const [activeFilter, setActiveFilter] = useState('all');
  const [busyId, setBusyId] = useState('');
  const [completionFor, setCompletionFor] = useState('');
  const [review, setReview] = useState({ summary: '', rating: '5', skills: '', evidenceUrl: '' });

  const counts = useMemo(() => ({
    all: applications.length,
    'in-review': applications.filter(app => ['Pending', 'Under Review', 'Shortlisted'].includes(app.status)).length,
    active: applications.filter(app => ['Accepted', 'In Progress'].includes(app.status)).length,
    completed: applications.filter(app => app.status === 'Completed').length
  }), [applications]);

  const visibleApplications = useMemo(() => applications.filter(app => {
    if (activeFilter === 'in-review') return ['Pending', 'Under Review', 'Shortlisted'].includes(app.status);
    if (activeFilter === 'active') return ['Accepted', 'In Progress'].includes(app.status);
    if (activeFilter === 'completed') return app.status === 'Completed';
    return true;
  }), [activeFilter, applications]);

  const changeStatus = async (application, status) => {
    setBusyId(application._id);
    try {
      await api.updateApplicationStatus(application._id, status);
      showToast(`Application marked ${status.toLowerCase()}.`, 'success');
      await onRefreshData?.();
    } catch (err) { showToast(err.message || 'Could not update application.', 'error'); }
    finally { setBusyId(''); }
  };

  const completeWork = async (application) => {
    setBusyId(application._id);
    try {
      await api.completeApplication(application._id, {
        summary: review.summary,
        rating: Number(review.rating),
        skillsDemonstrated: review.skills.split(',').map(skill => skill.trim()).filter(Boolean),
        evidenceUrl: review.evidenceUrl.trim()
      });
      showToast('Completion and employer review added to the student’s work record.', 'success');
      setCompletionFor('');
      setReview({ summary: '', rating: '5', skills: '', evidenceUrl: '' });
      await onRefreshData?.();
    } catch (err) { showToast(err.message || 'Could not record completion.', 'error'); }
    finally { setBusyId(''); }
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl space-y-6 px-4 py-8 pb-24 sm:px-6">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">NexBridge work record</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">Applications &amp; outcomes</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">Follow each application through review, active work, and employer-verified completion.</p></div>
          <BriefcaseBusiness className="hidden h-9 w-9 text-indigo-200 sm:block" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {filters.map(([key, label]) => <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{label}</p><p className="mt-1 text-2xl font-black">{counts[key]}</p></div>)}
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter applications">
        {filters.map(([key, label]) => <button key={key} onClick={() => setActiveFilter(key)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${activeFilter === key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{label} <span className="ml-1 opacity-70">{counts[key]}</span></button>)}
      </div>

      <section className="space-y-4">
        {visibleApplications.map(application => {
          const isCompany = role === 'company';
          const busy = busyId === application._id;
          const reviewData = application.workReview;
          const applicantOrEmployer = isCompany ? application.studentName : application.companyName;
          return <article key={application._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${application.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : application.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-50 text-indigo-700'}`}>{application.status}</span><span className="text-[11px] text-slate-400">Applied {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'recently'}</span></div>
                <h2 className="mt-3 text-lg font-extrabold text-slate-900">{application.projectTitle}</h2>
                <p className="mt-1 text-sm text-slate-600">{isCompany ? 'Applicant' : 'Company'}: <span className="font-semibold">{applicantOrEmployer}</span></p>
                {application.matchPercentage != null && <p className="mt-2 text-xs font-bold text-indigo-700">{application.matchPercentage}% verified-skill match</p>}
                {application.coverNote && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{application.coverNote}</p>}
                {application.feedback && <p className="mt-3 text-sm text-slate-600"><span className="font-bold">Company note:</span> {application.feedback}</p>}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {onViewProject && <button onClick={() => onViewProject(application.projectId)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">View project</button>}
                {isCompany && ['Pending', 'Under Review', 'Shortlisted'].includes(application.status) && <>
                  <button disabled={busy} onClick={() => changeStatus(application, 'Shortlisted')} className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 disabled:opacity-50">Shortlist</button>
                  <button disabled={busy} onClick={() => changeStatus(application, 'Accepted')} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Accept</button>
                  <button disabled={busy} onClick={() => changeStatus(application, 'Rejected')} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50">Reject</button>
                </>}
                {isCompany && application.status === 'Accepted' && <button disabled={busy} onClick={() => changeStatus(application, 'In Progress')} className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Start work</button>}
                {isCompany && ['Accepted', 'In Progress'].includes(application.status) && <button onClick={() => setCompletionFor(completionFor === application._id ? '' : application._id)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Record outcome</button>}
              </div>
            </div>

            {completionFor === application._id && <div className="border-t border-slate-100 bg-emerald-50/50 p-5">
              <h3 className="font-bold text-slate-900">Verify completed work</h3><p className="mt-1 text-xs text-slate-600">This employer review becomes part of the student’s work reputation. Only submit it after the sprint is complete.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Outcome summary<textarea value={review.summary} onChange={e => setReview(current => ({ ...current, summary: e.target.value }))} minLength={20} maxLength={2000} rows={3} placeholder="What did the student deliver? Include the result and quality of the work." className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-emerald-500" /></label>
                <label className="text-xs font-semibold text-slate-700">Employer rating<select value={review.rating} onChange={e => setReview(current => ({ ...current, rating: e.target.value }))} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"><option value="5">5 — Excellent</option><option value="4">4 — Strong</option><option value="3">3 — Meets expectations</option><option value="2">2 — Needs improvement</option><option value="1">1 — Unsatisfactory</option></select></label>
                <label className="text-xs font-semibold text-slate-700">Skills demonstrated<input value={review.skills} onChange={e => setReview(current => ({ ...current, skills: e.target.value }))} placeholder="React, API design (comma-separated)" className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal" /></label>
                <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Proof of work link (optional)<input type="url" value={review.evidenceUrl} onChange={e => setReview(current => ({ ...current, evidenceUrl: e.target.value }))} placeholder="https://…" className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal" /></label>
              </div>
              <button disabled={busy || review.summary.trim().length < 20} onClick={() => completeWork(application)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Confirm completed sprint</button>
            </div>}

            {reviewData && <div className="border-t border-emerald-100 bg-emerald-50/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-sm font-extrabold text-emerald-900"><CheckCircle2 className="h-4 w-4" />Employer-verified outcome</h3><span className="inline-flex items-center gap-1 text-sm font-bold text-amber-700"><Star className="h-4 w-4 fill-current" />{reviewData.rating}/5</span></div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{reviewData.summary}</p>
              <p className="mt-2 text-[11px] text-slate-500">Reviewed by {reviewData.reviewerName || application.companyName}{reviewData.reviewedAt ? ` · ${new Date(reviewData.reviewedAt).toLocaleDateString()}` : ''}</p>
              {reviewData.skillsDemonstrated?.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{reviewData.skillsDemonstrated.map(skill => <span key={skill} className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200">{skill}</span>)}</div>}
              {reviewData.evidenceUrl && <a href={reviewData.evidenceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:underline">View proof of work <ExternalLink className="h-3.5 w-3.5" /></a>}
            </div>}
          </article>;
        })}
        {visibleApplications.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center"><BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 font-bold text-slate-800">No applications in this view yet</h2><p className="mt-1 text-sm text-slate-500">Applications and verified work outcomes will appear here.</p><button onClick={() => setActivePage?.('explore')} className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-on-primary">Explore opportunities</button></div>}
      </section>
    </div>
  );
}
