# Secure File Share Frontend

## Local Development
```bash
cd artifacts/file-share
pnpm install
pnpm dev
```

## Build for Production
```bash
pnpm build
pnpm serve dist
```

## Deploy to Vercel
1. Push to GitHub repo (or use Vercel CLI)
2. Connect repo at vercel.com/projects/new
3. Framework Preset: **Vite**
4. Root: `./artifacts/file-share`
5. Build Command: `pnpm build` (auto-detected)
6. Output Dir: `dist` (from vercel.json)
7. Deploy

**Vercel URL**: e.g. secure-file-share.vercel.app (customize later)

**Notes**: 
- API points to https://secure-file-host.onrender.com/api
- Test upload/download after deploy
- Monorepo: Ensure pnpm installs workspace deps
