import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import NexBridgeLogo from './NexBridgeLogo.jsx';
import { Bell, Check, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';

export default function Navbar({ activePage, setActivePage, setSelectedProjectId }) {
  const { user, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState('');
  const notificationRef = useRef(null);
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.getNotifications();
      setNotifications(response.notifications || []);
      setNotificationError('');
    } catch (error) { setNotificationError(error.message || 'Could not load notifications.'); }
  }, [user]);
  useEffect(() => { loadNotifications(); }, [loadNotifications]);
  useEffect(() => {
    const closeOutside = (event) => { if (!notificationRef.current?.contains(event.target)) setNotificationsOpen(false); };
    const closeEscape = (event) => { if (event.key === 'Escape') setNotificationsOpen(false); };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape); };
  }, []);

  const navigate = (page, projectId = null) => {
    if (projectId) setSelectedProjectId(projectId);
    setActivePage(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dashboardPage = role === 'company' ? 'company-dashboard' : role === 'admin' ? 'admin-dashboard' : 'student-dashboard';
  const linkClass = (page) => `rounded-xl px-3 py-2 text-sm font-semibold transition ${activePage === page ? 'bg-primary-fixed/40 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('home')} aria-label="NexBridge home" className="shrink-0">
          <NexBridgeLogo className="h-8 w-auto sm:h-9" />
        </button>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          <button onClick={() => navigate('home')} className={linkClass('home')}>Home</button>
          <button onClick={() => navigate('explore')} className={linkClass('explore')}>Explore Sprints</button>
          <button onClick={() => navigate('mentors')} className={linkClass('mentors')}>Mentors</button>
          {user && <button onClick={() => navigate('applications')} className={linkClass('applications')}>Applications</button>}
          {user && <button onClick={() => navigate(dashboardPage)} className={linkClass(dashboardPage)}>Dashboard</button>}
        </nav>

        {!user ? (
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button onClick={() => navigate('login')} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Sign in</button>
            <button onClick={() => navigate('signup')} className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-on-primary shadow-sm hover:opacity-90">Create account</button>
          </div>
        ) : (
          <div className="relative flex shrink-0 items-center gap-2">
            {role === 'admin' && <button onClick={() => navigate('admin-dashboard')} className="hidden items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-on-primary sm:inline-flex"><ShieldCheck className="h-4 w-4" />Admin Console</button>}
            <div className="relative" ref={notificationRef}>
              <button type="button" onClick={() => { setNotificationsOpen(open => !open); if (!notificationsOpen) loadNotifications(); }} aria-label={`Notifications${notifications.some(item => !item.readAt) ? ', unread items' : ''}`} aria-expanded={notificationsOpen} className="relative rounded-full p-2.5 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40">
                <Bell className="h-5 w-5" />
                {notifications.some(item => !item.readAt) && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />}
              </button>
              {notificationsOpen && <section aria-label="Notification center" className="absolute right-0 top-full z-[70] mt-2 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h2 className="text-sm font-extrabold text-slate-900">Notifications</h2><p className="text-[11px] text-slate-500">Updates about applications and your workspace</p></div><button type="button" onClick={async () => { await api.markAllNotificationsRead(); await loadNotifications(); }} disabled={!notifications.some(item => !item.readAt)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-primary hover:bg-slate-50 disabled:opacity-40"><Check className="h-3.5 w-3.5" />Mark all read</button></div>
                <div className="max-h-[min(65vh,26rem)] overflow-y-auto">
                  {notificationError ? <p role="alert" className="p-5 text-center text-xs text-rose-700">{notificationError}</p> : notifications.length ? notifications.map(item => <button key={item._id} type="button" onClick={async () => { if (!item.readAt) await api.markNotificationRead(item._id); await loadNotifications(); setNotificationsOpen(false); navigate(item.href || 'applications'); }} className={`block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${item.readAt ? '' : 'bg-emerald-50/60'}`}><span className="flex items-start gap-2"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.readAt ? 'bg-slate-200' : 'bg-emerald-600'}`} /><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-800">{item.title}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{item.message}</span><span className="mt-1 block text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</span></span></span></button>) : <p className="p-8 text-center text-xs text-slate-500">You’re all caught up. New application updates will appear here.</p>}
                </div>
              </section>}
            </div>
            <button onClick={() => setMenuOpen(open => !open)} aria-expanded={menuOpen} aria-label="Open account menu" className="flex items-center gap-2 rounded-full border border-slate-200 p-1 pr-2 hover:bg-slate-50">
              <img src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'NexBridge')}`} alt="" className="h-8 w-8 rounded-full object-cover" />
              <span className="hidden max-w-28 truncate text-xs font-bold text-slate-700 sm:block">{user.name}</span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
            {menuOpen && <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs capitalize text-slate-500">{role} account</p>
              </div>
              {role === 'student' && <button onClick={() => navigate('profile')} className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Profile and skills</button>}
              {role === 'student' && <button onClick={() => navigate('skill-passport')} className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Skill Passport</button>}
              {role === 'admin' && <button onClick={() => navigate('admin-dashboard')} className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Admin Console</button>}
              <button onClick={async () => { await logout(); navigate('home'); }} className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-slate-100 px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"><LogOut className="h-4 w-4" />Sign out</button>
            </div>}
          </div>
        )}
      </div>
      <nav aria-label="Mobile navigation" className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-1 md:hidden">
        <button onClick={() => navigate('home')} className={linkClass('home')}>Home</button>
        <button onClick={() => navigate('explore')} className={linkClass('explore')}>Explore</button>
        <button onClick={() => navigate('mentors')} className={linkClass('mentors')}>Mentors</button>
        {user && <button onClick={() => navigate('applications')} className={linkClass('applications')}>Applications</button>}
        {user && <button onClick={() => navigate(dashboardPage)} className={linkClass(dashboardPage)}>Dashboard</button>}
      </nav>
    </header>
  );
}
