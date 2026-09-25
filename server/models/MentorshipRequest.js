import mongoose from 'mongoose';

const mentorshipRequestSchema = new mongoose.Schema({
  mentorId: { type: String, required: true },
  mentorName: { type: String, required: true },
  mentorRole: { type: String },
  mentorCompany: { type: String },
  mentorAvatar: { type: String },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String },
  topic: { type: String, required: true },
  message: { type: String, required: true },
  preferredTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Completed', 'Declined'], 
    default: 'Pending' 
  },
  meetingLink: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const MentorshipRequest = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
