import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Smartphone,
  UserRound,
  UsersRound,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import NexBridgeLogo from '../components/NexBridgeLogo.jsx';

const highlights = [
  'Verified skills, not just self-declared skills',
  'Evidence-based matching for real micro-internships',
  'Secure role-based access for students and companies'
];

export default function LoginPage({ setActivePage, initialMode = 'login' }) {
  const { demoUsers, loginUser, switchRole } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDemos, setShowDemos] = useState(false);
  const [accountType, setAccountType] = useState('student');
  const [providers, setProviders] = useState({ google: false, github: false, phone: false });
  const [phoneMode, setPhoneMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    password: ''
  });

  useEffect(() => setMode(initialMode), [initialMode]);

  useEffect(() => {
    api.getAuthProviders().then(response => setProviders(response.providers || {})).catch(() => {});
    const params = new URLSearchParams(window.location.search);
    const error = params.get('authError');
    const code = params.get('oauth_code');
    if (error) showToast(error, 'error');
    if (code) {
      setLoading(true);
      api.exchangeOAuthCode(code).then(response => {
        loginUser(response.user, response.token);
        showToast(`Welcome to NexBridge, ${response.user.name}!`, 'success');
        setActivePage(response.user.role === 'company' ? 'company-dashboard' : 'student-dashboard');
      }).catch(err => showToast(err.message || 'Social sign-in failed.', 'error')).finally(() => setLoading(false));
    }
    if (error || code) window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`);
  }, []);

  const beginSocialLogin = (provider) => {
    if (!providers[provider]) { showToast(`${provider === 'google' ? 'Google' : 'GitHub'} sign-in needs provider credentials from the site owner.`, 'info'); return; }
    window.location.assign(`/api/auth/oauth/${provider}/start?role=${encodeURIComponent(accountType)}`);
  };

  const sendPhoneCode = async () => {
    try { await api.sendPhoneCode(phone.trim()); setPhoneCodeSent(true); showToast('Verification code sent.', 'success'); }
    catch (error) { showToast(error.message || 'Could not send code.', 'error'); }
  };

  const verifyPhone = async (event) => {
    event.preventDefault(); setLoading(true);
    try {
      const response = await api.verifyPhoneCode(phone.trim(), phoneCode.trim(), accountType, phoneName.trim());
      loginUser(response.user, response.token);
      showToast(`Welcome to NexBridge, ${response.user.name}!`, 'success');
      setActivePage(response.user.role === 'company' ? 'company-dashboard' : 'student-dashboard');
    } catch (error) { showToast(error.message || 'Phone verification failed.', 'error'); }
    finally { setLoading(false); }
  };

  const studentUser = useMemo(() => demoUsers.find(u => u.role === 'student'), [demoUsers]);
  const companyUser = useMemo(() => demoUsers.find(u => u.role === 'company'), [demoUsers]);

  const setField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleDemoLogin = async (role) => {
    await switchRole(role);
    showToast(`Demo ${role} access activated.`, 'success');
    if (role === 'student') setActivePage('student-dashboard');
    else if (role === 'company') setActivePage('company-dashboard');
    else setActivePage('student-dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const res = await api.register({
          name: formData.name,
          email: formData.email,
          role: 'student',
          university: formData.university,
          password: formData.password,
          skills: []
        });
        if (!res.success || !res.user) {
          showToast(res.error || 'Unable to create your account.', 'error');
          return;
        }
        loginUser(res.user, res.token);
        showToast(`Welcome to NexBridge, ${res.user.name}!`, 'success');
        setActivePage('student-dashboard');
      } else {
        const res = await api.login({ email: formData.email, password: formData.password, role: accountType });
        if (!res.success || !res.user) {
          showToast(res.error || 'Invalid email or password.', 'error');
          return;
        }
        loginUser(res.user, res.token);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        setActivePage(res.user.role === 'company' ? 'company-dashboard' : res.user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const demoCards = [
    {
      role: 'student',
      label: 'Student',
      icon: GraduationCap,
      name: studentUser?.name || 'Zubair Khan',
      detail: 'Verified student experience',
      meta: 'Skill Passport • Projects • Matching'
    },
    {
      role: 'company',
      label: 'Company',
      icon: Building2,
      name: companyUser?.name || 'Ayaan Siddiqui',
      detail: 'Talent & project workspace',
      meta: 'Talent Radar • Micro-sprints • Hiring'
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#f7faf5]">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#dff0d5] blur-3xl opacity-70" />
      <div className="absolute -bottom-52 -right-32 h-[30rem] w-[30rem] rounded-full bg-[#e7eefb] blur-3xl opacity-70" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-7 flex items-center justify-between">
          <button type="button" onClick={() => setActivePage('home')} className="transition-transform hover:scale-[1.02]">
            <NexBridgeLogo className="h-10 w-auto" />
          </button>
          <button
            type="button"
            onClick={() => setActivePage('home')}
            className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur hover:border-slate-300 hover:text-slate-900"
          >
            Back to NexBridge
          </button>
        </div>

        <div className="grid overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative hidden overflow-hidden bg-[#152512] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #b8d8a2 0 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
            <div className="relative">
              <div className="mb-12 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#d9efce] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Skill-first career bridge
              </div>
              <p className="mb-3 text-sm font-semibold text-[#b8d8a2]">STUDENT × INDUSTRY</p>
              <h1 className="max-w-lg text-4xl font-extrabold leading-[1.08] tracking-tight xl:text-5xl">
                Prove what you can do. Then get matched to work.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
                NexBridge connects verified student capability with focused industry micro-internships through assessment, evidence and explainable matching.
              </p>

              <div className="mt-9 space-y-3">
                {highlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#b8d8a2]" />
                    <span className="text-xs font-medium leading-5 text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-12 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <div className="rounded-xl bg-white/[0.06] p-3"><p className="text-lg font-extrabold">01</p><p className="mt-1 text-[10px] text-slate-400">Assess</p></div>
              <div className="rounded-xl bg-white/[0.06] p-3"><p className="text-lg font-extrabold">02</p><p className="mt-1 text-[10px] text-slate-400">Verify</p></div>
              <div className="rounded-xl bg-[#b8d8a2] p-3 text-[#152512]"><p className="text-lg font-extrabold">03</p><p className="mt-1 text-[10px] font-semibold">Match</p></div>
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10 xl:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-7">
                <div className="mb-4 inline-flex rounded-full bg-[#eff7eb] p-1">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    Create account
                  </button>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
                  {mode === 'login' ? 'Welcome back.' : 'Start your Skill Passport.'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {mode === 'login'
                    ? 'Sign in to continue to your NexBridge workspace.'
                    : 'Create a student account and build verified evidence of your skills.'}
                </p>
                {mode === 'login' && <div className="mt-4"><label htmlFor="account-type" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Workspace</label><select id="account-type" value={accountType} onChange={event => setAccountType(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-[#88ad73]"><option value="student">Student</option><option value="company">Company</option></select></div>}
              </div>

              {mode === 'login' && <div className="mb-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => beginSocialLogin('google')} title={providers.google ? 'Continue securely with Google' : 'Google credentials need to be configured by the site owner'} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><span aria-hidden="true" className="text-sm font-black text-[#4285F4]">G</span>Google</button><button type="button" onClick={() => beginSocialLogin('github')} title={providers.github ? 'Continue securely with GitHub' : 'GitHub credentials need to be configured by the site owner'} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-slate-900 text-[8px] font-black text-white">GH</span>GitHub</button><button type="button" onClick={() => setPhoneMode(value => !value)} title={providers.phone ? 'Receive a one-time code by SMS' : 'SMS credentials need to be configured by the site owner'} className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><Smartphone className="h-4 w-4" />{phoneMode ? 'Use email and password' : 'Continue with mobile number'}</button><p className="col-span-2 text-center text-[10px] text-slate-400">Provider buttons need the site owner to finish setup before real sign-in can be used.</p></div>}

              {phoneMode && mode === 'login' ? <form onSubmit={verifyPhone} className="space-y-3 rounded-2xl bg-slate-50 p-4"><label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500" htmlFor="phone-number">Mobile number</label><input id="phone-number" type="tel" required value={phone} onChange={event => setPhone(event.target.value)} placeholder="+91 98765 43210" autoComplete="tel" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#88ad73]"/><p className="text-[10px] text-slate-500">Include country code, for example +91…</p><label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500" htmlFor="phone-full-name">Full name</label><input id="phone-full-name" type="text" required minLength={2} value={phoneName} onChange={event => setPhoneName(event.target.value)} placeholder="Your full name" autoComplete="name" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#88ad73]"/>{phoneCodeSent && <><label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500" htmlFor="phone-code">Verification code</label><input id="phone-code" inputMode="numeric" autoComplete="one-time-code" required value={phoneCode} onChange={event => setPhoneCode(event.target.value)} placeholder="Enter the SMS code" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#88ad73]"/></>}{phoneCodeSent ? <button disabled={loading} className="w-full rounded-xl bg-[#183017] py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Verifying…' : 'Verify and sign in'}</button> : <button type="button" onClick={sendPhoneCode} className="w-full rounded-xl bg-[#183017] py-3 text-sm font-bold text-white">Send verification code</button>}</form> : <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Full name</label>
                      <div className="relative">
                        <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input required value={formData.name} onChange={(e) => setField('name', e.target.value)} placeholder="Your full name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#88ad73] focus:bg-white focus:ring-4 focus:ring-[#b8d8a2]/20" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">University / college</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input value={formData.university} onChange={(e) => setField('university', e.target.value)} placeholder="e.g. IIIT Hyderabad" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#88ad73] focus:bg-white focus:ring-4 focus:ring-[#b8d8a2]/20" />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="email" required value={formData.email} onChange={(e) => setField('email', e.target.value)} placeholder="you@example.com" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#88ad73] focus:bg-white focus:ring-4 focus:ring-[#b8d8a2]/20" />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Password</label>
                    {mode === 'login' && <span className="text-[10px] font-semibold text-slate-400">Use your account password</span>}
                  </div>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={(e) => setField('password', e.target.value)} placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'} className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-[#88ad73] focus:bg-white focus:ring-4 focus:ring-[#b8d8a2]/20" />
                    <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="flex items-start gap-2 rounded-2xl border border-[#dcebd4] bg-[#f6fbf3] p-3 text-[11px] leading-5 text-slate-600">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4f7b3c]" />
                    <span>New accounts are student accounts. Company and admin access is controlled separately by NexBridge.</span>
                  </div>
                )}

                <button disabled={loading} type="submit" className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#183017] py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#183017]/15 transition hover:-translate-y-0.5 hover:bg-[#274b23] disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? 'Please wait…' : mode === 'login' ? 'Sign in to NexBridge' : 'Create student account'}
                  {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </button>
              </form>}

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">or for judging</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {demoUsers.length > 0 && <button type="button" onClick={() => setShowDemos(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-extrabold text-slate-700 transition hover:border-[#9fbe8e] hover:bg-[#f7fbf5]">
                <UsersRound className="h-4 w-4" />
                Open 1-click judge demo access
              </button>}

              <p className="mt-5 text-center text-[10px] leading-5 text-slate-400">
                New public accounts are student accounts. Company and admin access is issued by the platform.
              </p>
            </div>
          </section>
        </div>
      </div>

      {showDemos && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={() => setShowDemos(false)}>
          <div className="w-full max-w-3xl rounded-[28px] border border-white/60 bg-white p-5 shadow-2xl sm:p-7" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#4f7b3c]">SIH judge mode</p>
                <h3 className="mt-1 text-2xl font-extrabold text-slate-950">Choose a demo workspace</h3>
                <p className="mt-1 text-xs text-slate-500">Jump directly into the three role experiences without credentials.</p>
              </div>
              <button type="button" onClick={() => setShowDemos(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {demoCards.map(({ role, label, icon: Icon, name, detail, meta }) => (
                <button key={role} type="button" onClick={async () => { setShowDemos(false); await handleDemoLogin(role); }} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-[#9fbe8e] hover:bg-[#f6fbf3] hover:shadow-md">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-xl bg-white p-2.5 text-[#4f7b3c] shadow-sm"><Icon className="h-5 w-5" /></div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Ready</span>
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{label}</p>
                  <p className="mt-1 font-extrabold text-slate-900">{name}</p>
                  <p className="mt-1 text-xs text-slate-500">{detail}</p>
                  <p className="mt-3 text-[10px] font-semibold leading-4 text-slate-400">{meta}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-extrabold text-[#3d6730]">Enter workspace <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
