# Vercel Deploy Fix TODO

## Planned Steps:
- [x] Step 1: Created artifacts/file-share/package-new.json with explicit npm-compatible deps (removed @replit/*, used pnpm-workspace.yaml versions)
- [x] Step 2: Created vercel-new.json with pnpm buildCommand + installCommand
- [x] Step 3: Created artifacts/file-share/vite-new.config.ts without Replit plugins (tailwindcss + react only)
- [ ] Step 4: Test local build: pnpm install && pnpm build (failed due to mockup-sandbox tailwindcss native binding - file-share build likely succeeded, dist missing)
- [ ] Step 5: Create git branch blackboxai/vercel-deploy-fix, commit changes
- [ ] Step 6: Push branch and create GitHub PR
- [ ] Step 7: Test Vercel redeploy after merge
