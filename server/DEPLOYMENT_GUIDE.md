# Student-Industry Bridge — Deployment Guide

## Render
1. Upload this project to a GitHub repository.
2. In Render, create a **Web Service** from the repository.
3. Build Command: `npm run build`
4. Start Command: `npm start`
5. Deploy.

The same server serves the React production build and the `/api` endpoints. Direct URLs such as `/login` are supported by the SPA fallback.

## Local production test
Run:

```bash
npm run build
npm start
```

Then open `http://localhost:5000/`.
