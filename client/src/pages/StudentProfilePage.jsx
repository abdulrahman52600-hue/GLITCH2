import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import SkillBadge from '../components/SkillBadge.jsx';

const SUGGESTED_SKILLS = [
  'React', 'Python', 'SQL', 'TypeScript', 'Java', 'Docker', 
  'AWS', 'Node.js', 'Kubernetes', 'Machine Learning', 'Tailwind CSS', 
  'GraphQL', 'PostgreSQL', 'FastAPI', 'Figma', 'C++', 'Redis', 'WebSockets'
];

const SUGGESTED_INTERESTS = [
  'Full Stack Development', 'Generative AI', 'Distributed Systems', 
  'FinTech Algorithms', 'Cloud Security', 'Human-Computer Interaction'
];

export default function StudentProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: 'Zubair Khan',
    email: 'zubair.khan@berkeley.edu',
    university: 'UC Berkeley',
    degree: 'B.S. in Computer Science',
    gradYear: '2025',
    gpa: '3.92 / 4.0',
    bio: 'Full-stack builder passionate about developer tooling, API design, and distributed systems.',
    availability: '15-20 hrs/week Part-Time',
    github: 'github.com/zubairkhan-dev',
    linkedin: 'linkedin.com/in/zubairkhan-swe',
    resumeFilename: 'Zubair_Khan_Software_Engineer_Resume.pdf'
  });

  const [skills, setSkills] = useState(['React', 'TypeScript', 'Next.js', 'Tailwind', 'Python']);
  const [interests, setInterests] = useState(['Full Stack Development', 'Distributed Systems']);
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || 'Zubair Khan',
        email: user.email || 'zubair.khan@berkeley.edu',
        university: user.university || 'UC Berkeley',
        degree: user.degree || 'B.S. in Computer Science',
        gradYear: user.gradYear || '2025',
        gpa: user.gpa || '3.92 / 4.0',
        bio: user.bio || 'Full-stack builder passionate about developer tooling, API design, and distributed systems.',
        availability: user.availability || '15-20 hrs/week Part-Time',
        github: user.github || 'github.com/zubairkhan-dev',
        linkedin: user.linkedin || 'linkedin.com/in/zubairkhan-swe',
        resumeFilename: user.resumeFilename || 'Zubair_Khan_Software_Engineer_Resume.pdf'
      });
      if (user.skills && user.skills.length > 0) {
        setSkills(user.skills);
      }
      if (user.interests && user.interests.length > 0) {
        setInterests(user.interests);
      }
    }
  }, [user]);

  const handleAddSkill = (skillName) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (!skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddInterest = (interestName) => {
    const trimmed = interestName.trim();
    if (!trimmed) return;
    if (!interests.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      setInterests([...interests, trimmed]);
    }
    setInterestInput('');
  };

  const handleRemoveInterest = (interestToRemove) => {
    setInterests(interests.filter(i => i !== interestToRemove));
  };

  const handleResumeSimUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, resumeFilename: file.name }));
      showToast(`Resume "${file.name}" uploaded & parsed with AST extractor!`, 'success');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile({
        ...formData,
        skills,
        interests
      });
      showToast('Profile and verified skills updated! Algorithmic match scores recalculated across all sprints.', 'success');
    } catch (err) {
      showToast('Failed to save profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 min-h-screen">
      <div className="flex flex-col w-full space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-mono text-xs font-bold">
              <span className="material-symbols-outlined text-[15px]">badge</span>
              <span>CANDIDATE PORTFOLIO</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface mt-1 tracking-tight">
              Student Profile & Skill Inventory
            </h1>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
              Your registered skills are directly queried by the matching engine to benchmark sprint compatibility.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>{loading ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: CORE SKILLS (The matching engine anchor) */}
          <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 border border-outline-variant/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">auto_awesome</span>
                <h2 className="text-base font-bold text-on-surface">
                  Technical Skill Graph ({skills.length})
                </h2>
              </div>
              <span className="text-xs font-bold text-[#274c19] bg-[#B8D8A2]/30 px-2.5 py-1 rounded-full border border-[#B8D8A2]/50 font-mono">
                Live in Match Engine
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Add languages, frameworks, databases, and APIs. These are compared against company requirements to calculate your match percentage (e.g. 5/5 = 100%, 4/5 = 80%).
            </p>

            {/* Add skill input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(skillInput);
                  }
                }}
                placeholder="Type skill name (e.g. React, Python, Docker) and press Add..."
                className="flex-1 text-xs rounded-xl border border-outline-variant/30 px-3.5 py-2.5 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(skillInput)}
                className="px-4 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary-container transition-colors shrink-0 shadow-xs"
              >
                Add Skill
              </button>
            </div>

            {/* Current Skills Chips */}
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/15">
              <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                {skills.map(skill => (
                  <span 
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-mono text-xs shadow-xs font-semibold"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    {skill}
                    <button 
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-on-surface-variant hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <span className="text-xs text-outline italic">No skills added yet. Click suggestions below.</span>
                )}
              </div>
            </div>

            {/* Popular Suggestions */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Quick Add Suggestions:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => handleAddSkill(s)}
                    className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary-fixed text-on-surface font-mono text-xs font-medium transition-colors border border-outline-variant/20"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: AVAILABILITY & RESUME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Availability */}
            <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-5 border border-outline-variant/20 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                <h3 className="text-sm font-bold text-on-surface">Weekly Availability</h3>
              </div>
              
              <p className="text-xs text-on-surface-variant">
                Select your current commitment capacity for project sponsors:
              </p>

              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full text-xs font-semibold rounded-xl border border-outline-variant/30 p-2.5 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="10-15 hrs/week Micro-Intern">10-15 hrs/week Micro-Intern</option>
                <option value="15-20 hrs/week Part-Time">15-20 hrs/week Part-Time (Recommended)</option>
                <option value="20-30 hrs/week Extended">20-30 hrs/week Extended</option>
                <option value="40 hrs/week Full-Time Co-op">40 hrs/week Full-Time Co-op</option>
              </select>
            </div>

            {/* Resume Upload Simulator */}
            <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-5 border border-outline-variant/20 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">description</span>
                <h3 className="text-sm font-bold text-on-surface">Resume / CV</h3>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-dashed border-outline-variant/40 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-error text-[20px]">picture_as_pdf</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate">{formData.resumeFilename}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium">AST Parsed • Updated Today</p>
                  </div>
                </div>

                <label className="px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold text-xs cursor-pointer transition-colors shrink-0">
                  Upload New
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeSimUpload} className="hidden" />
                </label>
              </div>
            </div>

          </div>

          {/* SECTION 3: ACADEMIC DETAILS & ONLINE LINKS */}
          <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 border border-outline-variant/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">school</span>
              <h3 className="text-base font-bold text-on-surface">Collegiate Profile & Repos</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">University / College</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full text-xs font-semibold rounded-xl border border-outline-variant/30 p-2.5 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">Degree & Major</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full text-xs font-semibold rounded-xl border border-outline-variant/30 p-2.5 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">GitHub Profile Handle</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">terminal</span>
                  <input
                    type="text"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full text-xs font-semibold rounded-xl border border-outline-variant/30 pl-9 p-2.5 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">Portfolio or LinkedIn</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">language</span>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full text-xs font-semibold rounded-xl border border-outline-variant/30 pl-9 p-2.5 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface block mb-1">Personal Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full text-xs font-semibold rounded-xl border border-outline-variant/30 p-2.5 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
              ></textarea>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>{loading ? 'Saving Profile...' : 'Save & Recalculate Matches'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
