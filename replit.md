# SecureShare — Secure File Sharing App

## Overview

A full-stack secure file sharing web app for transferring photos and PDFs between devices using any browser.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **API framework**: Express 5
- **Database**: MongoDB Atlas (via Mongoose)
- **File storage**: Cloudinary
- **Auth**: bcryptjs + JSON Web Tokens (JWT)
- **Frontend**: React + Vite, Tailwind CSS
- **Upload handling**: multer (memory storage) → Cloudinary stream upload

## Architecture

- `artifacts/api-server` — Express backend, serves all `/api` routes
- `artifacts/file-share` — React + Vite frontend, served at `/`

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register with email + password |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/upload` | Bearer token | Upload file (multipart/form-data, field: `file`) |
| GET | `/api/file/:fileId?code=XXXXXX` | No | Download file by ID + 6-digit code |
| DELETE | `/api/file/:fileId` | Bearer token | Delete own file from Cloudinary + MongoDB |
| GET | `/api/my-files` | Bearer token | List authenticated user's files |

## Environment Variables

- `MONGODB_URI` — MongoDB Atlas connection string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials
- `JWT_SECRET` — Secret for signing JWT tokens
- `PORT` — Server port (auto-assigned)

## Key Commands

- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/file-share run dev` — run frontend locally
- `pnpm --filter @workspace/api-server run build` — build API server

## File Upload Constraints

- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`
- Max size: 20 MB
- Each upload gets a 10-char nanoid `fileId` and a random 6-digit `accessCode`
