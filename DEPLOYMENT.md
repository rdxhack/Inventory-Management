# Deployment Guide — Step by Step

Follow these steps to deploy the Inventory & Order Management System for free.

---

## Part 1: Push Code to GitHub

```bash
cd Inventory-Management
git add .
git commit -m "Add full-stack Inventory & Order Management System"
git push origin main
```

**GitHub Repository:** https://github.com/rdxhack/Inventory-Management

---

## Part 2: Deploy Backend + Database on Render

### 2.1 Create Render Account
1. Go to https://render.com and sign up (free)
2. Connect your GitHub account

### 2.2 Deploy with Blueprint (easiest)
1. In Render dashboard, click **New** → **Blueprint**
2. Connect repo: `rdxhack/Inventory-Management`
3. Render reads `render.yaml` and creates:
   - PostgreSQL database (`inventory-db`)
   - Backend web service (`inventory-backend`)
4. When prompted for `CORS_ORIGINS`, enter a placeholder for now: `https://placeholder.vercel.app`
   (you will update this after deploying the frontend)

### 2.3 Manual Deploy (alternative)
If Blueprint doesn't work:

**Create PostgreSQL:**
1. **New** → **PostgreSQL** → Name: `inventory-db`, Plan: Free
2. Copy the **Internal Database URL**

**Create Web Service:**
1. **New** → **Web Service** → Connect repo
2. Settings:
   - **Name:** `inventory-backend`
   - **Root Directory:** _(leave blank)_
   - **Runtime:** Docker
   - **Dockerfile Path:** `./backend/Dockerfile`
   - **Docker Context:** `./backend`
   - **Plan:** Free
3. Environment variables:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Internal Database URL from step above |
   | `CORS_ORIGINS` | `https://placeholder.vercel.app` (update later) |
4. **Health Check Path:** `/health`
5. Click **Create Web Service**

### 2.4 Note Your Backend URL
After deploy completes (~5 min), copy the URL:
```
https://inventory-backend.onrender.com
```

Test it:
```bash
curl https://inventory-backend.onrender.com/health
# Expected: {"status":"healthy"}
```

API docs: `https://inventory-backend.onrender.com/docs`

---

## Part 3: Deploy Frontend on Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com and sign up (free)
2. Connect your GitHub account

### 3.2 Import Project
1. Click **Add New** → **Project**
2. Import `rdxhack/Inventory-Management`
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Vite |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

### 3.3 Environment Variable
Add this before deploying:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://inventory-backend.onrender.com/api` |

_(Replace with your actual Render backend URL)_

4. Click **Deploy**

### 3.4 Note Your Frontend URL
After deploy (~2 min), copy the URL:
```
https://inventory-management-xxx.vercel.app
```

### 3.5 Update CORS on Render
1. Go back to Render → `inventory-backend` → **Environment**
2. Update `CORS_ORIGINS` to your Vercel URL:
   ```
   https://inventory-management-xxx.vercel.app
   ```
3. Save — Render will redeploy automatically

---

## Part 4: Publish Docker Image to Docker Hub

### 4.1 Create Docker Hub Account
1. Go to https://hub.docker.com and sign up
2. Create repository: `inventory-backend`

### 4.2 Build and Push
```bash
# Login
docker login

# Build backend image
docker build -t rdxhack/inventory-backend:latest ./backend
docker push rdxhack/inventory-backend:latest

# Build frontend image (optional)
docker build \
  --build-arg VITE_API_URL=https://inventory-backend.onrender.com/api \
  -t rdxhack/inventory-frontend:latest ./frontend
docker push rdxhack/inventory-frontend:latest
```

**Docker Hub URL:** https://hub.docker.com/r/rdxhack/inventory-backend

---

## Part 5: Verify Everything Works

1. Open your Vercel frontend URL
2. Add a **Product** (e.g. SKU: `WIDGET-001`, Stock: 10)
3. Add a **Customer** (unique email)
4. Create an **Order** — stock should decrease automatically
5. Try ordering more than available stock — should show an error
6. Check **Inventory** page for updated stock levels

---

## Submission URLs Template

| Item | URL |
|------|-----|
| GitHub Repository | https://github.com/rdxhack/Inventory-Management |
| Docker Image | https://hub.docker.com/r/rdxhack/inventory-backend |
| Live Frontend | https://YOUR-APP.vercel.app |
| Live Backend API | https://inventory-backend.onrender.com |
| API Documentation | https://inventory-backend.onrender.com/docs |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Frontend shows network errors | Check `VITE_API_URL` on Vercel matches backend URL + `/api` |
| CORS errors in browser | Update `CORS_ORIGINS` on Render with exact Vercel URL (no trailing slash) |
| Backend 502 on first load | Render free tier sleeps after 15 min — wait ~30s for cold start |
| Database connection failed | Use **Internal** Database URL on Render, not External |
| `postgres://` URL errors | Backend auto-converts to `postgresql://` — redeploy if needed |
