import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// Get demo users for 1-click login switch
router.get('/demo-users', async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, role } = req.body;
    let user = null;

    if (email) {
      user = await db.getUserByEmail(email);
    } else if (role) {
      // Find first user with that role
      const users = await db.getUsers(role);
      user = users[0];
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found. Try one-click demo login or register.' });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, role, ...rest } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email and role are required.' });
    }

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const newUser = await db.createUser({
      name,
      email,
      role,
      avatar: rest.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      skills: rest.skills || (role === 'student' ? ['React', 'JavaScript', 'HTML/CSS'] : []),
      interests: rest.interests || [],
      availability: rest.availability || (role === 'student' ? 'Flexible' : undefined),
      resumeFilename: rest.resumeFilename || '',
      resumeUrl: rest.resumeUrl || '',
      bio: rest.bio || '',
      ...rest
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Profile by ID
router.get('/user/:id', async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile
router.put('/profile/:id', async (req, res) => {
  try {
    const updated = await db.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
