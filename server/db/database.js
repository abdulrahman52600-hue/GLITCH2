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
    this.assessmentAttempts = [];
    this.notifications = [];
    this.mongoCollection = null;
    this.users = this.users.map(user => ({
      ...user,
      verifiedSkills: Array.isArray(user.verifiedSkills) ? user.verifiedSkills : []
    }));
    this.isMongooseConnected = false;
  }

  async attachMongoCollection(collection) {
    this.mongoCollection = collection;
    await collection.createIndex({ recordType: 1 });
    await collection.createIndex({ 'record.email': 1 }, { unique: true, partialFilterExpression: { recordType: 'user' } });
    await collection.createIndex({ 'record.phone': 1 }, { unique: true, partialFilterExpression: { recordType: 'user', 'record.phone': { $type: 'string' } } });
    await collection.createIndex({ recordType: 1, 'record.userId': 1, 'record.createdAt': -1 });
    const groups = [
      ['user', this.users], ['project', this.projects], ['mentor', this.mentors],
      ['application', this.applications], ['mentorshipRequest', this.mentorshipRequests]
    ];
    for (const [recordType, records] of groups) {
      for (const record of records) {
        const _id = `${recordType}:${record._id}`;
        await collection.updateOne({ _id }, { $setOnInsert: { _id, recordType, record } }, { upsert: true });
      }
    }
    await this.refreshFromMongo();
  }

  async refreshFromMongo() {
    if (!this.mongoCollection) return;
    const load = async (type) => (await this.mongoCollection.find({ recordType: type }).toArray()).map(item => item.record);
    this.users = await load('user');
    this.projects = await load('project');
    this.mentors = await load('mentor');
    this.applications = await load('application');
    this.mentorshipRequests = await load('mentorshipRequest');
    this.assessmentAttempts = await load('assessmentAttempt');
    this.notifications = await load('notification');
  }

  async persistRecord(recordType, record) {
    if (!this.isMongooseConnected || !this.mongoCollection) return;
    const _id = `${recordType}:${record._id}`;
    await this.mongoCollection.replaceOne({ _id }, { _id, recordType, record }, { upsert: true });
  }

  async deleteRecord(recordType, recordId) {
    if (!this.isMongooseConnected || !this.mongoCollection) return;
    await this.mongoCollection.deleteOne({ _id: `${recordType}:${recordId}` });
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
    await this.persistRecord('user', this.users[idx]);
    return this.users[idx];
  }

  async setVerifiedSkill(id, verification) {
    const user = await this.getUserById(id);
    if (!user) return null;
    const current = Array.isArray(user.verifiedSkills) ? user.verifiedSkills : [];
    const filtered = current.filter(v => v.skill.toLowerCase() !== verification.skill.toLowerCase());
    user.verifiedSkills = [...filtered, verification];
    await this.persistRecord('user', user);
    return user;
  }

  async createAssessmentAttempt(attempt) {
    this.assessmentAttempts.push(attempt);
    await this.persistRecord('assessmentAttempt', attempt);
    return attempt;
  }

  async getAssessmentAttempt(id) {
    return this.assessmentAttempts.find(a => a._id === id) || null;
  }

  async updateAssessmentAttempt(attempt) {
    const index = this.assessmentAttempts.findIndex(item => item._id === attempt._id);
    if (index === -1) return null;
    this.assessmentAttempts[index] = attempt;
    await this.persistRecord('assessmentAttempt', attempt);
    return attempt;
  }

  async createUser(userData) {
    const newUser = {
      _id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date(),
      ...userData
    };
    this.users.push(newUser);
    await this.persistRecord('user', newUser);
    return newUser;
  }

  async getUserByProvider(provider, providerId) {
    return this.users.find(user => user.authProviders?.[provider] === providerId) || null;
  }

  async getUserByPhone(phone) {
    return this.users.find(user => user.phone === phone) || null;
  }

  async createNotification(userId, { title, message, href = 'applications', kind = 'activity' }) {
    if (!userId || !title || !message) return null;
    const notification = { _id: `notification_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, userId, title: String(title).slice(0, 120), message: String(message).slice(0, 500), href, kind, readAt: null, createdAt: new Date() };
    this.notifications.unshift(notification);
    this.notifications = this.notifications.slice(0, 2000);
    await this.persistRecord('notification', notification);
    return notification;
  }

  async getNotifications(userId) {
    return this.notifications.filter(item => item.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);
  }

  async markNotificationRead(userId, id) {
    const item = this.notifications.find(notification => notification.userId === userId && notification._id === id);
    if (!item) return null;
    item.readAt = item.readAt || new Date();
    await this.persistRecord('notification', item);
    return item;
  }

  async markAllNotificationsRead(userId) {
    for (const item of this.notifications.filter(notification => notification.userId === userId && !notification.readAt)) {
      item.readAt = new Date();
      await this.persistRecord('notification', item);
    }
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
    await this.persistRecord('project', newProj);
    return newProj;
  }

  async updateProject(id, updateData) {
    const idx = this.projects.findIndex(p => p._id === id);
    if (idx === -1) return null;
    this.projects[idx] = { ...this.projects[idx], ...updateData };
    await this.persistRecord('project', this.projects[idx]);
    return this.projects[idx];
  }

  async deleteProject(id) {
    const idx = this.projects.findIndex(p => p._id === id);
    if (idx === -1) return false;
    this.projects.splice(idx, 1);
    await this.deleteRecord('project', id);
    // clean up associated applications
    this.applications = this.applications.filter(a => a.projectId !== id);
    if (this.isMongooseConnected && this.mongoCollection) await this.mongoCollection.deleteMany({ recordType: 'application', 'record.projectId': id });
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
    await this.persistRecord('application', newApp);

    // Increment applicantsCount on project
    const proj = this.projects.find(p => p._id === appData.projectId);
    if (proj) {
      proj.applicantsCount = (proj.applicantsCount || 0) + 1;
      await this.persistRecord('project', proj);
    }

    return newApp;
  }

  async updateApplicationStatus(id, status, feedback = '') {
    const app = this.applications.find(a => a._id === id);
    if (!app) return null;
    app.status = status;
    if (feedback) app.feedback = feedback;
    app.updatedAt = new Date();
    await this.persistRecord('application', app);
    return app;
  }

  async completeApplication(id, review) {
    const app = this.applications.find(a => a._id === id);
    if (!app) return null;
    app.status = 'Completed';
    app.workReview = { ...review, reviewedAt: new Date() };
    app.feedback = review.summary;
    app.updatedAt = new Date();
    await this.persistRecord('application', app);
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
    await this.persistRecord('mentorshipRequest', newReq);
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
    await this.persistRecord('mentorshipRequest', req);
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
    await db.attachMongoCollection(mongoose.connection.collection('nexbridge_records'));
    console.log('✅ Connected to MongoDB successfully at:', uri);
  } catch (err) {
    db.isMongooseConnected = false;
    console.log('ℹ️ MongoDB is unavailable. Operating in in-memory demo mode; changes will not persist after restart.');
  }
}
