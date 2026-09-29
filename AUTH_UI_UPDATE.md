# NexBridge Authentication UI Update

## SIH-ready Login + Sign Up

The authentication experience was redesigned without changing the server authentication contract or the existing application modules.

### Login
- Clean NexBridge branded split-screen experience on desktop.
- Responsive mobile layout.
- Email + password authentication.
- Password visibility toggle.
- Clear loading state and authentication feedback.
- Dedicated 1-click SIH judge demo access modal for Student, Company and Admin personas.

### Sign Up
- Student account creation only, matching the server's public registration policy.
- Full name, university/college, email and password.
- Clear explanation that company/admin access is controlled separately.
- Uses the existing secure server-side registration endpoint.

### Judge experience
- The global navbar/footer are hidden while the authentication screen is active so the page behaves like a focused product login experience.
- Demo access remains one click away rather than exposing demo credentials in the form.

## Validation
- Server JavaScript syntax checks passed.
- Full Vite build was not completed because the environment does not currently have the client dependencies installed and dependency installation timed out.
