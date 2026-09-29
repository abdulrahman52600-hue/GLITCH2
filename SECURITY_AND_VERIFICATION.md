# NexBridge Skill Verification & Security Upgrade v2

## What was added

### 1. Multi-level skill verification
- Beginner, Intermediate and Advanced assessment levels.
- Each level has its own question pool and time limit.
- The selected level is stored with the server-side verification record.

### 2. Randomized question bank
- The browser receives a random subset of questions from the selected level.
- Correct answers and coding rubrics remain server-side.
- This reduces simple answer-sharing/replay opportunities.

### 3. Practical coding assessment
- Python, JavaScript and SQL include a coding task.
- The demo evaluates submissions with a server-side rubric without executing untrusted code.
- For production, replace the rubric with an isolated sandbox/container execution service.

### 4. Protected verification badge
- Self-declared skills and verified skills are separate.
- Verified records contain skill, score, proficiency level, verification date and assessment version.
- Profile APIs reject client attempts to edit `verifiedSkills`, `role`, IDs or creation metadata.

### 5. Retry controls
- Failed attempts have a short cooldown.
- A per-skill daily attempt limit is enforced server-side.
- The UI does not reveal the correct answers after failure.

### 6. Authentication hardening
- Sessions are signed and expire.
- New registered accounts use server-side `scrypt` password hashing.
- Password hashes are never returned in public user responses.
- Demo personas remain available through the explicit one-click demo flow for judging.

### 7. Security demo for judges
The Skill Verification page exposes a server-reported security-control checklist covering:
- server-side scoring
- attempt ownership
- one-time submission
- expiry enforcement
- protected verified skills
- role authorization
- rate limiting
- input limits

### 9. Assessment focus and camera checks
- The assessment asks students to review the rules and explicitly consent before requesting camera access.
- The first time the assessment page becomes hidden, the student receives a warning. The second time, the server pauses the attempt timer and requires acknowledgement to resume. The third time invalidates the attempt.
- Focus-loss events are stored with the assessment attempt and checked by the server on resume and submission. A paused attempt expires if it is not resumed within two minutes.
- A browser-side MediaPipe Face Landmarker estimates sustained face/head direction and face presence. A reminder appears after about five continuous seconds away; camera reminders alone do not invalidate an attempt.
- Camera frames are processed in the browser and are not recorded or uploaded to the NexBridge API. The Face Landmarker library may send non-image usage/performance metrics to Google; the consent text discloses this.
- Camera permission is required to start a monitored assessment. The site must be served over HTTPS or localhost for browser camera access.

### 8. Super Admin console access
- Admin demo accounts are excluded from the public demo persona list and role switcher.
- New visitors remain signed out. One-click student/company personas require the explicit `ENABLE_DEMO_ACCOUNTS=true` server setting and are disabled by default.
- The seeded demo administrator can sign in only when `ADMIN_EMAIL` matches that account and `ADMIN_PASSWORD` is configured on the server.
- Admin APIs require an authenticated server session with the `admin` role; user directory responses remove password fields and project status changes accept only `Open` or `Closed`.
- Public registration always creates student accounts.

## Authorized security test checklist

Only test NexBridge itself or systems where you have explicit permission.

1. Change `score` or `passed` in a browser request: server-side scoring must ignore client-supplied results.
2. Add `verifiedSkills` to a profile update: API must reject the protected field.
3. Submit an application with another `studentId`: server must derive identity from the authenticated session.
4. Update an application owned by another company: API must return 403.
5. Submit one assessment twice: second submission must be rejected.
6. Submit an expired assessment: server must reject it.
7. Call admin APIs with a student/company session: server must return 403.
8. Send excessive requests: rate limiter must return 429.
9. Attempt login with an incorrect password for a password-backed account: server must reject it.
10. Inspect `/api/auth/demo-users`: password hashes must not be present.
11. Attempt admin sign-in without the configured admin password: the server must reject it.
12. Request `/api/admin/users` as a student or company: the server must return 403.
13. Submit an unsupported project status to `/api/admin/projects/:id/status`: the server must return 400.
14. Start an assessment without `cameraConsent: true`: the server must reject it.
15. Record one focus-loss event: the attempt remains active and the UI warns the student.
16. Record a second focus-loss event: the server pauses the timer; resume must extend expiry by the paused duration.
17. Record a third focus-loss event: the server invalidates the attempt and rejects submission.
18. Submit while an attempt is paused or invalidated: the server must reject submission.
19. During a real camera check, verify the browser camera permission prompt appears and the UI does not offer assessment start until face calibration succeeds.
20. Keep the camera pointed away for more than five seconds: a reminder should appear; return to the screen and verify that the reminder clears without ending the attempt.

## Production boundary

This is a hackathon/demo implementation. Before production use:
- configure persistent MongoDB for user, application, work outcome, project, and assessment records; without it, the fallback store is in-memory only;
- use HTTPS and a strong persistent `SESSION_SECRET` environment variable;
- use centralized session/rate-limit storage for multiple instances;
- replace the demo coding rubric with an isolated execution sandbox;
- use a production identity provider or fully managed authentication flow;
- restrict `CLIENT_ORIGIN` to the real frontend origin;
- add audit logging and monitoring for authentication and assessment abuse.
