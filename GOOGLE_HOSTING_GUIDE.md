# Google Hosting Guide for G V Clothings B2B Website

This project is a fullstack web application consisting of:
- **Frontend**: Vite + React 18 + TailwindCSS
- **Backend**: Node.js + Express REST API (with dynamic database and AI chatbot endpoint)

Here are the best ways to host this application on **Google**:

---

## Method 1: Google Cloud Run (⭐ Recommended)

**Google Cloud Run** runs the entire application (frontend + backend + database) in a lightweight container.
- **Cost**: **$0 / month** on Google's Always Free tier (includes 2 million requests/month and 360,000 vCPU-seconds free).
- **Features**: Automatic HTTPS / SSL certificate, custom domain support, and auto-scaling.

### Step 1: Install Google Cloud CLI
If not installed, download the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) or use PowerShell:
```powershell
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

### Step 2: Login & Initialize
```bash
gcloud auth login
gcloud config set project YOUR_GOOGLE_CLOUD_PROJECT_ID
```

### Step 3: Deploy with One Command
Run this command inside the project root:
```bash
gcloud run deploy gv-clothings --source . --platform managed --region asia-south1 --allow-unauthenticated
```
> Select region `asia-south1` (Mumbai) or `asia-south2` (Delhi) for lowest latency in India.

Google Cloud will automatically:
1. Build the Docker container using the provided [Dockerfile](file:///c:/Users/yesov/fsd_project/Dockerfile).
2. Compile the React client into `/dist`.
3. Start the Express server serving both `/api/*` and the React frontend.
4. Give you a live HTTPS URL: `https://gv-clothings-xxxx-el.a.run.app`.

---

## Method 2: Google Firebase Hosting (Free CDN)

If you want the frontend hosted on Google's high-speed CDN:

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Google Firebase
```bash
firebase login
```

### Step 3: Build the Frontend
```bash
npm run build
```

### Step 4: Deploy
```bash
firebase deploy --only hosting
```
Your frontend will be live on `https://gv-clothings-tirupur.web.app`.

---

## Method 3: Google App Engine

Using the included [app.yaml](file:///c:/Users/yesov/fsd_project/app.yaml):

```bash
# 1. Build frontend
npm run build

# 2. Deploy to App Engine
gcloud app deploy
```

---

## Setting Environment Variables on Google Cloud
To enable the Groq AI Chatbot on Google Cloud:
```bash
gcloud run services update gv-clothings --set-env-vars GROQ_API_KEY="your_groq_api_key_here"
```

---

## Default Admin Credentials
- **URL**: `https://your-app-url/` -> Click **Admin Panel** on the top bar
- **Username**: `admin`
- **Password**: `admin123`
