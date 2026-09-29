import express from 'express';
import { db } from '../db/database.js';
import { calculateSkillMatch } from '../utils/matcher.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { companyId, projectId, status } = req.query;
    const requestedStudentId = req.query.studentId;
    const studentId = req.user.role === 'student' ? req.user._id : requestedStudentId;
    if (req.user.role === 'company' && companyId && companyId !== req.user._id) {
      return res.status(403).json({ error: 'You can only view your company applications.' });
    }
    let apps = await db.getApplications({ studentId, companyId, projectId });
    if (req.user.role === 'student') apps = apps.filter(a => a.studentId === req.user._id);
    if (req.user.role === 'company') apps = apps.filter(a => a.companyId === req.user._id);
    if (status && status !== 'All') apps = apps.filter(a => a.status === status);
    apps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    res.json({ success: true, count: apps.length, applications: apps });
  } catch (err) {
    res.status(500).json({ error: 'Unable to load applications.' });
  }
});

router.post('/', authenticate, requireRole('student'), async (req, res) => {
  try {
    const { projectId, coverNote } = req.body;
    if (!projectId) return res.status(400).json({ error: 'Project ID is required.' });
    const project = await db.getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    const student = req.user;
    const verifiedSkills = student.verifiedSkills || [];
    const match = calculateSkillMatch(verifiedSkills, project.requiredSkills || []);

    const application = await db.createApplication({
      projectId: project._id,
      projectTitle: project.title,
      companyId: project.companyId,
      companyName: project.companyName,
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      studentAvatar: student.avatar,
      studentUniversity: student.university || 'N/A',
      studentDegree: student.degree || 'Computer Science',
      studentSkills: verifiedSkills.map(v => typeof v === 'string' ? v : v.skill),
      projectRequiredSkills: project.requiredSkills || [],
      matchPercentage: match.matchPercentage,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      coverNote: typeof coverNote === 'string' ? coverNote.slice(0, 2000) : '',
      resumeUrl: student.resumeUrl || ''
    });
    await db.createNotification(project.companyId, { title: 'New project application', message: `${req.user.name} applied to ${project.title}.`, href: 'applications', kind: 'application' });
    res.status(201).json({ success: true, application });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to submit application.' });
  }
});

router.patch('/:id/status', authenticate, requireRole('company', 'admin'), async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const validStatuses = ['Pending', 'Under Review', 'Shortlisted', 'Accepted', 'In Progress', 'Rejected'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid application status.' });
    const application = await db.getApplicationById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found.' });
    if (application.status === 'Completed') return res.status(409).json({ error: 'Completed work records cannot be edited.' });
    if (req.user.role === 'company' && application.companyId !== req.user._id) {
      return res.status(403).json({ error: 'You can only update applications for your company.' });
    }
    const updated = await db.updateApplicationStatus(req.params.id, status, typeof feedback === 'string' ? feedback.slice(0, 2000) : '');
    if (application.studentId) await db.createNotification(application.studentId, { title: `Application ${status.toLowerCase()}`, message: `${application.projectTitle}: your application is now ${status.toLowerCase()}.${feedback ? ` ${String(feedback).slice(0, 300)}` : ''}`, href: 'applications', kind: 'application' });
    res.json({ success: true, application: updated });
  } catch (err) {
    res.status(500).json({ error: 'Unable to update application.' });
  }
});

router.post('/:id/complete', authenticate, requireRole('company'), async (req, res) => {
  try {
    const application = await db.getApplicationById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found.' });
    if (application.companyId !== req.user._id) return res.status(403).json({ error: 'You can only review work for your company.' });
    if (!['Accepted', 'In Progress'].includes(application.status)) return res.status(409).json({ error: 'Only accepted or in-progress work can be completed.' });

    const { summary, rating, skillsDemonstrated, evidenceUrl } = req.body || {};
    if (typeof summary !== 'string' || summary.trim().length < 20 || summary.length > 2000) {
      return res.status(400).json({ error: 'Write a work summary between 20 and 2,000 characters.' });
    }
    const score = Number(rating);
    if (!Number.isInteger(score) || score < 1 || score > 5) return res.status(400).json({ error: 'Rating must be a whole number from 1 to 5.' });
    if (skillsDemonstrated !== undefined && (!Array.isArray(skillsDemonstrated) || skillsDemonstrated.length > 20 || skillsDemonstrated.some(skill => typeof skill !== 'string' || skill.length > 80))) {
      return res.status(400).json({ error: 'Skills demonstrated must be a list of at most 20 skill names.' });
    }
    let safeEvidenceUrl = '';
    if (evidenceUrl) {
      try {
        const url = new URL(evidenceUrl);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid protocol');
        safeEvidenceUrl = url.toString();
      } catch { return res.status(400).json({ error: 'Evidence link must be a valid HTTP or HTTPS URL.' }); }
    }

    const review = {
      summary: summary.trim(),
      rating: score,
      skillsDemonstrated: [...new Set((skillsDemonstrated || []).map(skill => skill.trim()).filter(Boolean))],
      evidenceUrl: safeEvidenceUrl,
      reviewerId: req.user._id,
      reviewerName: req.user.companyName || req.user.name
    };
    const completed = await db.completeApplication(req.params.id, review);
    await db.createNotification(application.studentId, { title: 'Work review completed', message: `${application.projectTitle} was marked complete and received an employer review.`, href: 'skill-passport', kind: 'work' });
    return res.json({ success: true, application: completed });
  } catch (err) {
    return res.status(500).json({ error: 'Unable to record work completion.' });
  }
});

export default router;
