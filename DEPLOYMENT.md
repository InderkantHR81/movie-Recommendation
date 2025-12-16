# Deployment Guide

## 🚀 Deploying Your Movie Recommendation System

### Option 1: Deploy to Render + Vercel + MongoDB Atlas

This is the recommended free deployment option.

---

## Part 1: Database - MongoDB Atlas (Free)

### 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a new project

### 2. Create a Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0)
3. Select your preferred region
4. Click "Create"

### 3. Configure Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Create username and password (save these!)
4. Give "Read and Write" permissions

### 4. Configure Network Access
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Confirm

### 5. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Save this for later!

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/movierecom?retryWrites=true&w=majority
```

---

## Part 2: Backend - Render (Free)

### 1. Prepare Your Code
Make sure your backend code is pushed to GitHub:

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/movie-recommendation.git
git push -u origin main
```

### 2. Deploy to Render
1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select your repository
5. Configure:
   - **Name**: movie-recommendation-api
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Add Environment Variables
In Render dashboard, add these environment variables:
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_random_secure_string_here
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
```

### 4. Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your API will be live at: `https://your-app.onrender.com`
4. Save this URL!

### 5. Seed the Database
After deployment, run seed script once:
1. Go to Render dashboard
2. Open "Shell" tab
3. Run: `node scripts/seedMovies.js`

---

## Part 3: Frontend - Vercel (Free)

### 1. Update API URL
Edit `frontend/.env`:
```env
VITE_API_URL=https://your-render-app.onrender.com/api
```

Commit and push:
```bash
git add frontend/.env
git commit -m "Update API URL for production"
git push
```

### 2. Deploy to Vercel
1. Go to https://vercel.com and sign up
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Add Environment Variable
In Vercel project settings → Environment Variables:
```
VITE_API_URL=https://your-render-app.onrender.com/api
```

### 4. Deploy
1. Click "Deploy"
2. Wait for build (2-5 minutes)
3. Your app will be live at: `https://your-app.vercel.app`

### 5. Update CORS (Backend)
Add your Vercel URL to backend CORS:

Edit `backend/server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-app.vercel.app'],
  credentials: true
}));
```

Commit and redeploy backend on Render.

---

## Option 2: Deploy Everything to Railway

Railway offers an easier all-in-one deployment.

### 1. Deploy to Railway
1. Go to https://railway.app and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository

### 2. Add MongoDB Plugin
1. Click "New" → "Database" → "Add MongoDB"
2. Railway will create a MongoDB instance
3. Copy the connection URL

### 3. Configure Backend
1. Select your backend service
2. Add environment variables:
```
PORT=5000
MONGODB_URI=${{MongoDB.MONGO_URL}}
JWT_SECRET=your_secret_here
OPENAI_API_KEY=your_openai_key
NODE_ENV=production
```

### 4. Configure Frontend
1. Select frontend service
2. Set root directory: `frontend`
3. Add environment variable:
```
VITE_API_URL=https://your-backend.railway.app/api
```

### 5. Deploy
Both services will auto-deploy. Your app will be live!

---

## Testing Your Deployment

### 1. Test Backend API
```bash
# Health check
curl https://your-backend-url.com/api/health

# Should return: {"status":"OK","message":"Movie Recommendation API is running"}
```

### 2. Test Frontend
1. Visit your frontend URL
2. Try signing up
3. Login
4. Browse movies
5. Test chatbot

---

## Post-Deployment Tasks

### 1. Update Backend CORS
Make sure CORS includes your frontend URL:
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));
```

### 2. Secure Your Secrets
- Never commit `.env` files
- Use strong JWT_SECRET (generate random string)
- Rotate API keys periodically

### 3. Monitor Performance
- Check Render/Vercel logs for errors
- Monitor MongoDB usage on Atlas
- Set up error tracking (optional: Sentry)

---

## Common Deployment Issues

### Issue: Frontend can't connect to backend
**Solution**: Check CORS settings and VITE_API_URL

### Issue: MongoDB connection timeout
**Solution**: 
- Check MongoDB Atlas network access (allow 0.0.0.0/0)
- Verify connection string is correct

### Issue: OpenAI API errors
**Solution**: 
- Verify API key is valid
- Check usage limits on OpenAI dashboard

### Issue: Build fails
**Solution**: 
- Check Node.js version compatibility
- Run `npm install` locally first
- Check build logs for specific errors

---

## Cost Breakdown (Free Tier)

- **MongoDB Atlas**: Free (M0, 512MB)
- **Render**: Free (limited hours, sleeps after inactivity)
- **Vercel**: Free (hobby plan)
- **OpenAI**: Pay-as-you-go (starts at $0, ~$0.002 per request)

**Total Monthly Cost**: ~$0-5 depending on OpenAI usage

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Render
1. Go to Settings → Custom Domain
2. Add domain and update DNS

---

## Scaling Considerations

When your app grows:
- Upgrade MongoDB to M10+ for better performance
- Use Render paid plan for no sleep time
- Implement Redis for caching
- Add CDN for static assets
- Consider dedicated backend hosting (AWS/DigitalOcean)

---

**Your Movie Recommendation System is now live! 🎉**
