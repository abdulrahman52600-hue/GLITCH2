import express from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { assessmentCatalog, skillAssessmentBanks } from '../data/skillAssessments.js';

const router = express.Router();
const ATTEMPT_TTL_MS = 10 * 60 * 1000;
const RETRY_COOLDOWN_MS = 30 * 1000;
const DAILY_ATTEMPT_LIMIT = 5;
const MAX_FOCUS_PAUSE_MS = 2 * 60 * 1000;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function publicQuestion(q) {
  const { answer, rubric, ...safe } = q;
  return safe;
}

function evaluateCoding(skill, rubric, code = '') {
  const source = String(code).slice(0, 12000).toLowerCase();
  if (!source.trim()) return { passed: false, score: 0, feedback: 'No code submitted.' };

  const checks = {
    Python: {
      sum_list: [/def\s+solve\s*\(/, /sum\s*\(/],
      first_duplicate: [/def\s+solve\s*\(/, /set\s*\(/, /for\s+/],
      longest_unique: [/def\s+solve\s*\(/, /set\s*\(/, /for\s+/, /len\s*\(/]
    },
    JavaScript: {
      sum_list: [/(function\s+solve|solve\s*=)/, /reduce\s*\(/],
      first_duplicate: [/(function\s+solve|solve\s*=)/, /set\s*\(/, /for\s+|for\s*\(/],
      longest_unique: [/(function\s+solve|solve\s*=)/, /set\s*\(/, /for\s*\(/, /length/]
    },
    SQL: {
      sql_filter: [/select\s+/, /from\s+students/, /where\s+/, /score\s*>=\s*70/],
      sql_group_count: [/select\s+/, /count\s*\(/, /from\s+students/, /group\s+by\s+department/],
      sql_having_avg: [/select\s+/, /avg\s*\(/, /from\s+students/, /group\s+by\s+department/, /having\s+avg\s*\(/]
    }
  };
  const required = checks[skill]?.[rubric] || [];
  if (!required.length) return { passed: false, score: 0, feedback: 'Coding rubric unavailable for this task.' };
  const hit = required.filter(rx => rx.test(source)).length;
  const score = Math.round((hit / required.length) * 100);
  return { passed: score >= 75, score, feedback: score >= 75 ? 'Coding rubric passed.' : 'Core implementation signals are incomplete.' };
}

router.get('/catalog', (req, res) => {
  res.json({ success: true, assessments: assessmentCatalog });
});

router.get('/security-controls', authenticate, requireRole('student', 'company', 'admin'), (req, res) => {
  res.json({
    success: true,
    controls: [
      { name: 'Server-side scoring', status: 'PASS', detail: 'Correct answers never leave the server.' },
      { name: 'Attempt ownership', status: 'PASS', detail: 'An attempt can only be submitted by its authenticated owner.' },
      { name: 'One-time submission', status: 'PASS', detail: 'Submitted attempts cannot be replayed.' },
      { name: 'Expiry enforcement', status: 'PASS', detail: 'The server rejects expired attempts.' },
      { name: 'Assessment focus policy', status: 'ENABLED', detail: 'The first two focus losses are recorded; the second pauses the timer; a third ends the attempt. The server enforces the event count.' },
      { name: 'Camera privacy', status: 'ENABLED', detail: 'Face direction reminders run in the browser. NexBridge does not store or receive camera frames.' },
      { name: 'Protected verifiedSkills', status: 'PASS', detail: 'Profile updates cannot modify verified skills, role, or IDs.' },
      { name: 'Role authorization', status: 'PASS', detail: 'Assessment and administrative routes enforce roles server-side.' },
      { name: 'Rate limiting', status: 'PASS', detail: 'API and assessment endpoints are rate limited.' },
      { name: 'Input limits', status: 'PASS', detail: 'JSON payloads and coding submissions are bounded.' }
    ]
  });
});

router.post('/start', authenticate, requireRole('student'), async (req, res) => {
  if (req.body?.cameraConsent !== true) return res.status(400).json({ error: 'Camera monitoring consent is required before starting this assessment.' });
  const skill = typeof req.body.skill === 'string' ? req.body.skill.trim() : '';
  const level = ['Beginner', 'Intermediate', 'Advanced'].includes(req.body.level) ? req.body.level : 'Intermediate';
  const data = skillAssessmentBanks[skill];
  const bank = data?.[level];
  if (!bank) return res.status(400).json({ error: 'That skill or assessment level is not available yet.' });

  const now = Date.now();
  for (const previous of db.assessmentAttempts) {
    if (previous.studentId === req.user._id && previous.pausedAt && now - new Date(previous.pausedAt).getTime() > MAX_FOCUS_PAUSE_MS && !previous.submitted && !previous.invalidated) {
      previous.invalidated = true;
      previous.invalidatedAt = new Date();
      previous.invalidationReason = 'focus_pause_timeout';
      previous.pausedAt = null;
      await db.updateAssessmentAttempt(previous);
    }
  }
  const recent = db.assessmentAttempts.filter(a => a.studentId === req.user._id && a.skill === skill && a.startedAt && new Date(a.startedAt).getTime() > now - 24 * 60 * 60 * 1000);
  if (recent.length >= DAILY_ATTEMPT_LIMIT) return res.status(429).json({ error: 'Daily assessment limit reached for this skill. Try again tomorrow.' });
  const lastFailed = recent.filter(a => a.submitted && !a.passed).sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
  if (lastFailed && now - new Date(lastFailed.submittedAt).getTime() < RETRY_COOLDOWN_MS) {
    const wait = Math.ceil((RETRY_COOLDOWN_MS - (now - new Date(lastFailed.submittedAt).getTime())) / 1000);
    return res.status(429).json({ error: `Retry cooldown active. Please wait ${wait}s before another attempt.` });
  }

  const active = db.assessmentAttempts.find(a => a.studentId === req.user._id && !a.submitted && !a.invalidated && (a.expiresAt > now || (a.pausedAt && now - new Date(a.pausedAt).getTime() <= MAX_FOCUS_PAUSE_MS)));
  if (active) return res.status(409).json({ error: 'You already have an active assessment.', attemptId: active._id });

  const mcqQuestions = shuffle(bank).slice(0, 5);
  const codingQuestion = data.coding?.[level] || null;
  const selected = codingQuestion ? [...mcqQuestions, codingQuestion] : shuffle(bank).slice(0, 6);
  const questions = selected.map(publicQuestion);
  const durationMinutes = level === 'Advanced' ? 12 : 10;
  const attempt = {
    _id: `attempt_${crypto.randomUUID()}`,
    studentId: req.user._id,
    skill,
    level,
    questionIds: questions.map(q => q.id),
    startedAt: new Date(),
    expiresAt: now + durationMinutes * 60 * 1000,
    submitted: false,
    focusSwitchCount: 0,
    focusEventIds: [],
    pausedAt: null,
    invalidated: false,
    cameraConsentAt: new Date()
  };
  await db.createAssessmentAttempt(attempt);

  res.status(201).json({
    success: true,
    attempt: {
      id: attempt._id,
      skill,
      level,
      questions,
      expiresAt: attempt.expiresAt,
      durationMinutes,
      codingIncluded: Boolean(codingQuestion)
    }
  });
});

router.post('/:id/focus-event', authenticate, requireRole('student'), async (req, res) => {
  const attempt = await db.getAssessmentAttempt(req.params.id);
  if (!attempt) return res.status(404).json({ error: 'Assessment attempt not found.' });
  if (attempt.studentId !== req.user._id) return res.status(403).json({ error: 'This assessment does not belong to you.' });
  if (attempt.submitted) return res.status(409).json({ error: 'This assessment has already been submitted.' });
  if (attempt.invalidated) return res.status(410).json({ error: 'This attempt ended after repeated focus loss.', ended: true });

  const action = req.body?.action;
  const eventId = typeof req.body?.eventId === 'string' ? req.body.eventId.slice(0, 80) : '';
  if (!['leave', 'resume'].includes(action) || !eventId) return res.status(400).json({ error: 'A valid focus event is required.' });
  attempt.focusEventIds ||= [];
  if (attempt.focusEventIds.includes(eventId)) {
    return res.json({ success: true, focusSwitchCount: attempt.focusSwitchCount || 0, paused: Boolean(attempt.pausedAt), ended: false, expiresAt: attempt.expiresAt });
  }

  const now = Date.now();
  if (action === 'leave') {
    attempt.focusEventIds.push(eventId);
    attempt.focusSwitchCount = (attempt.focusSwitchCount || 0) + 1;
    if (attempt.focusSwitchCount >= 3) {
      attempt.invalidated = true;
      attempt.invalidatedAt = new Date(now);
      attempt.invalidationReason = 'repeated_focus_loss';
      attempt.pausedAt = null;
      await db.updateAssessmentAttempt(attempt);
      return res.status(410).json({ error: 'The assessment ended after three focus losses.', focusSwitchCount: 3, ended: true });
    }
    if (attempt.focusSwitchCount === 2) attempt.pausedAt = new Date(now);
    await db.updateAssessmentAttempt(attempt);
    return res.json({ success: true, focusSwitchCount: attempt.focusSwitchCount, paused: Boolean(attempt.pausedAt), ended: false, expiresAt: attempt.expiresAt });
  }

  if (!attempt.pausedAt) return res.status(409).json({ error: 'This assessment is not paused.' });
  if (now - new Date(attempt.pausedAt).getTime() > MAX_FOCUS_PAUSE_MS) {
    attempt.focusEventIds.push(eventId);
    attempt.invalidated = true;
    attempt.invalidatedAt = new Date(now);
    attempt.invalidationReason = 'focus_pause_timeout';
    attempt.pausedAt = null;
    await db.updateAssessmentAttempt(attempt);
    return res.status(410).json({ error: 'The paused attempt expired. Start a new assessment.', ended: true });
  }
  attempt.focusEventIds.push(eventId);
  attempt.expiresAt += now - new Date(attempt.pausedAt).getTime();
  attempt.pausedAt = null;
  await db.updateAssessmentAttempt(attempt);
  return res.json({ success: true, focusSwitchCount: attempt.focusSwitchCount || 0, paused: false, ended: false, expiresAt: attempt.expiresAt });
});

router.post('/:id/submit', authenticate, requireRole('student'), async (req, res) => {
  const attempt = await db.getAssessmentAttempt(req.params.id);
  if (!attempt) return res.status(404).json({ error: 'Assessment attempt not found.' });
  if (attempt.studentId !== req.user._id) return res.status(403).json({ error: 'This assessment does not belong to you.' });
  if (attempt.invalidated) return res.status(410).json({ error: 'This attempt ended after repeated focus loss.' });
  if (attempt.pausedAt) return res.status(409).json({ error: 'Resume the assessment before submitting.' });
  if (attempt.submitted) return res.status(409).json({ error: 'This assessment has already been submitted.' });
  if (attempt.expiresAt < Date.now()) return res.status(410).json({ error: 'This assessment has expired. Start a new attempt.' });

  const answers = req.body?.answers;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return res.status(400).json({ error: 'Answers are required.' });

  const data = skillAssessmentBanks[attempt.skill];
  const allQuestions = Object.values(data || {}).flatMap(v => Array.isArray(v) ? v : []);
  const questions = attempt.questionIds.map(id => allQuestions.find(q => q.id === id) || Object.values(data?.coding || {}).find(q => q.id === id)).filter(Boolean);
  if (!questions.length) return res.status(400).json({ error: 'Assessment question set is invalid.' });

  let mcqCorrect = 0;
  let mcqTotal = 0;
  let codingResult = null;
  for (const question of questions) {
    if (question.type === 'coding') {
      codingResult = evaluateCoding(attempt.skill, question.rubric, answers[question.id]);
      continue;
    }
    mcqTotal += 1;
    const supplied = Number(answers[question.id]);
    if (Number.isInteger(supplied) && supplied === question.answer) mcqCorrect += 1;
  }

  const mcqScore = mcqTotal ? (mcqCorrect / mcqTotal) * 80 : 0;
  const codingScore = codingResult ? codingResult.score * 0.20 : 20;
  const score = Math.round(mcqScore + codingScore);
  const passed = score >= 70;
  const level = attempt.level;

  attempt.submitted = true;
  attempt.submittedAt = new Date();
  attempt.score = score;
  attempt.passed = passed;
  attempt.mcqCorrect = mcqCorrect;
  attempt.mcqTotal = mcqTotal;
  attempt.codingScore = codingResult?.score ?? null;
  await db.updateAssessmentAttempt(attempt);

  let verifiedSkill = null;
  if (passed) {
    verifiedSkill = { skill: attempt.skill, score, level, verifiedAt: new Date(), assessmentVersion: 'v2' };
    await db.setVerifiedSkill(req.user._id, verifiedSkill);
    await db.createNotification(req.user._id, { title: 'Skill verified', message: `${attempt.skill} is now verified at ${level} level with a score of ${score}%.`, href: 'skill-passport', kind: 'assessment' });
  }

  res.json({
    success: true,
    result: {
      score,
      correct: mcqCorrect,
      total: mcqTotal,
      passed,
      level,
      codingScore: codingResult?.score ?? null,
      codingFeedback: codingResult?.feedback ?? null,
      verifiedSkill,
      answerPolicy: 'Correct answers are not disclosed after submission.'
    }
  });
});

export default router;
