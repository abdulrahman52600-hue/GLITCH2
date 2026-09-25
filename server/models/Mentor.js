import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true }, // e.g. Staff AI Engineer
  company: { type: String, required: true }, // e.g. Google Brain
  companyLogo: { type: String },
  avatar: { type: String },
  industry: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  skills: [{ type: String }],
  bio: { type: String, required: true },
  topics: [{ type: String }],
  rating: { type: Number, default: 4.9 },
  sessionsCompleted: { type: Number, default: 12 },
  availability: { type: String, default: 'Evenings & Weekends' },
  linkedin: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Mentor = mongoose.model('Mentor', mentorSchema);
