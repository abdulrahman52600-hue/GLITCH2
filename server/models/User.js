import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'company', 'admin'], default: 'student' },
  avatar: { type: String },
  // Student specific fields
  university: { type: String },
  degree: { type: String },
  gradYear: { type: String },
  skills: [{ type: String }],
  interests: [{ type: String }],
  resumeUrl: { type: String },
  resumeFilename: { type: String },
  availability: { type: String },
  bio: { type: String },
  gpa: { type: String },
  github: { type: String },
  linkedin: { type: String },
  // Company specific fields
  companyName: { type: String },
  industry: { type: String },
  website: { type: String },
  location: { type: String },
  companySize: { type: String },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
