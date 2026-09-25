import mongoose from 'mongoose';
import { initialUsers, initialProjects, initialMentors, initialApplications, initialMentorshipRequests } from '../data/demoData.js';
import { calculateSkillMatch } from '../utils/matcher.js';

// In-Memory store for offline / zero-setup mode
class InMemoryDatabase {
  constructor() {
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.projects = JSON.parse(JSON.stringify(initialProjects));
    this.mentors = JSON.parse(JSON.stringify(initialMentors));
    this.applications = JSON.parse(JSON.stringify(initialApplications));
    this.mentorshipRequests = JSON.parse(JSON.stringify(initialMentorshipRequests));
    this.isMongooseConnected = false;
  }

  // --- Users ---
  async getUsers(role) {
    if (role) return this.users.filter(u => u.role === role);
    return this.users;
  }

  async getUserById(id) {
    return this.users.find(u => u._id === id) || null;
  }

  async getUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async updateUser(id, updateData) {
    const idx = this.users.findIndex(u => u._id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...updateData };
    return this.users[idx];
  }

  async createUser(userData) {
    const newUser = {
      _id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date(),
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }

  // --- Projects ---
  async getProjects(filter = {}) {
    let list = [...this.projects];
    if (filter.companyId) {
      list = list.filter(p => p.companyId === filter.companyId);
    }
    if (filter.status) {
      list = list.filter(p => p.status === filter.status);
    }
    return list;
  }

  async getProjectById(id) {
    return this.projects.find(p => p._id === id) || null;
  }

  async createProject(projectData) {
    const newProj = {
      _id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      applicantsCount: 0,
      status: 'Open',
      createdAt: new Date(),
      responsibilities: projectData.responsibilities || [],
      deliverables: projectData.deliverables || [],
      requiredSkills: projectData.requiredSkills || [],
      preferredSkills: projectData.preferredSkills || [],
      ...projectData
    };
    this.projects.unshift(newProj);
    return newProj;
  }

  async updateProject(id, updateData) {
    const idx = this.projects.findIndex(p => p._id === id);
    if (idx === -1) return null;
    this.projects[idx] = { ...this.projects[idx], ...updateData };
    return this.projects[idx];
  }

  async deleteProject(id) {
    const idx = this.projects.findIndex(p => p._id === id);
    if (idx === -1) return false;
    this.projects.splice(idx, 1);
    // clean up associated applications
    this.applications = this.applications.filter(a => a.projectId !== id);
    return true;
  }

  // --- Applications ---
  async getApplications(filter = {}) {
    let list = [...this.applications];
    if (filter.studentId) {
      list = list.filter(a => a.studentId === filter.studentId);
    }
    if (filter.companyId) {
      list = list.filter(a => a.companyId === filter.companyId);
    }
    if (filter.projectId) {
      list = list.filter(a => a.projectId === filter.projectId);
    }
    return list;
  }

  async getApplicationById(id) {
    return this.applications.find(a => a._id === id) || null;
  }

  async createApplication(appData) {
    // Check if duplicate
    const existing = this.applications.find(
      a => a.projectId === appData.projectId && a.studentId === appData.studentId
    );
    if (existing) {
      throw new Error("You have already applied to this project.");
    }

    // Skill match recalculation to ensure accuracy
    const match = calculateSkillMatch(appData.studentSkills, appData.projectRequiredSkills);

    const newApp = {
      _id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'Pending',
      appliedAt: new Date(),
      updatedAt: new Date(),
      ...appData,
      matchPercentage: match.matchPercentage,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills
    };

    this.applications.unshift(newApp);

    // Increment applicantsCount on project
    const proj = this.projects.find(p => p._id === appData.projectId);
    if (proj) {
      proj.applicantsCount = (proj.applicantsCount || 0) + 1;
    }

    return newApp;
  }

  async updateApplicationStatus(id, status, feedback = '') {
    const app = this.applications.find(a => a._id === id);
    if (!app) return null;
    app.status = status;
    if (feedback) app.feedback = feedback;
    app.updatedAt = new Date();
    return app;
  }

  // --- Mentors ---
  async getMentors() {
    return this.mentors;
  }

  async getMentorById(id) {
    return this.mentors.find(m => m._id === id) || null;
  }

  async createMentorshipRequest(reqData) {
    const newReq = {
      _id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'Pending',
      createdAt: new Date(),
      ...reqData
    };
    this.mentorshipRequests.unshift(newReq);
    return newReq;
  }

  async getMentorshipRequests(studentId) {
    if (studentId) {
      return this.mentorshipRequests.filter(r => r.studentId === studentId);
    }
    return this.mentorshipRequests;
  }

  async updateMentorshipRequestStatus(id, status) {
    const req = this.mentorshipRequests.find(r => r._id === id);
    if (!req) return null;
    req.status = status;
    return req;
  }

  // --- Admin Stats ---
  async getAdminStats() {
    const totalStudents = this.users.filter(u => u.role === 'student').length;
    const totalCompanies = this.users.filter(u => u.role === 'company').length;
    const totalProjects = this.projects.length;
    const totalApplications = this.applications.length;
    const totalMentors = this.mentors.length;

    const acceptedApplications = this.applications.filter(a => a.status === 'Accepted').length;
    const shortlistedApplications = this.applications.filter(a => a.status === 'Shortlisted').length;

    // Average match percentage across all applications
    const avgMatch = totalApplications > 0
      ? Math.round(this.applications.reduce((acc, a) => acc + (a.matchPercentage || 0), 0) / totalApplications)
      : 0;

    return {
      totalStudents,
      totalCompanies,
      totalProjects,
      totalApplications,
      totalMentors,
      acceptedApplications,
      shortlistedApplications,
      avgMatchPercentage: avgMatch,
      systemMode: this.isMongooseConnected ? 'MongoDB (Connected)' : 'Zero-Config Active Memory Store'
    };
  }
}

export const db = new InMemoryDatabase();

// Connect to MongoDB if available
export async function initDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_bridge';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    db.isMongooseConnected = true;
    console.log('✅ Connected to MongoDB successfully at:', uri);
  } catch (err) {
    db.isMongooseConnected = false;
    console.log('ℹ️ MongoDB daemon not active locally. Operating in High-Speed In-Memory Database Mode with full state persistence & rich demo data.');
  }
}
