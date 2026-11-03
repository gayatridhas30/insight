# InsightLoop — Production Deployment Guide

## Architecture Components
1. **Frontend**: React + Vite SPA (static bundle served via Nginx, Vercel, or Netlify).
2. **Backend**: Node.js + Express API Gateway (managed via PM2 or Docker).
3. **AI Service**: Python + FastAPI microservice (managed via Uvicorn & Gunicorn).
4. **Database**: MongoDB (Atlas or self-hosted replica set).

---

## 1. Prerequisites
- Node.js >= 18.0.0
- Python >= 3.10.0
- MongoDB >= 6.0
- npm >= 9.0

---

## 2. Environment Variables Configuration

Copy `.env.example` to `backend/.env` and update the values:

```env
PORT=5000
NODE_ENV=production
CLIENT_URL=https://insightloop.yourdomain.com
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/insightloop
JWT_SECRET=your_ultra_secure_jwt_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# Bhashini Live API Configuration (Optional - fallback active if omitted)
BHASHINI_USER_ID=your_bhashini_user_id
BHASHINI_API_KEY=your_bhashini_api_key
BHASHINI_PIPELINE_ENDPOINT=https://dhruva-api.bhashini.gov.in/services/inference/pipeline

# AI Microservice URL
AI_SERVICE_URL=http://127.0.0.1:8000
```

Frontend environment (`frontend/.env.production`):
```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## 3. Production Build & Startup

### Step 1: Start MongoDB
Ensure MongoDB is running on port 27017 or use MongoDB Atlas connection string.

### Step 2: Seed Initial Data
```bash
cd backend
npm run seed
```

### Step 3: Run Backend Service
```bash
cd backend
npm install --omit=dev
npm start
# Or using PM2:
# pm2 start src/server.js --name "insightloop-backend"
```

### Step 4: Run AI Microservice
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Step 5: Build & Serve Frontend
```bash
cd frontend
npm install
npm run build
# The compiled files in frontend/dist can be served by Nginx or Caddy.
```

---

## 4. Nginx Reverse Proxy Sample Configuration

```nginx
server {
    listen 80;
    server_name insightloop.yourdomain.com;

    # Frontend Static Files
    location / {
        root /var/www/insightloop/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Gateway
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```
