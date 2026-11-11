# Deployment Guide for Jules Agent & RepoContext

The application is hosted via GitHub Pages and served at `https://josolinap.dedyn.io/repocontext/` (or `https://josolinap.github.io/repocontext/`).

## Automated Deployment (GitHub Actions)

An automated workflow (`.github/workflows/deploy.yml`) is configured to deploy the built frontend whenever changes are merged into `main`:
1. Checks out the code.
2. Installs dependencies (`npm ci`).
3. Runs Vite build (`npm run build`) which compiles the Jules Agent platform into the `dist/` folder with base path `/repocontext/`.
4. Publishes `dist/` directly to GitHub Pages.

Ensure in your GitHub repository settings under **Settings > Pages** that:
- **Source** is set to **GitHub Actions** (or `gh-pages` branch if deploying manually).

## Manual Deployment

You can also deploy manually at any time using the `gh-pages` npm script:

```bash
npm run deploy
```

This executes `npm run predeploy` (`npm run build`) and publishes the `dist/` directory to the `gh-pages` branch.
