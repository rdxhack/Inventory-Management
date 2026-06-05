# Inventory & Order Management System

A full-stack application for managing products, customers, orders, and inventory tracking with automatic stock reduction on order placement.

## Features

- **Products** — CRUD with unique SKU validation
- **Customers** — CRUD with unique email validation
- **Orders** — Create orders with inventory validation; stock is reduced automatically
- **Inventory** — Real-time stock tracking with low-stock indicators
- **Business Rules**
  - Product SKUs must be unique
  - Customer emails must be unique
  - Orders cannot be created when product stock is insufficient
  - Stock is automatically reduced when an order is placed

## Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Backend    | Python, FastAPI         |
| Frontend   | React, Vite             |
| Database   | PostgreSQL              |
| Container  | Docker, Docker Compose  |

## Project Structure

```
Inventory-Management/
├── backend/          # FastAPI REST API
├── frontend/         # React SPA
├── docker-compose.yml
├── .env.example
└── render.yaml       # Render deployment blueprint
```

## Quick Start (Docker)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Run locally

```bash
# Clone the repository
git clone <your-repo-url>
cd Inventory-Management

# Copy environment file
cp .env.example .env

# Start all services
docker compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost             |
| Backend  | http://localhost:8000        |
| API Docs | http://localhost:8000/docs   |
| Database | localhost:5432               |

### Stop services

```bash
docker compose down
```

To remove database data:

```bash
docker compose down -v
```

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set env vars (requires a running PostgreSQL instance)
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db
export CORS_ORIGINS=http://localhost:5173

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
export VITE_API_URL=http://localhost:8000/api
npm run dev
```

Frontend dev server: http://localhost:5173

## API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/api/products`       | List all products        |
| POST   | `/api/products`       | Create product           |
| PUT    | `/api/products/{id}`  | Update product           |
| DELETE | `/api/products/{id}`  | Delete product           |
| GET    | `/api/customers`      | List all customers       |
| POST   | `/api/customers`      | Create customer          |
| PUT    | `/api/customers/{id}` | Update customer          |
| DELETE | `/api/customers/{id}` | Delete customer          |
| GET    | `/api/orders`         | List all orders          |
| POST   | `/api/orders`         | Place order (reduces stock) |
| GET    | `/api/inventory`      | Inventory snapshot       |
| GET    | `/health`             | Health check             |

### Example: Create an order

```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {"product_id": 1, "quantity": 2}
    ]
  }'
```

## Environment Variables

All configuration uses environment variables — no hardcoded credentials.

| Variable         | Description                          | Default                                      |
|------------------|--------------------------------------|----------------------------------------------|
| `DATABASE_URL`   | PostgreSQL connection string         | `postgresql://postgres:postgres@db:5432/inventory_db` |
| `CORS_ORIGINS`   | Comma-separated allowed origins      | `http://localhost:5173,http://localhost:3000` |
| `VITE_API_URL`   | Backend API URL (frontend build-time)| `http://localhost:8000/api`                  |
| `POSTGRES_USER`  | Database user (Docker Compose)       | `postgres`                                   |
| `POSTGRES_PASSWORD` | Database password (Docker Compose)| `postgres`                                   |
| `POSTGRES_DB`    | Database name (Docker Compose)       | `inventory_db`                               |

## Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "Add Inventory & Order Management System"
git remote add origin https://github.com/<username>/Inventory-Management.git
git push -u origin main
```

### 2. Deploy Backend + Database (Render — free tier)

1. Go to [render.com](https://render.com) and connect your GitHub repo
2. Create a **PostgreSQL** database (free tier)
3. Create a **Web Service** from the `backend/Dockerfile`
4. Set environment variables:
   - `DATABASE_URL` → Internal connection string from Render PostgreSQL
   - `CORS_ORIGINS` → Your frontend URL (e.g. `https://your-app.vercel.app`)
5. Deploy — note the backend URL (e.g. `https://inventory-backend.onrender.com`)

Alternatively, use the included `render.yaml` blueprint for one-click deploy.

### 3. Deploy Frontend (Vercel — free tier)

1. Go to [vercel.com](https://vercel.com) and import the GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `VITE_API_URL` → `https://your-backend.onrender.com/api`
4. Deploy — note the frontend URL (e.g. `https://inventory-app.vercel.app`)

### 4. Publish Docker Image (Docker Hub)

```bash
# Build backend image
docker build -t <dockerhub-username>/inventory-backend:latest ./backend
docker push <dockerhub-username>/inventory-backend:latest

# Build frontend image
docker build \
  --build-arg VITE_API_URL=https://your-backend.onrender.com/api \
  -t <dockerhub-username>/inventory-frontend:latest ./frontend
docker push <dockerhub-username>/inventory-frontend:latest
```

## Submission Checklist

Fill in your URLs after deployment:

| Item                  | URL |
|-----------------------|-----|
| GitHub Repository     | `https://github.com/<username>/Inventory-Management` |
| Docker Image (Backend)| `https://hub.docker.com/r/<username>/inventory-backend` |
| Live Frontend         | `https://<your-frontend>.vercel.app` |
| Live Backend API      | `https://<your-backend>.onrender.com` |
| API Documentation     | `https://<your-backend>.onrender.com/docs` |

## License

MIT
