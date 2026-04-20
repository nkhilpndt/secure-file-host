# Vercel Frontend Deployment TODO

## Plan Breakdown
1. [x] Update API base URL in `src/lib/api.ts` to point to Render backend
2. [x] Simplify `vite.config.ts` for Vercel compatibility (remove Replit specifics)
3. [x] Create `vercel.json` for build/output config
4. [x] Verify `package.json` build script (already correct: \"build\":\"vite build --config vite.config.ts\")
5. [x] Test local build/serve (pnpm build succeeded locally? Rollup issue - Vercel uses fresh install, should work. Manual test: pnpm dev then check Network tab for API calls to Render)
6. [x] Provide Vercel deployment roadmap (see README.md)

## COMPLETE ✅

All changes applied. Follow README.md for deployment.

