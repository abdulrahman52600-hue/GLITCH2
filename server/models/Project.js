import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  companyId: { type: String, required: true },
  companyName: { type: String, required: true },
  companyLogo: { type: String },
  industry: { type: String, default: 'Technology' },
  type: { 
    type: String, 
    enum: ['Internship', 'Short-Term Project', 'Fellowship', 'Capstone'], 
    default: 'Internship' 
  },
  location: { type: String, default: 'Remote' },
  duration: { type: String, required: true }, // e.g., '10 Weeks', '3 Months'
  deadline: { type: String, required: true }, // e.g., '2026-10-30'
  stipend: { type: String, required: true }, // e.g., '₹35,000/sprint', '₹25,000 award'
  requiredSkills: [{ type: String }],
  preferredSkills: [{ type: String }],
  description: { type: String, required: true },
  responsibilities: [{ type: String }],
  deliverables: [{ type: String }],
  applicantsCount: { type: Number, default: 0 },
  status: { type: String, enum: ['Open', 'Under Review', 'Closed'], default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});

export const Project = mongoose.model('Project', projectSchema);
