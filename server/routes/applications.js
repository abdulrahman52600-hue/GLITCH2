import express from 'express';
import { db } from '../db/database.js';
import { calculateSkillMatch } from '../utils/matcher.js';

const router = express.Router();

// Get applications with filtering
router.get('/', async (req, res) => {
  try {
    const { studentId, companyId, projectId, status } = req.query;
    let apps = await db.getApplications({ studentId, companyId, projectId });

    if (status && status !== 'All') {
      apps = apps.filter(a => a.status === status);
    }

    // Sort by most recent
    apps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    res.json({ success: true, count: apps.length, applications: apps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit application (Student)
router.post('/', async (req, res) => {
  try {
    const { projectId, studentId, coverNote } = req.body;
    if (!projectId || !studentId) {
      return res.status(400).json({ error: 'Project ID and Student ID are required.' });
    }

    const project = await db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const student = await db.getUserById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const match = calculateSkillMatch(student.skills || [], project.requiredSkills || []);

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
      studentSkills: student.skills || [],
      projectRequiredSkills: project.requiredSkills || [],
      matchPercentage: match.matchPercentage,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      coverNote: coverNote || '',
      resumeUrl: student.resumeUrl || ''
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update application status (Company: Shortlist / Accept / Reject)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, feedback } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const validStatuses = ['Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await db.updateApplicationStatus(req.params.id, status, feedback);
    if (!updated) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    res.json({ success: true, application: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
