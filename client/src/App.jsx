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

function MainApp() {
  const { user, role, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [activePage, setActivePage] = useState('home');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Apply modal state
  const [applyModalProject, setApplyModalProject] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const studentId = (role === 'student' && user?._id) ? user._id : undefined;

      const [projRes, appRes, mentorRes, reqRes] = await Promise.all([
        api.getProjects(studentId ? { studentId } : {}),
        api.getApplications(),
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

  // Navigate to project details
  const handleViewProject = (projectId) => {
    setSelectedProjectId(projectId);
    setActivePage('project-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open apply modal
  const handleOpenApply = (project) => {
    if (role !== 'student') {
      showToast('Please switch to a Student role to apply to projects.', 'info');
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Navigation Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        setSelectedProjectId={setSelectedProjectId}
      />

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

        {activePage === 'login' && (
          <LoginPage setActivePage={setActivePage} />
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
          />
        )}

        {activePage === 'admin-dashboard' && (
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
          <StudentProfilePage />
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

      {/* Footer */}
      <Footer setActivePage={setActivePage} />

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
