# SecureShare — Secure File Sharing App

Transfer photos and PDFs between your phone and laptop using any browser. Files are stored in Cloudinary, metadata in MongoDB Atlas, with JWT authentication.

## Features

- Register / login with email + password (bcrypt hashed, JWT sessions)
- Upload images (JPEG, PNG, WebP, GIF) and PDFs up to 20 MB
- Each upload gets a unique **File ID** and **6-digit Access Code**
- Anyone with the ID + code can download — no login required
- Owner can delete their files from both Cloudinary and MongoDB
- Mobile-first, single-page UI

## Deploy to Render

### Why pnpm matters
This project uses a **pnpm workspace** monorepo. Render defaults to npm, which can't parse pnpm-specific version syntax (`catalog:`, `workspace:*`), causing `Invalid Version` errors. You must configure Render to use pnpm as shown below.

### Steps

1. **Push to GitHub**
   ```bash
   git init && git add . && git commit -m "init"
   gh repo create my-secureshare --public --push
   ```

2. **Create a new Web Service on Render**
   - Go to [dashboard.render.com](https://dashboard.render.com) → New → Web Service
   - Connect your GitHub repo

3. **Configure the service:**

   | Setting | Value |
   |---------|-------|
   | **Runtime** | Node |
   | **Build Command** | `npm install -g pnpm@10 && pnpm install && pnpm --filter @workspace/api-server run build` |
   | **Start Command** | `node --enable-source-maps artifacts/api-server/dist/index.mjs` |
   | **Root Directory** | *(leave blank — use repo root)* |

4. **Set environment variables** in Render → Environment:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=AppName
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   JWT_SECRET=any_long_random_string
   NODE_ENV=production
   ```

5. **Click Deploy** — Render will install pnpm, build, and start your server.

> **Tip:** A `render.yaml` file is included in this repo — Render can auto-detect it if you use "Blueprint" deployment instead.

## Deploy to Railway

1. **Create a new Railway project** → Deploy from GitHub repo
2. **Set environment variables** (same as above, plus `PORT=8080`)
3. **Build command:** `pnpm install && pnpm --filter @workspace/api-server run build`
4. **Start command:** `node --enable-source-maps artifacts/api-server/dist/index.mjs`

Railway auto-detects pnpm via the `pnpm-lock.yaml` file, so no extra setup needed.

## Local Development

```bash
# Install dependencies
pnpm install

# Start API server
pnpm --filter @workspace/api-server run dev

# In another terminal, start frontend
pnpm --filter @workspace/file-share run dev
```

Copy `.env.example` to `.env` and fill in your credentials.

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register with email + password |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/upload` | Bearer token | Upload a file (multipart/form-data, field: `file`) |
| GET | `/api/file/:fileId?code=XXXXXX` | No | Download file by ID + 6-digit code |
| DELETE | `/api/file/:fileId` | Bearer token | Delete own file |
| GET | `/api/my-files` | Bearer token | List your uploaded files |

## Tech Stack

- **Backend**: Node.js, Express 5, TypeScript
- **Database**: MongoDB Atlas (via Mongoose)
- **File storage**: Cloudinary
- **Auth**: bcryptjs + JSON Web Tokens
- **Frontend**: React + Vite, Tailwind CSS
- **Monorepo**: pnpm workspaces
