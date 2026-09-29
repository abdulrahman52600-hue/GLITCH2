# NexBridge V4

## Super Admin Console
- Reworked the admin dashboard into a governance console with live platform metrics, searchable opportunity moderation, and a searchable, role-filtered user directory.
- Added explicit loading, empty, and API error states.
- Kept opportunity moderation connected to the existing authenticated Express API.

## Work outcomes and reputation
- Replaced the illustrative Applications & Sprints page with the authenticated application pipeline and live statuses.
- Companies can progress accepted work into a sprint, then record a completion summary, 1–5 employer rating, demonstrated skills, and optional proof-of-work URL.
- Only the owning company can submit a review; only accepted/in-progress work can be completed; completed reviews cannot be edited.
- Students see employer-verified outcomes in Applications and the Work Reputation tab of their Skill Passport. Scores and completed-work counts derive from those records rather than placeholder values.
- Skill-gap comparisons now use current open opportunities and their actual required skills.

## Access and permissions
- New visitors stay signed out, can browse public pages, and get clear sign-in/create-account actions. Existing sessions are restored only when their server token is valid.
- Removed automatic demo-student login and removed demo role switching from the main navigation.
- Demo persona access is opt-in through `ENABLE_DEMO_ACCOUNTS=true`; it is off in the supplied environment template.
- Removed admin from demo account discovery and role switching.
- Added server-configured `ADMIN_EMAIL` and `ADMIN_PASSWORD` access for the seeded admin account when it has no stored password hash.
- Kept all admin APIs behind authenticated admin-role checks and returned sanitized user records without password fields.
- Validated project status changes against the supported `Open` and `Closed` values.
- Added a client-side route guard as an extra navigation safeguard; the server remains the authorization boundary.

## Assessment focus and camera safeguards
- Added a clear pre-test rules and consent screen before requesting camera permission.
- The first assessment-page hide warns the student; the second pauses the timer and requires acknowledgement; the third invalidates the attempt server-side.
- Server records focus events, rejects submissions while paused or after invalidation, and expires an unresumed pause after two minutes.
- Added browser-side face/head direction reminders after roughly five continuous seconds away. This only warns and never fails an attempt by itself.
- Camera frames stay in the browser and are not recorded or sent to the NexBridge API. The consent notice discloses that MediaPipe may send non-image usage/performance metrics to Google.
- Build and security test checklist updated for assessment monitoring.

## Setup
Copy `.env.example` to `.env`, configure persistent MongoDB, set a unique long `SESSION_SECRET`, and configure the admin credentials on the server. In-memory mode is for local demos only and loses new data when the server restarts. Do not commit or expose `.env` values in the client bundle.

Build and run from the project root with `npm run build` and `npm start`.
