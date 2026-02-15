# Deployment Guide for MeDo Sync

Since this application requires a full browser automation stack (Python + Playwright + Chromium), it cannot be deployed on standard serverless platforms like Vercel or Netlify.

**Recommended Deployment Option: Docker Container**

The included `Dockerfile` is production-ready and includes all necessary dependencies:
- Node.js 20 (for the Next.js frontend)
- Python 3 (for the automation bot)
- Chromium & System Libraries (via the official Playwright base image)

## Option 1: Railway (Easiest)

1.  Push this code to a GitHub repository.
2.  Go to [Railway.app](https://railway.app/).
3.  Click "New Project" -> "Deploy from GitHub repo".
4.  Select your repository.
5.  Railway will automatically detect the `Dockerfile` and build it.
6.  Once deployed, it will provide a URL (e.g., `https://medo-sync.up.railway.app`).

## Option 2: Render

1.  Push code to GitHub.
2.  Go to [Render.com](https://render.com/).
3.  Click "New" -> "Web Service".
4.  Connect your repository.
5.  Choose "Docker" as the Environment.
6.  Click "Create Web Service".

## Option 3: Fly.io (CLI)

1.  Install the Fly CLI: `curl -L https://fly.io/install.sh | sh`
2.  Login: `fly auth login`
3.  Run `fly launch` in this directory.
4.  It will detect the Dockerfile and configure the app.
5.  Deploy with `fly deploy`.

## Local Development (Docker)

If you have Docker installed locally:

```bash
docker build -t medo-sync .
docker run -p 3000:3000 medo-sync
```

Access at `http://localhost:3000`.
