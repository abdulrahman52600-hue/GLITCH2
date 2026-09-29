import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { ShieldCheck, Code2, Timer, Shuffle, LockKeyhole, RotateCcw, AlertTriangle, Camera } from 'lucide-react';
import AssessmentCameraMonitor from '../components/AssessmentCameraMonitor.jsx';

export default function SkillAssessmentPage({ onBack }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [catalog, setCatalog] = useState([]);
  const [security, setSecurity] = useState([]);
  const [skill, setSkill] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showCameraSetup, setShowCameraSetup] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraRetryKey, setCameraRetryKey] = useState(0);
  const [cameraWarning, setCameraWarning] = useState(false);
  const [cameraLost, setCameraLost] = useState(false);
  const [cameraConsent, setCameraConsent] = useState(false);
  const [focusSwitchCount, setFocusSwitchCount] = useState(0);
  const [focusPaused, setFocusPaused] = useState(false);
  const [firstFocusWarning, setFirstFocusWarning] = useState(false);
  const [attemptEnded, setAttemptEnded] = useState(null);
  const focusSwitchCountRef = useRef(0);
  const focusQueueRef = useRef(Promise.resolve());

  useEffect(() => {
    Promise.all([api.getAssessmentCatalog(), api.getSecurityControls()])
      .then(([catalogRes, securityRes]) => {
        setCatalog(catalogRes.assessments || []);
        setSecurity(securityRes.controls || []);
      })
      .catch(err => showToast(err.message, 'error'));
  }, [showToast]);

  useEffect(() => {
    if (!attempt || focusPaused) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((attempt.expiresAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [attempt, focusPaused]);

  const selectedInfo = useMemo(() => catalog.find(item => item.skill === skill), [catalog, skill]);
  const selectedLevel = selectedInfo?.levels?.find(item => item.level === level);

  const start = () => {
    if (!skill || !level) return;
    setCameraConsent(false);
    setCameraReady(false);
    setCameraWarning(false);
    setCameraLost(false);
    setFocusSwitchCount(0);
    focusSwitchCountRef.current = 0;
    setFocusPaused(false);
    setFirstFocusWarning(false);
    setAttemptEnded(null);
    setShowCameraSetup(true);
  };

  const reportFocusEvent = (action, keepalive = false) => {
    if (!attempt?.id) return Promise.reject(new Error('Assessment attempt is no longer active.'));
    const eventId = crypto.randomUUID();
    const request = focusQueueRef.current.then(() => api.assessmentFocusEvent(attempt.id, action, eventId, keepalive));
    focusQueueRef.current = request.catch(() => {});
    return request;
  };

  useEffect(() => {
    if (!attempt) return undefined;
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') return;
      const nextCount = focusSwitchCountRef.current + 1;
      focusSwitchCountRef.current = nextCount;
      setFocusSwitchCount(nextCount);
      if (nextCount === 1) setFirstFocusWarning(true);
      if (nextCount === 2) setFocusPaused(true);
      if (nextCount >= 3) {
        setAttemptEnded({ reason: 'The assessment ended after three times away from the assessment tab.' });
        setAttempt(null);
        setCameraActive(false);
      }
      reportFocusEvent('leave', true).catch(err => {
        if (nextCount < 3) showToast(`Could not record the tab switch: ${err.message}. Keep this assessment tab open and contact support if it repeats.`, 'error');
      });
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [attempt?.id, showToast]);

  const beginAssessment = async () => {
    if (!skill || !level || !cameraReady || !cameraConsent) return;
    setStarting(true);
    try {
      const res = await api.startAssessment(skill, level, true);
      setAttempt(res.attempt);
      setAnswers({});
      setResult(null);
      setShowCameraSetup(false);
      setFocusSwitchCount(0);
      focusSwitchCountRef.current = 0;
      setFocusPaused(false);
      focusQueueRef.current = Promise.resolve();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setStarting(false);
    }
  };

  const resumeAfterFinalWarning = async () => {
    try {
      const res = await reportFocusEvent('resume');
      setAttempt(current => current ? { ...current, expiresAt: res.expiresAt } : current);
      setFocusPaused(false);
      setFirstFocusWarning(false);
    } catch (err) {
      setAttemptEnded({ reason: err.message || 'This assessment could not be resumed.' });
      setAttempt(null);
      setCameraActive(false);
      setFocusPaused(false);
    }
  };

  const submit = async () => {
    if (!attempt || secondsLeft <= 0) return;
    setSubmitting(true);
    try {
      const res = await api.submitAssessment(attempt.id, answers);
      setResult(res.result);
      setAttempt(null);
      setCameraActive(false);
      setFirstFocusWarning(false);
      if (res.result.passed) showToast(`${skill} ${level} is now verified on your profile.`, 'success');
      else showToast('Assessment completed. Correct answers remain protected; you can retry after the cooldown.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const answeredCount = Object.keys(answers).length;
  const requiredCount = attempt?.questions?.length || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28 min-h-screen">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-mono text-xs font-bold">
            <ShieldCheck className="w-4 h-4" /> SKILL VERIFICATION V2
          </div>
          <h1 className="text-2xl font-extrabold text-on-surface mt-2">Prove the skill before it affects matching</h1>
          <p className="text-sm text-on-surface-variant mt-1">Server-scored assessments combine randomized MCQs with a coding task where supported.</p>
        </div>
        <button onClick={onBack} className="px-4 py-2 rounded-xl border border-outline-variant/30 text-xs font-bold">Back</button>
      </div>

      {cameraActive && (showCameraSetup || attempt) && (
        <div className="mb-5">
          <AssessmentCameraMonitor
            active={cameraActive}
            setupMode={showCameraSetup}
            retryKey={cameraRetryKey}
            onReady={ready => {
              setCameraReady(ready);
              if (attempt && !ready) setCameraLost(true);
              if (ready) setCameraLost(false);
            }}
            onFaceAway={() => setCameraWarning(true)}
            onFaceReturned={() => setCameraWarning(false)}
          />
        </div>
      )}

      {!attempt && !result && !showCameraSetup && !attemptEnded && (
        <div className="space-y-5">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-5 sm:p-7">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <h2 className="font-bold text-lg">1. Choose a skill</h2>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {catalog.map(item => (
                    <button key={item.skill} onClick={() => setSkill(item.skill)} className={`text-left p-4 rounded-xl border transition-all ${skill === item.skill ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant/20 hover:border-primary/40 bg-surface-container-low'}`}>
                      <div className="font-bold text-sm">{item.skill}</div>
                      <div className="text-[10px] text-on-surface-variant mt-1">{item.levels?.length || 3} levels</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="font-bold text-lg">2. Choose proficiency level</h2>
                <div className="space-y-2 mt-4">
                  {selectedInfo?.levels?.map(item => (
                    <button key={item.level} onClick={() => setLevel(item.level)} className={`w-full text-left p-3.5 rounded-xl border ${level === item.level ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant/20 bg-surface-container-low'}`}>
                      <div className="flex items-center justify-between"><span className="font-bold text-sm">{item.level}</span><span className="text-[10px] font-mono">{item.passingScore}% PASS</span></div>
                      <div className="text-xs text-on-surface-variant mt-1">{item.questionCount} question pool · {item.durationMinutes} min {item.hasCoding ? '· coding included' : ''}</div>
                    </button>
                  )) || <p className="text-sm text-on-surface-variant">Select a skill to see its levels.</p>}
                </div>
              </div>
            </div>
            <button disabled={!skill || !selectedLevel || starting} onClick={start} className="mt-6 w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-sm disabled:opacity-40">
              {`Continue to camera check for ${level} ${skill || 'skill'} assessment`}
            </button>
            {selectedLevel && <p className="text-xs text-on-surface-variant mt-3 text-center">5 randomized MCQs{selectedLevel.hasCoding ? ' + 1 coding task' : ' · 6 randomized MCQs'} · server validation · answers never disclosed</p>}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              [Shuffle, 'Random question set', 'Different questions can appear on each attempt.'],
              [Code2, 'Practical coding', 'Supported skills include a coding rubric, not just MCQs.'],
              [LockKeyhole, 'Tamper-resistant', 'Score, ownership, expiry and verified status are checked server-side.'],
              [RotateCcw, 'Controlled retries', 'Failed attempts use a cooldown and daily attempt limit.']
            ].map(([Icon, title, text]) => (
              <div key={title} className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4">
                <Icon className="w-5 h-5 text-primary" />
                <div className="font-bold text-sm mt-2">{title}</div>
                <div className="text-xs text-on-surface-variant mt-1 leading-5">{text}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[#B8D8A2]/60 bg-[#B8D8A2]/10 p-5">
            <div className="flex items-center gap-2 font-bold text-sm"><ShieldCheck className="w-5 h-5" /> Judge Demo: Security Controls</div>
            <div className="grid sm:grid-cols-2 gap-2 mt-4">
              {security.map(item => <div key={item.name} className="bg-white/70 rounded-xl p-3 border border-[#B8D8A2]/40"><div className="text-xs font-bold">{item.name} <span className="text-[#2f6b1d]">· {item.status}</span></div><div className="text-[11px] text-on-surface-variant mt-1">{item.detail}</div></div>)}
            </div>
          </div>
        </div>
      )}

      {showCameraSetup && !attempt && !result && !attemptEnded && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm p-5 sm:p-7 space-y-5">
          <div>
            <div className="inline-flex items-center gap-2 text-primary text-xs font-bold"><ShieldCheck className="w-4 h-4" /> BEFORE THE ASSESSMENT</div>
            <h2 className="text-xl font-extrabold mt-2">Review the focus and camera rules</h2>
            <ul className="text-sm text-on-surface-variant leading-6 mt-3 list-disc pl-5 space-y-1">
              <li>First time the assessment page is hidden: you receive a warning.</li>
              <li>Second time: the timer pauses and a final warning appears. Acknowledge it to continue.</li>
              <li>Third time: the attempt ends. Switching tabs, minimizing the browser, or switching apps can all count.</li>
              <li>If your face appears turned away or missing continuously for about five seconds, you get a reminder. Camera reminders alone do not end the attempt.</li>
            </ul>
          </div>
          <label className="flex items-start gap-3 rounded-xl bg-surface-container-low p-4 cursor-pointer">
            <input type="checkbox" checked={cameraConsent} onChange={event => setCameraConsent(event.target.checked)} className="mt-1 accent-primary" />
            <span className="text-xs leading-5">I understand these assessment rules and consent to a camera check while I take this assessment. Camera frames are processed on this device and are not recorded or uploaded by NexBridge. MediaPipe may send non-image usage and performance metrics to Google.</span>
          </label>
          {cameraActive && (
            <div className="rounded-xl bg-primary-fixed/30 p-4 text-xs leading-5 text-on-surface-variant">
              {cameraReady ? 'Camera check passed. You can start when ready.' : cameraConsent ? 'Allow camera access in your browser and look toward the screen until the check completes.' : 'Select the consent box before requesting camera access.'}
              {cameraReady && <div className="mt-1 text-[10px]">Face Landmarker's on-device library may send non-image usage and performance metrics to Google; no camera image or video is sent.</div>}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            {!cameraActive ? (
              <button disabled={!cameraConsent} onClick={() => setCameraActive(true)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm disabled:opacity-40"><Camera className="w-4 h-4" /> Allow camera and check</button>
            ) : !cameraReady ? (
              <button onClick={() => { setCameraActive(false); window.setTimeout(() => { setCameraRetryKey(value => value + 1); setCameraActive(true); }, 0); }} className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/30 font-bold text-sm">Retry camera check</button>
            ) : (
              <button disabled={starting || !cameraConsent} onClick={beginAssessment} className="flex-1 px-4 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm disabled:opacity-40">{starting ? 'Preparing assessment…' : 'Start assessment'}</button>
            )}
            <button onClick={() => { setShowCameraSetup(false); setCameraActive(false); setCameraReady(false); }} className="px-4 py-3 rounded-xl border border-outline-variant/30 font-bold text-sm">Cancel</button>
          </div>
          <p className="text-[11px] text-on-surface-variant">Camera access needs your browser’s permission and a secure page (HTTPS or localhost). If you need an accommodation, contact your assessment administrator before starting.</p>
        </div>
      )}

      {attempt && (
        <div className="space-y-4">
          {focusSwitchCount === 1 && firstFocusWarning && !focusPaused && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3" role="alert">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <div className="flex-1"><div className="font-bold text-sm text-amber-950">Focus warning 1 of 2</div><p className="text-xs text-amber-900 mt-1">The assessment page became hidden. One more time will pause the timer and show a final warning.</p></div>
              <button onClick={() => setFirstFocusWarning(false)} className="text-xs font-bold text-amber-900">Dismiss</button>
            </div>
          )}
          {cameraWarning && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3" role="status" aria-live="polite">
              <Camera className="w-5 h-5 text-amber-700 shrink-0" />
              <div><div className="font-bold text-sm text-amber-950">Please face the screen</div><p className="text-xs text-amber-900 mt-1">The camera estimate suggests your face or eye direction was away from the screen, or your face was out of frame, for several seconds. This reminder does not end your attempt.</p></div>
            </div>
          )}
          {cameraLost && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-amber-950" role="alert"><span className="flex-1">The camera connection was interrupted. Reconnect or allow the camera again. You can’t submit while the camera check is unavailable; video is not recorded.</span><button onClick={() => { setCameraLost(false); setCameraRetryKey(value => value + 1); }} className="px-3 py-2 rounded-lg border border-amber-500 font-bold">Reconnect camera</button></div>
          )}
          {focusPaused && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="focus-warning-title">
              <div className="max-w-md w-full rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center"><AlertTriangle className="w-6 h-6" /></div>
                <h2 id="focus-warning-title" className="text-lg font-extrabold mt-4">Final focus warning · 2 of 2</h2>
                <p className="text-sm text-on-surface-variant mt-2 leading-6">The timer is paused. A third time away from this assessment page will end the attempt. The timer stays paused until you continue.</p>
                <button onClick={resumeAfterFinalWarning} className="mt-5 w-full py-3 rounded-xl bg-primary text-on-primary text-sm font-bold">I understand — continue assessment</button>
              </div>
            </div>
          )}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 flex items-center justify-between sticky top-2 z-10">
            <div><span className="font-bold">{attempt.skill} · {attempt.level}</span><span className="text-xs text-on-surface-variant ml-2">{requiredCount} questions · {answeredCount}/{requiredCount} answered</span></div>
            <div className={`font-mono font-bold text-sm flex items-center gap-1 ${secondsLeft < 60 ? 'text-error' : 'text-primary'}`}><Timer className="w-4 h-4" />{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</div>
          </div>
          {attempt.questions.map((q, index) => q.type === 'coding' ? (
            <div key={q.id} className="bg-surface-container-lowest rounded-2xl border border-primary/20 p-5">
              <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold mb-2"><Code2 className="w-4 h-4" /> CODING TASK</div>
              <h2 className="font-bold text-sm leading-6">{q.prompt}</h2>
              <textarea value={answers[q.id] || q.starter || ''} onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} rows={9} className="mt-4 w-full rounded-xl border border-outline-variant/30 bg-slate-950 text-slate-100 p-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <p className="text-[11px] text-on-surface-variant mt-2">The demo uses a server-side rubric. Production can replace this with an isolated code-execution sandbox.</p>
            </div>
          ) : (
            <div key={q.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5">
              <div className="text-xs font-mono text-on-surface-variant mb-2">QUESTION {index + 1}</div>
              <h2 className="font-bold text-sm leading-6">{q.question}</h2>
              <div className="grid sm:grid-cols-2 gap-2 mt-4">
                {q.options.map((option, optionIndex) => (
                  <label key={option} className={`p-3 rounded-xl border cursor-pointer text-xs font-medium ${answers[q.id] === optionIndex ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant/20 bg-surface-container-low'}`}>
                    <input type="radio" name={q.id} checked={answers[q.id] === optionIndex} onChange={() => setAnswers(prev => ({ ...prev, [q.id]: optionIndex }))} className="mr-2" />{option}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button disabled={submitting || focusPaused || cameraLost || answeredCount < requiredCount || secondsLeft <= 0} onClick={submit} className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-sm disabled:opacity-40">
            {submitting ? 'Validating on server...' : 'Submit assessment securely'}
          </button>
        </div>
      )}

      {attemptEnded && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-error/20 bg-surface-container-lowest shadow-sm p-7 text-center" role="alert">
          <div className="mx-auto w-14 h-14 rounded-full bg-error/10 text-error flex items-center justify-center"><AlertTriangle className="w-7 h-7" /></div>
          <h2 className="text-xl font-extrabold mt-4">Assessment attempt ended</h2>
          <p className="text-sm text-on-surface-variant mt-2">{attemptEnded.reason}</p>
          <p className="text-xs text-on-surface-variant mt-2">Your answers were not submitted. Follow the retry policy or contact your assessment administrator if this happened by mistake.</p>
          <button onClick={() => { setAttemptEnded(null); setSkill(''); setFocusSwitchCount(0); focusSwitchCountRef.current = 0; }} className="mt-5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold">Return to skill selection</button>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-7 text-center">
            <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center text-2xl font-extrabold ${result.passed ? 'bg-[#B8D8A2]/40 text-[#244b16]' : 'bg-error/10 text-error'}`}>{result.score}%</div>
            <h2 className="text-xl font-extrabold mt-4">{result.passed ? `${skill} verified` : 'Not verified yet'}</h2>
            <p className="text-sm text-on-surface-variant mt-2">{result.correct} of {result.total} MCQs correct · {result.level}{result.codingScore !== null ? ` · coding ${result.codingScore}%` : ''}</p>
            <div className="max-w-lg mx-auto mt-5 rounded-xl bg-surface-container-low p-4 text-left text-xs">
              <div className="font-bold">Verification policy</div>
              <div className="text-on-surface-variant mt-1">{result.passed ? 'The server issued this verification and it can now contribute to matching.' : 'The exact answers are not revealed. Review the skill and retry after the cooldown.'}</div>
            </div>
            <div className="flex gap-2 mt-6 justify-center">
              <button onClick={() => { setResult(null); setSkill(''); }} className="px-4 py-2 rounded-xl border border-outline-variant/30 text-xs font-bold">Verify another skill</button>
              <button onClick={onBack} className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold">Return to profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
