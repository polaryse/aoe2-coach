# AoE2 Coach

A local-first React + TypeScript + Vite companion app for tracking Age of Empires II ranked improvement.

## Windows Setup

From PowerShell:

```powershell
cd dev\aoe2-coach
npm install
npm run dev
```

Then open the local URL Vite prints, usually:

```text
http://localhost:5173
```

## macOS Setup

Install Node.js LTS from [nodejs.org](https://nodejs.org/) or with Homebrew:

```bash
brew install node
```

Then from Terminal:

```bash
cd dev/aoe2-coach
npm install
npm run dev
```

Open the local URL Vite prints, usually:

```text
http://localhost:5173
```

## Notes

- No backend is required.
- Games, missions, skill progress, and replay reviews are stored in your browser with LocalStorage.
- v0.1 intentionally ships with sample coaching content but no fake game history.
