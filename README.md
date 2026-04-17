# SecureShare — Secure File Sharing App

Transfer photos and PDFs between your phone and laptop using any browser. Files are stored in Cloudinary, metadata in MongoDB Atlas, with JWT authentication.

## Features

- Register / login with email + password (bcrypt hashed, JWT sessions)
- Upload images (JPEG, PNG, WebP, GIF) and PDFs up to 20 MB
- Each upload gets a unique **File ID** and **6-digit Access Code**
- Anyone with the ID + code can download — no login required
- Owner can delete their files from both Cloudinary and MongoDB
- Mobile-first, single-page UI

## Deploy to Railway in under 10 minutes

### Prerequisites
- [Railway account](https://railway.app) (free tier works)
- MongoDB Atlas cluster (free M0 tier works)
- Cloudinary account (free tier works)

### Steps

1. **Push to GitHub**
   ```bash
   git init && git add . && git commit -m "init"
   gh repo create my-secureshare --public --push
   ```

2. **Create a new Railway project**
   - Go to [railway.app/new](https://railway.app/new)
   - Click **Deploy from GitHub repo** → select your repo

3. **Set environment variables** in Railway → Variables:
   ```
   MONGODB_URI=mongodb+srv://...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   JWT_SECRET=<any long random string>
   PORT=8080
   ```

4. **Set the build command** (Railway Settings → Build):
   ```
   pnpm install && pnpm --filter @workspace/api-server run build
   ```

5. **Set the start command** (Railway Settings → Start):
   ```
   node --enable-source-maps artifacts/api-server/dist/index.mjs
   ```

6. **Set the root directory** to `/` (default).

7. **Deploy** — Railway will build and start your app. Click the generated domain to open it.

Done! Share your Railway URL with yourself — open it on your phone to upload, open it on your laptop to download.

## Local Development

```bash
# Install dependencies
pnpm install

# Add environment variables (copy and fill in .env.example)
cp .env.example .env

# Start API server
pnpm --filter @workspace/api-server run dev

# In another terminal, start frontend
pnpm --filter @workspace/file-share run dev
```

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register with email + password |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/upload` | Bearer token | Upload a file (multipart/form-data) |
| GET | `/api/file/:fileId?code=XXXXXX` | No | Download file by ID + code |
| DELETE | `/api/file/:fileId` | Bearer token | Delete own file |
| GET | `/api/my-files` | Bearer token | List your uploaded files |

## Tech Stack

- **Backend**: Node.js, Express 5, TypeScript
- **Database**: MongoDB Atlas (via Mongoose)
- **File storage**: Cloudinary
- **Auth**: bcryptjs + JSON Web Tokens
- **Frontend**: React + Vite, Tailwind CSS
- **Monorepo**: pnpm workspaces
