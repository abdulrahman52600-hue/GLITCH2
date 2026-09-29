import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider, useToast } from './context/ToastContext.jsx';
import { api } from './services/api.js';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ApplyModal from './components/ApplyModal.jsx';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import StudentDashboardPage from './pages/StudentDashboardPage.jsx';
import CompanyDashboardPage from './pages/CompanyDashboardPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import ExploreProjectsPage from './pages/ExploreProjectsPage.jsx';
import ProjectDetailsPage from './pages/ProjectDetailsPage.jsx';
import StudentProfilePage from './pages/StudentProfilePage.jsx';
import MentorsPage from './pages/MentorsPage.jsx';
import ApplicationsPage from './pages/ApplicationsPage.jsx';
import SkillAssessmentPage from './pages/SkillAssessmentPage.jsx';
import SkillPassportPage from './pages/SkillPassportPage.jsx';
import TalentRadarPage from './pages/TalentRadarPage.jsx';

const PATH_PAGES = {
  '/': 'home', '/home': 'home', '/login': 'login', '/signup': 'signup', '/explore': 'explore',
  '/projects': 'explore', '/project': 'project-details', '/applications': 'applications',
  '/student': 'student-dashboard', '/company': 'company-dashboard', '/admin': 'admin-dashboard',
  '/profile': 'profile', '/skill-assessment': 'skill-assessment', '/skill-passport': 'skill-passport',
  '/talent-radar': 'talent-radar', '/mentors': 'mentors'
};
const PAGE_PATHS = Object.fromEntries(Object.entries(PATH_PAGES).map(([path, page]) => [page, path]));
const pageFromPath = () => PATH_PAGES[window.location.pathname.replace(/\/$/, '') || '/'] || 'home';

function MainApp() {
  const { user, role, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [activePage, setActivePage] = useState(pageFromPath);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Apply modal state
  const [applyModalProject, setApplyModalProject] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    const syncFromLocation = () => setActivePage(pageFromPath());
    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, []);

  useEffect(() => {
    const path = PAGE_PATHS[activePage] || '/';
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
  }, [activePage]);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const studentId = (role === 'student' && user?._id) ? user._id : undefined;

      const [projRes, appRes, mentorRes, reqRes] = await Promise.all([
        api.getProjects(studentId ? { studentId } : {}),
        user ? api.getApplications() : Promise.resolve({ success: true, applications: [] }),
        api.getMentors(),
        studentId ? api.getMentorshipRequests(studentId) : Promise.resolve({ success: true, requests: [] })
      ]);

      if (projRes.success) setProjects(projRes.projects);
      if (appRes.success) setApplications(appRes.applications);
      if (mentorRes.success) setMentors(mentorRes.mentors);
      if (reqRes.success) setMentorRequests(reqRes.requests || []);
    } catch (err) {
      console.error('Failed to load application data', err);
    } finally {
      setDataLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, user, role, loadData]);

  useEffect(() => {
    if (authLoading) return;
    const requiredRole = {
      'student-dashboard': 'student',
      'company-dashboard': 'company',
      'admin-dashboard': 'admin',
      profile: 'student',
      'skill-assessment': 'student',
      'skill-passport': 'student',
      'talent-radar': 'company'
    }[activePage];
    if ((requiredRole && role !== requiredRole) || (activePage === 'applications' && !user)) {
      setActivePage('home');
      showToast(user ? 'That workspace is not available for this account.' : 'Sign in to open your workspace.', 'info');
    }
  }, [activePage, authLoading, role, user, showToast]);

  // Navigate to project details
  const handleViewProject = (projectId) => {
    setSelectedProjectId(projectId);
    setActivePage('project-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open apply modal
  const handleOpenApply = (project) => {
    if (!user) {
      showToast('Sign in or create a student account to apply.', 'info');
      setActivePage('login');
      return;
    }
    if (role !== 'student') {
      showToast('Sign in with a student account to apply to projects.', 'info');
      return;
    }
    setApplyModalProject(project);
    setIsApplyModalOpen(true);
  };

  const handleApplySuccess = (newApplication) => {
    setApplications(prev => [newApplication, ...prev]);
    loadData();
  };

  const selectedProject = projects.find(p => p._id === selectedProjectId) || projects[0];

  const isAuthPage = activePage === 'login' || activePage === 'signup';

  return (
    <div className={`min-h-screen flex flex-col ${isAuthPage ? 'bg-[#f7faf5]' : 'bg-slate-50'} text-slate-900`}>
      {!isAuthPage && (
        <Navbar
          activePage={activePage}
          setActivePage={(page) => {
            setActivePage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          setSelectedProjectId={setSelectedProjectId}
        />
      )}

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            projects={projects}
            mentors={mentors}
            onViewDetails={handleViewProject}
            onApply={handleOpenApply}
            setActivePage={setActivePage}
          />
        )}

        {(activePage === 'login' || activePage === 'signup') && (
          <LoginPage initialMode={activePage === 'signup' ? 'signup' : 'login'} setActivePage={setActivePage} />
        )}

        {activePage === 'student-dashboard' && (
          <StudentDashboardPage
            projects={projects}
            applications={applications}
            mentorRequests={mentorRequests}
            onViewDetails={handleViewProject}
            onApply={handleOpenApply}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'company-dashboard' && (
          <CompanyDashboardPage
            projects={projects}
            applications={applications}
            onRefreshData={loadData}
            onViewProject={handleViewProject}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'admin-dashboard' && role === 'admin' && (
          <AdminDashboardPage
            projects={projects}
            onRefreshData={loadData}
          />
        )}

        {activePage === 'explore' && (
          <ExploreProjectsPage
            projects={projects}
            applications={applications}
            onViewDetails={handleViewProject}
            onApply={handleOpenApply}
          />
        )}

        {activePage === 'project-details' && selectedProject && (
          <ProjectDetailsPage
            project={selectedProject}
            applications={applications}
            onBack={() => setActivePage('explore')}
            onApply={handleOpenApply}
            onUpdateStatus={() => loadData()}
          />
        )}

        {activePage === 'profile' && (
          <StudentProfilePage onVerifySkill={() => setActivePage('skill-assessment')} />
        )}

        {activePage === 'skill-assessment' && (
          <SkillAssessmentPage onBack={() => setActivePage('profile')} />
        )}

        {activePage === 'skill-passport' && (
          <SkillPassportPage setActivePage={setActivePage} applications={applications} projects={projects} />
        )}

        {activePage === 'talent-radar' && (
          <TalentRadarPage projects={projects} />
        )}

        {activePage === 'mentors' && (
          <MentorsPage
            mentors={mentors}
            mentorRequests={mentorRequests}
            onRefreshRequests={loadData}
          />
        )}

        {activePage === 'applications' && (
          <ApplicationsPage
            applications={applications}
            onRefreshData={loadData}
            onViewProject={handleViewProject}
            setActivePage={setActivePage}
          />
        )}
      </main>

      {/* Apply Modal */}
      <ApplyModal
        project={applyModalProject}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={handleApplySuccess}
      />

      {!isAuthPage && <Footer setActivePage={setActivePage} />}

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
