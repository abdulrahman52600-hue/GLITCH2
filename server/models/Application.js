import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  projectTitle: { type: String, required: true },
  companyId: { type: String, required: true },
  companyName: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentAvatar: { type: String },
  studentUniversity: { type: String },
  studentDegree: { type: String },
  studentSkills: [{ type: String }],
  projectRequiredSkills: [{ type: String }],
  matchPercentage: { type: Number, required: true },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  coverNote: { type: String },
  resumeUrl: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'], 
    default: 'Pending' 
  },
  feedback: { type: String },
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Application = mongoose.model('Application', applicationSchema);
