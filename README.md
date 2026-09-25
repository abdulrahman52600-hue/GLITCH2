# 🎓 Student-Industry Bridge

> **Bridging Higher Education & Industry Needs Through Transparent, Skill-First Algorithmic Matching**

A modern, responsive full-stack web application designed to connect university students with companies, corporate internships, capstone projects, and industry mentors based on verified technical skillset alignment.

---

## 🌟 Key Highlights & Features

### 1. 🧮 Intelligent Skill-Matching Engine
- **Formula**:
  $$\text{Match Percentage} = \text{round}\left(\frac{|S \cap P|}{|P|} \times 100\right)$$
  - $S$ = Student verified skills list (e.g. `['React', 'Python', 'SQL']`)
  - $P$ = Project required skills list (e.g. `['React', 'Python', 'Java']`)
  - Intersecting skills = `['React', 'Python']` (2)
  - Match = $\frac{2}{3} = \mathbf{67\%}$
- **Canonical Skill Alias Normalization**: Maps variants like `React.js` $\to$ `React`, `py` $\to$ `Python`, `k8s` $\to$ `Kubernetes`, `Node` $\to$ `Node.js`.
- **Dynamic Color Gauges**: Visual gauges color-coded for instant clarity (Emerald $\ge 85\%$, Indigo $\ge 60\%$, Amber $< 60\%$).
- **Skill Gap Insights**: Recommends missing skills directly on cards and project details (e.g., *"Learn Java to boost your match from 67% to 100%!"*).
- **Interactive Simulator**: Live interactive calculator on the Home page allowing users to experiment with skills in real-time.

---

## 👥 Three Roles & Workflows

### 1. 🎓 Student Persona (`Zubair Khan`, UC Berkeley CS '25)
- **Profile & Skill Inventory**: Manage languages, frameworks, databases, availability (`15-20 hrs/week Part-Time`), resume upload simulation, and domain interests.
- **Recommended Projects**: Automatically ranks available internships and projects by highest match percentage.
- **Project Applications**: Apply with personalized cover notes and review your live skill match preview before submitting.
- **Application Tracker**: Multi-stage progress stepper (`Submitted` $\to$ `Under Review` $\to$ `Shortlisted` $\to$ `Accepted` or `Rejected`) with recruiter feedback notes.
- **Industry Mentorship**: Browse mentors from Stripe, Figma, and UC Berkeley, and schedule 1-on-1 career coaching sessions.

### 2. 🏢 Company Persona (`FinFlow Technologies` / `Ayaan Siddiqui`)
- **Company Profile**: Industry branding, location, verified badge, and company size.
- **Post Opportunities**: Create internships, short-term projects, or fellowships specifying duration, deadline, compensation/stipend, deliverables, and required skills for the matching formula.
- **Applicant Review Pipeline**: Review candidates pre-sorted by match percentage, inspect candidate statement and matched/missing skills.
- **Candidate Actions**: 1-click **Shortlist**, **Accept** (Offer), or **Reject** with custom recruiter feedback notes that reflect in the student's tracker in real time.

### 3. 🛡️ Admin Persona (`Mohammed Saad`, Platform Administrator)
- **Governance Metrics**: View total verified students, partner companies, open listings, total applications, and average match rate.
- **Project Moderation**: Close, re-open, or remove project listings.
- **Platform User Directory**: Inspect all registered student, employer, and administrator accounts.
- **Engine Diagnostics**: Live database connectivity telemetry (MongoDB / Active In-Memory Store).

---

## 📱 Ten Pages Included

1. **Home (`/`)**: Hero banner, live interactive skill match simulator, platform metrics, featured opportunities, role pillars, and mentor spotlights.
2. **Login & Persona Switcher (`/login`)**: 1-Click Instant Demo Login cards for Student, Company, and Admin, plus standard registration.
3. **Student Dashboard (`/student-dashboard`)**: Readiness KPIs, recommended matched projects, active application pipeline, quick skill inventory editor, and upcoming mentor meetings.
4. **Company Dashboard (`/company-dashboard`)**: Active postings manager, total applicant metrics, post-project trigger, and candidate review pipeline with match %.
5. **Explore Projects (`/explore`)**: Searchable directory with filters for Type (Internship, Project, Fellowship), Industry, Minimum Match % slider, and sorting by Highest Match or Deadline.
6. **Project Details (`/project-details`)**: Deep-dive into project deliverables, visual Skill Match Gauge, matched vs missing skills breakdown, skill gap tips, and "Apply Now" modal.
7. **Student Profile (`/profile`)**: Interactive skills manager (add/remove chips, popular suggestions), availability selector, resume upload preview, and portfolio links.
8. **Mentors (`/mentors`)**: Directory of industry mentors with domain filters, bio, rating, topics, and "Request 1:1 Session" modal.
9. **Applications (`/applications`)**: 
   - **Student View**: Lifecycle timeline stepper, recruiter feedback, and matched skills.
   - **Company View**: Candidate pipeline with match % gauges and status actions.
10. **Admin Dashboard (`/admin-dashboard`)**: Platform-wide KPIs, project moderation table, user directory, and engine status.

---

## 🛠️ Technology Stack

- **Frontend**: React 18/19, Tailwind CSS, Lucide React Icons, Vite.
- **Backend**: Node.js, Express, RESTful APIs, CORS.
- **Database Layer**: MongoDB / Mongoose ready, with an intelligent active in-memory persistence store fallback ensuring zero crashes or dependencies when MongoDB is not running locally.
- **Design**: Modern glassmorphism, responsive mobile drawer, accessible forms, animated gradients, and interactive toast notifications.

---

## 🚀 Running the Project Locally

### 1. Start the Backend API Server
```bash
cd server
npm install
npm run dev
# Server runs at http://localhost:5000
```

### 2. Start the Frontend Vite Client
```bash
cd client
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

### 3. Open in Browser
Visit **`http://localhost:5173`** in your browser. Use the 1-click role switcher in the navbar to test as **Student**, **Company**, or **Admin** seamlessly!
