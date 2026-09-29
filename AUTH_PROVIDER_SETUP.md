# Sign-in provider setup

The login page includes Google, GitHub, and mobile SMS options. The server keeps provider secrets private and reports each option as available only when its credentials are configured.

## 1. Set the public URLs

Copy `.env.example` to `.env` on the server and set:

- `CLIENT_PUBLIC_URL`: the public website origin, for example `https://nexbridge.example`
- `SERVER_PUBLIC_URL`: the public API origin. If the website and API share one origin, use the same URL for both.
- `CLIENT_ORIGIN`: the website origin allowed to call the API
- `SESSION_SECRET`: replace the example with a long, random secret

Use HTTPS for production. Never commit `.env` or send provider secrets to the browser.

## 2. Google sign-in

Create an OAuth 2.0 Web application credential in Google Cloud Console. Add the website origin as an authorized JavaScript origin and this exact callback as an authorized redirect URI:

`https://YOUR_SERVER/api/auth/oauth/google/callback`

Put the resulting client ID and client secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

## 3. GitHub sign-in

Create a GitHub OAuth App. Set its homepage URL to the website and its callback URL to:

`https://YOUR_SERVER/api/auth/oauth/github/callback`

Put the client ID and client secret in `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. GitHub accounts need a verified email address.

## 4. Mobile number sign-in

Create a Twilio Verify service with SMS enabled. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_VERIFY_SERVICE_SID`. Phone numbers must be entered in international format, such as `+919876543210`.

Twilio Verify sends and checks the one-time code. NexBridge does not store the code. A first-time phone sign-in creates a student account; company workspaces must be provisioned by NexBridge first.

## 5. Company accounts

Google, GitHub, or phone sign-in does not grant company access by itself. A company account must already exist with the same verified email or phone number. Choose **Company** on the login page before continuing.

## 6. Local check and production deployment

After setting provider values, restart the server and open the login page. Configured methods will redirect to their provider or send an SMS code. Register the callback URLs above exactly; provider URL mismatches cause sign-in failures.

The app currently keeps login sessions and OAuth state in server memory. Run one server instance for the demo. Before a multi-instance or high-availability launch, move sessions and OAuth state to a shared persistent store such as Redis, and configure a stable `SESSION_SECRET` on every instance.
