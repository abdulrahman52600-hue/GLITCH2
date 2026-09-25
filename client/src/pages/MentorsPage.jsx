import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function MentorsPage({ 
  mentors = [], 
  mentorRequests = [], 
  onRefreshRequests 
}) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingSlot, setBookingSlot] = useState('Today, 4:30 PM - 5:00 PM EST');
  const [sessionTopic, setSessionTopic] = useState('Architecture & WebSockets Review');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter mentors logic
  const filteredMentors = mentors.filter(m => {
    if (activeFilter === 'all') return true;
    const domainText = (m.domain || m.role || m.company + ' ' + (m.skills || []).join(' ')).toLowerCase();
    if (activeFilter === 'fintech') return domainText.includes('fintech') || domainText.includes('stripe') || domainText.includes('finflow');
    if (activeFilter === 'ai-ml') return domainText.includes('ai') || domainText.includes('ml') || domainText.includes('pytorch') || domainText.includes('research');
    if (activeFilter === 'frontend') return domainText.includes('design') || domainText.includes('figma') || domainText.includes('react') || domainText.includes('ui');
    if (activeFilter === 'today') return m.availableSlots && m.availableSlots.length > 0;
    return true;
  });

  const handleOpenBooking = (mentor) => {
    setSelectedMentor(mentor);
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsBookingOpen(false);
      showToast(`Office hours confirmed with ${selectedMentor?.name || 'mentor'}! Calendar invite sent.`, 'success');
      if (onRefreshRequests) onRefreshRequests();
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 min-h-screen">
      <div className="flex flex-col w-full space-y-5">
        
        {/* Header Module */}
        <section className="flex flex-col space-y-1.5">
          <div className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-mono text-xs font-bold">
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span>1:1 ENGINEERING COACHING</span>
          </div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
            Industry Mentors & Faculty Advisors
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed">
            Every micro-internship is paired with a dedicated staff engineer or faculty advisor for code reviews and 1:1 syncs.
          </p>
        </section>

        {/* Live Sprint Mentor Match Banner */}
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary-container to-secondary p-4 sm:p-5 text-on-primary shadow-sm">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-surface-container-lowest/10 blur-xl pointer-events-none"></div>
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[20px] text-on-primary">bolt</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-mono uppercase tracking-wider text-on-primary/80 text-[11px] font-bold">Sprint Matching Engine</span>
                <span className="text-sm sm:text-base font-bold text-on-primary truncate">14 Office Hour Slots Open</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/20 backdrop-blur-md flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-mono text-xs text-on-primary font-bold">Live Today</span>
            </div>
          </div>
        </section>

        {/* Filter Pills Carousel */}
        <section className="flex flex-col space-y-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`filter-pill px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                activeFilter === 'all'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
              type="button"
            >
              All Domains
            </button>

            <button 
              onClick={() => setActiveFilter('fintech')}
              className={`filter-pill px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                activeFilter === 'fintech'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
              type="button"
            >
              FinTech
            </button>

            <button 
              onClick={() => setActiveFilter('ai-ml')}
              className={`filter-pill px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                activeFilter === 'ai-ml'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
              type="button"
            >
              AI/ML Infrastructure
            </button>

            <button 
              onClick={() => setActiveFilter('frontend')}
              className={`filter-pill px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                activeFilter === 'frontend'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
              type="button"
            >
              Frontend/Design
            </button>

            <button 
              onClick={() => setActiveFilter('today')}
              className={`filter-pill flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                activeFilter === 'today'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
              type="button"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Available Today
            </button>
          </div>
        </section>

        {/* Mentors Directory Cards */}
        <section className="flex flex-col space-y-4">
          
          {filteredMentors.map((mentor, mIdx) => {
            const isAyaan = mentor.name.includes('Ayaan') || mentor.name.includes('David');
            const isElena = mentor.name.includes('Elena');
            const isSarah = mentor.name.includes('Sarah');

            return (
              <article 
                key={mentor._id || mIdx}
                className="mentor-card relative flex flex-col rounded-xl bg-surface-container-lowest p-4 sm:p-5 shadow-sm border border-outline-variant/20 hover:shadow-md transition-all"
              >
                {/* Active pairing badge floating right */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img 
                        className="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-primary-fixed/50" 
                        alt={mentor.name}
                        src={mentor.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                      />
                      <span 
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full shadow-sm ${
                          isElena ? 'bg-primary-container' : 'bg-emerald-500'
                        }`} 
                        title="Active Mentor"
                      ></span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1 min-w-0">
                        <h2 className="text-base font-bold text-on-surface truncate">{mentor.name}</h2>
                        <span 
                          className={`material-symbols-outlined text-[18px] flex-shrink-0 ${
                            isElena ? 'text-tertiary' : isSarah ? 'text-secondary' : 'text-primary'
                          }`} 
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {isElena ? 'school' : isSarah ? 'palette' : 'verified'}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant line-clamp-1 font-medium mt-0.5">
                        {mentor.role} at {mentor.company}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[13px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isElena ? 'verified' : 'task_alt'}
                    </span>
                    {isElena ? 'Academic Sponsor' : isSarah ? 'Design System Lead' : '14 Sprints Mentored'}
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 font-mono text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[13px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {mentor.rating || 5.0} 
                    <span className="text-[10px] text-amber-800/70 font-normal">
                      ({mentor.reviewsCount || (isElena ? '38 papers cited' : isSarah ? '19 crits' : '22 reviews')})
                    </span>
                  </span>
                </div>

                {/* Pairing / Specialty Callout */}
                {isAyaan && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low mb-3 text-on-surface border border-outline-variant/15">
                    <span className="material-symbols-outlined text-[18px] text-secondary flex-shrink-0">hub</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Paired Sprint</span>
                      <span className="text-xs font-bold text-secondary truncate">FinFlow Webhook Dashboard Sprint</span>
                    </div>
                  </div>
                )}

                {isElena && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low mb-3 text-on-surface border border-outline-variant/15">
                    <span className="material-symbols-outlined text-[18px] text-tertiary-container flex-shrink-0">menu_book</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Independent Study Credit</span>
                      <span className="text-xs font-bold text-on-surface truncate">Co-signs 3 Academic Units for Verified Sprints</span>
                    </div>
                  </div>
                )}

                {isSarah && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low mb-3 text-on-surface border border-outline-variant/15">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0">design_services</span>
                      <span className="text-xs text-on-surface font-medium truncate">Design critique & token review</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                      Today 4:30 PM
                    </span>
                  </div>
                )}

                {/* Focus Tags */}
                <div className="flex flex-col space-y-1.5 mb-4">
                  <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">Core Expertise</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(mentor.skills || ['Distributed Systems', 'WebSockets', 'Go', 'TypeScript']).map(skill => (
                      <span key={skill} className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-[11px] font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button 
                  onClick={() => handleOpenBooking(mentor)}
                  className={`w-full flex items-center justify-center gap-2 h-11 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-[0.98] ${
                    isAyaan 
                      ? 'bg-primary hover:bg-primary-container text-on-primary' 
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isAyaan ? 'calendar_add_on' : isElena ? 'forum' : 'rate_review'}
                  </span>
                  <span>
                    {isAyaan ? 'Book 20-min Office Hours' : isElena ? 'Request Academic Guidance' : 'Book Design Review'}
                  </span>
                </button>
              </article>
            );
          })}

        </section>

        {/* Bottom Callout (Async PR Review Engine) */}
        <aside className="relative overflow-hidden rounded-xl bg-surface-container-high p-4 sm:p-5 shadow-sm border border-outline-variant/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[22px]">merge</span>
            </div>
            <div className="flex flex-col space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-bold text-on-surface">Fast GitHub PR Reviews</span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] uppercase font-bold">SLA &lt; 4H</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Need asynchronous PR review? Tag <code className="px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-[11px] text-primary font-bold">@nexbridge-mentors</code> in your GitHub pull request for automated pairing and review in under 4 hours.
              </p>
            </div>
          </div>
        </aside>

      </div>

      {/* BOOKING MODAL */}
      {isBookingOpen && selectedMentor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={selectedMentor.avatar} alt={selectedMentor.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
                <div>
                  <h3 className="text-base font-bold text-on-surface">{selectedMentor.name}</h3>
                  <p className="text-xs text-on-surface-variant">{selectedMentor.role} • {selectedMentor.company}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsBookingOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">Select Available Time Slot</label>
                <select 
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-outline-variant/40 p-2.5 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="Today, 4:30 PM - 5:00 PM EST">Today, 4:30 PM - 5:00 PM EST (Instant)</option>
                  <option value="Tomorrow, 11:00 AM - 11:30 AM EST">Tomorrow, 11:00 AM - 11:30 AM EST</option>
                  <option value="Friday, 2:00 PM - 2:30 PM EST">Friday, 2:00 PM - 2:30 PM EST</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">Sprint Deliverable / Discussion Topic</label>
                <input 
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-outline-variant/40 p-2.5 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. WebSocket reconnection backoff logic..."
                />
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low text-xs text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">videocam</span>
                <span>Zoom link generated and synced with your university Google Calendar.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={() => setIsBookingOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button 
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm hover:bg-primary-container transition-all flex items-center justify-center gap-1.5"
                type="button"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Confirm Slot</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
