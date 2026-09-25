import express from 'express';
import { db } from '../db/database.js';
import { calculateSkillMatch } from '../utils/matcher.js';

const router = express.Router();

// Get all projects with optional student skill matching calculation
router.get('/', async (req, res) => {
  try {
    const { studentId, search, type, industry, minMatch, sort = 'match', companyId } = req.query;
    
    let filter = {};
    if (companyId) {
      filter.companyId = companyId;
    }
    
    let projects = await db.getProjects(filter);

    // If studentId provided, fetch student skills to compute matching
    let studentSkills = [];
    if (studentId) {
      const student = await db.getUserById(studentId);
      if (student && student.skills) {
        studentSkills = student.skills;
      }
    }

    // Attach skill match stats to each project
    let enriched = projects.map(proj => {
      const match = calculateSkillMatch(studentSkills, proj.requiredSkills);
      return {
        ...proj,
        matchPercentage: studentId ? match.matchPercentage : null,
        matchedSkills: studentId ? match.matchedSkills : [],
        missingSkills: studentId ? match.missingSkills : proj.requiredSkills,
        matchBadge: studentId ? match.badge : null,
        matchBadgeColor: studentId ? match.badgeColor : null
      };
    });

    // Apply filters
    if (search) {
      const q = search.toLowerCase();
      enriched = enriched.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.companyName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.requiredSkills && p.requiredSkills.some(s => s.toLowerCase().includes(q)))
      );
    }

    if (type && type !== 'All') {
      enriched = enriched.filter(p => p.type === type);
    }

    if (industry && industry !== 'All') {
      enriched = enriched.filter(p => p.industry === industry);
    }

    if (studentId && minMatch) {
      enriched = enriched.filter(p => p.matchPercentage >= Number(minMatch));
    }

    // Sorting
    if (studentId && sort === 'match') {
      enriched.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
    } else if (sort === 'deadline') {
      enriched.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else {
      enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({ success: true, count: enriched.length, projects: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const { studentId } = req.query;
    const project = await db.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    let matchStats = null;
    if (studentId) {
      const student = await db.getUserById(studentId);
      if (student) {
        matchStats = calculateSkillMatch(student.skills || [], project.requiredSkills || []);
      }
    }

    // Check if student has already applied
    let hasApplied = false;
    let existingApplication = null;
    if (studentId) {
      const apps = await db.getApplications({ studentId, projectId: project._id });
      if (apps.length > 0) {
        hasApplied = true;
        existingApplication = apps[0];
      }
    }

    res.json({
      success: true,
      project: {
        ...project,
        matchStats,
        hasApplied,
        existingApplication
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new project (Company only)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      companyId,
      companyName,
      companyLogo,
      industry,
      type,
      location,
      duration,
      deadline,
      stipend,
      requiredSkills,
      preferredSkills,
      description,
      responsibilities,
      deliverables
    } = req.body;

    if (!title || !companyId || !companyName || !duration || !deadline || !stipend || !description) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const newProject = await db.createProject({
      title,
      companyId,
      companyName,
      companyLogo: companyLogo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      industry: industry || "Technology",
      type: type || "Internship",
      location: location || "Remote",
      duration,
      deadline,
      stipend,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
      preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : (preferredSkills ? preferredSkills.split(',').map(s => s.trim()) : []),
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      deliverables: Array.isArray(deliverables) ? deliverables : []
    });

    res.status(201).json({ success: true, project: newProject });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updateProject(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, project: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const success = await db.deleteProject(req.params.id);
    if (!success) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
