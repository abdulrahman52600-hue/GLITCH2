import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function EvidenceBar({ label, value, hint }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-on-surface">{label}</span>
        <span className="font-mono font-bold text-primary">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      {hint && <p className="text-[10px] text-on-surface-variant">{hint}</p>}
    </div>
  );
}

export default function SkillPassportPage({ setActivePage, applications = [], projects = [] }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('passport');
  const verified = user?.verifiedSkills || [];
  const declared = user?.skills || [];
  const completedWork = applications.filter(app => app.status === 'Completed' && app.workReview);
  const employerRating = completedWork.length
    ? (completedWork.reduce((total, app) => total + app.workReview.rating, 0) / completedWork.length).toFixed(1)
    : null;

  const evidenceScore = useMemo(() => {
    const assessment = verified.length ? Math.round(verified.reduce((a, b) => a + (b.score || 0), 0) / verified.length) : 0;
    const delivery = Math.min(completedWork.length * 20, 100);
    const reputation = employerRating ? Math.round(Number(employerRating) * 20) : 0;
    return Math.round(assessment * 0.55 + delivery * 0.25 + reputation * 0.20);
  }, [verified, completedWork, employerRating]);

  const gapProjects = projects.filter(project => project.status === 'Open' && project.requiredSkills?.length)
    .slice(0, 4).map(project => ({ title: project.title, skills: project.requiredSkills }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 pb-28 min-h-screen space-y-5">
      <section className="rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-7 bg-gradient-to-br from-primary-fixed/60 via-surface-container-lowest to-secondary-fixed/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={user?.avatar} alt={user?.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-md" />
                <span className="absolute -right-2 -bottom-2 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                </span>
              </div>
              <div>
                <div className="font-mono text-[10px] font-bold tracking-widest text-primary">NEXBRIDGE SKILL PASSPORT</div>
                <h1 className="text-2xl font-extrabold text-on-surface mt-1">{user?.name || 'Student'}</h1>
                <p className="text-xs text-on-surface-variant mt-1">Evidence-backed capability profile • {user?.university || 'University'}</p>
              </div>
            </div>
            <div className="min-w-[170px] rounded-2xl bg-white/75 border border-white p-4 shadow-sm">
              <div className="flex items-center justify-between"><span className="text-xs font-semibold text-on-surface-variant">Evidence Score</span><span className="material-symbols-outlined text-primary text-[18px]">fact_check</span></div>
              <div className="text-3xl font-black text-on-surface mt-1">{evidenceScore}<span className="text-sm text-on-surface-variant">/100</span></div>
              <p className="text-[10px] text-on-surface-variant mt-1">Assessment + delivery + employer evidence</p>
            </div>
          </div>
        </div>
        <div className="flex border-t border-outline-variant/15 overflow-x-auto">
          {[['passport','Skill Passport'],['gap','Skill Gap Analyzer'],['reputation','Work Reputation']].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)} className={`px-5 py-3 text-xs font-bold whitespace-nowrap ${tab === key ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}>{label}</button>
          ))}
        </div>
      </section>

      {tab === 'passport' && (
        <>
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20"><div className="text-2xl font-black">{verified.length}</div><div className="text-[11px] text-on-surface-variant">Verified skills</div></div>
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20"><div className="text-2xl font-black">{declared.length}</div><div className="text-[11px] text-on-surface-variant">Declared skills</div></div>
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20"><div className="text-2xl font-black">{completedWork.length}</div><div className="text-[11px] text-on-surface-variant">Verified completed sprints</div></div>
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20"><div className="text-2xl font-black">{employerRating || '—'}</div><div className="text-[11px] text-on-surface-variant">Employer rating</div></div>
          </section>

          <section className="rounded-xl bg-surface-container-lowest border border-outline-variant/20 p-5 space-y-5">
            <div className="flex items-center justify-between"><div><h2 className="font-bold">Verified capability</h2><p className="text-xs text-on-surface-variant mt-1">Only server-issued verification is used by the matching engine.</p></div><span className="text-[10px] font-mono font-bold px-2 py-1 rounded-full bg-[#B8D8A2]/30 text-[#244b16]">ASSESSMENT-BACKED</span></div>
            <div className="grid md:grid-cols-2 gap-4">
              {verified.map(item => <article key={item.skill} className="p-4 rounded-xl bg-surface-container-low border border-[#B8D8A2]/50"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-sm">{item.skill}</h3><p className="text-[10px] text-on-surface-variant mt-1">Verified {item.verifiedAt ? new Date(item.verifiedAt).toLocaleDateString('en-IN') : 'recently'} • Assessment {item.assessmentVersion || 'v2'}</p></div><span className="px-2 py-1 rounded-full bg-white text-[#376225] text-[10px] font-bold">✓ VERIFIED</span></div><div className="flex items-end justify-between mt-4"><span className="text-2xl font-black">{item.score}%</span><span className="text-xs font-bold text-on-surface-variant">{item.level}</span></div><div className="h-2 bg-white rounded-full overflow-hidden mt-2"><div className="h-full bg-[#6a9e48]" style={{width:`${item.score}%`}} /></div></article>)}
              {verified.length === 0 && <p className="text-xs text-on-surface-variant">No verified skills yet. Start an assessment to build your passport.</p>}
            </div>
          </section>

          <section className="rounded-xl bg-surface-container-lowest border border-outline-variant/20 p-5">
            <div className="flex items-center gap-2 mb-3"><span className="material-symbols-outlined text-primary">layers</span><h2 className="font-bold text-sm">Self-declared vs verified</h2></div>
            <div className="flex flex-wrap gap-2">{declared.map(skill => { const isVerified = verified.some(v => v.skill.toLowerCase() === skill.toLowerCase()); return <span key={skill} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${isVerified ? 'bg-[#B8D8A2]/20 border-[#B8D8A2]/60 text-[#376225]' : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'}`}>{isVerified ? '✓ ' : ''}{skill}{!isVerified && ' · self-declared'}</span> })}</div>
          </section>
        </>
      )}

      {tab === 'gap' && (
        <section className="rounded-xl bg-surface-container-lowest border border-outline-variant/20 p-5 space-y-5">
          <div><div className="font-mono text-[10px] font-bold tracking-wider text-primary">READINESS ENGINE</div><h2 className="text-xl font-extrabold mt-1">See exactly what each sprint needs</h2><p className="text-xs text-on-surface-variant mt-1">No black-box recommendation: NexBridge shows the verified skills you already have and the specific gaps to close.</p></div>
          <div className="space-y-4">
            {gapProjects.map(project => {
              const ready = project.skills.filter(s => verified.some(v => v.skill.toLowerCase() === s.toLowerCase()));
              const pct = Math.round((ready.length / project.skills.length) * 100);
              return <article key={project.title} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/15"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h3 className="font-bold text-sm">{project.title}</h3><p className="text-[10px] text-on-surface-variant mt-1">{ready.length}/{project.skills.length} required skills verified</p></div><span className="text-lg font-black text-primary">{pct}% ready</span></div><div className="h-2 bg-surface-container-high rounded-full overflow-hidden mt-3"><div className="h-full bg-primary" style={{width:`${pct}%`}} /></div><div className="flex flex-wrap gap-2 mt-3">{project.skills.map(s => <span key={s} className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${ready.includes(s) ? 'bg-[#B8D8A2]/30 text-[#376225]' : 'bg-amber-100 text-amber-800'}`}>{ready.includes(s) ? '✓' : '○'} {s}{!ready.includes(s) && ' · gap'}</span>)}</div></article>;
            })}
            {gapProjects.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No open opportunities with skill requirements are available right now.</p>}
          </div>
          <div className="p-4 rounded-xl bg-primary-fixed/50 border border-primary/20"><div className="flex gap-2"><span className="material-symbols-outlined text-primary">lightbulb</span><div><div className="text-xs font-bold">Recommended next step</div><p className="text-xs text-on-surface-variant mt-1">Verify one missing skill or complete a project using it. Your passport becomes stronger through demonstrated evidence—not just profile claims.</p></div></div></div>
        </section>
      )}

      {tab === 'reputation' && (
        <section className="rounded-xl bg-surface-container-lowest border border-outline-variant/20 p-5 space-y-5">
          <div><div className="font-mono text-[10px] font-bold tracking-wider text-primary">PROOF OF WORK</div><h2 className="text-xl font-extrabold mt-1">Work reputation</h2><p className="text-xs text-on-surface-variant mt-1">A history of completed work that can strengthen future matching.</p></div>
          <div className="grid md:grid-cols-3 gap-3"><EvidenceBar label="Skill verification" value={verified.length ? Math.round(verified.reduce((a,b)=>a.score+b.score,0)/verified.length) : 0} hint="Average server-scored assessments"/><EvidenceBar label="Completed work" value={Math.min(completedWork.length * 20, 100)} hint={`${completedWork.length} employer-verified sprint${completedWork.length === 1 ? '' : 's'}`} /><EvidenceBar label="Employer rating" value={employerRating ? Math.round(Number(employerRating)*20) : 0} hint={employerRating ? `${employerRating}/5 from completed work` : 'No employer reviews yet'} /></div>
          <div className="space-y-3">
            {completedWork.map(app => <article key={app._id} className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-bold text-slate-900">{app.projectTitle}</h3><p className="text-[11px] text-slate-500">{app.companyName} · Reviewed by {app.workReview.reviewerName || app.companyName}</p></div><span className="rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-amber-700">★ {app.workReview.rating}/5</span></div><p className="mt-3 text-sm leading-6 text-slate-700">{app.workReview.summary}</p>{app.workReview.skillsDemonstrated?.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{app.workReview.skillsDemonstrated.map(skill => <span key={skill} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-800">{skill}</span>)}</div>}{app.workReview.evidenceUrl && <a href={app.workReview.evidenceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-bold text-indigo-700 underline">View work evidence</a>}</article>)}
            {completedWork.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Completed sprints and employer reviews will appear here after a company verifies a work outcome.</p>}
          </div>
        </section>
      )}

      <div className="flex justify-end"><button onClick={() => setActivePage('skill-assessment')} className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-sm">Verify another skill →</button></div>
    </div>
  );
}
