import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// Get all mentors
router.get('/', async (req, res) => {
  try {
    const { skill, industry, search } = req.query;
    let mentors = await db.getMentors();

    if (search) {
      const q = search.toLowerCase();
      mentors = mentors.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.bio.toLowerCase().includes(q) ||
        (m.skills && m.skills.some(s => s.toLowerCase().includes(q)))
      );
    }

    if (industry && industry !== 'All') {
      mentors = mentors.filter(m => m.industry.toLowerCase().includes(industry.toLowerCase()));
    }

    if (skill && skill !== 'All') {
      mentors = mentors.filter(m => 
        m.skills && m.skills.some(s => s.toLowerCase() === skill.toLowerCase())
      );
    }

    res.json({ success: true, count: mentors.length, mentors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single mentor
router.get('/:id', async (req, res) => {
  try {
    const mentor = await db.getMentorById(req.params.id);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });
    res.json({ success: true, mentor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request mentorship session
router.post('/request', async (req, res) => {
  try {
    const { mentorId, studentId, topic, message, preferredTime } = req.body;
    if (!mentorId || !studentId || !topic || !message) {
      return res.status(400).json({ error: 'Mentor ID, student ID, topic and message are required.' });
    }

    const mentor = await db.getMentorById(mentorId);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    const student = await db.getUserById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const newRequest = await db.createMentorshipRequest({
      mentorId: mentor._id,
      mentorName: mentor.name,
      mentorRole: mentor.role,
      mentorCompany: mentor.company,
      mentorAvatar: mentor.avatar,
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      topic,
      message,
      preferredTime: preferredTime || 'Flexible - As soon as available'
    });

    res.status(201).json({ success: true, request: newRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get mentorship requests for a student
router.get('/requests/:studentId', async (req, res) => {
  try {
    const requests = await db.getMentorshipRequests(req.params.studentId);
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
