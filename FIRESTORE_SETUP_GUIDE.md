# ☁️ Google Cloud Firestore & Render Backend Configuration Guide

This project is configured so that **all users, including anyone who clones the repository from GitHub and runs the frontend locally**, connect to the single live **Google Firebase Firestore** database via the deployed **Render backend API**.

---

## 🔒 Security Architecture (Zero Credential Leakage)

- **Frontend (`src/`)**: Never imports Firebase Admin or any service account credentials. All data is fetched through the backend REST API.
- **Git & GitHub**: `serviceAccountKey.json`, `.env`, and private key files are strictly excluded via `.gitignore`.
- **Backend on Render**: The Firebase Service Account is configured solely as an environment secret (`FIREBASE_SERVICE_ACCOUNT`) in the Render Dashboard.
- **Frontend Clients**: Configured with `VITE_API_URL` (defaults to `https://gv-clothings-backend.onrender.com`).

---

## 🚀 How Anyone Runs the Frontend Locally

Anyone who clones this repo can simply run:

```bash
# 1. Install dependencies
npm install

# 2. Run the local frontend
npm run dev
```

By default, Vite will start the frontend on `http://localhost:3000` and communicate directly with the live Render backend (`https://gv-clothings-backend.onrender.com`), writing and reading from your single Google Firebase Firestore database!

No `.env` or Firebase key is required for local frontend users.

---

## ⚙️ Overriding API Base URL Locally (Optional)

If a developer wants to run both the frontend and backend locally for offline development:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
3. Run the full stack:
   ```bash
   npm run dev:fullstack
   ```

---

## ☁️ Deploying the Backend on Render with Firestore

When deploying the backend on [Render](https://render.com):

1. **Create Web Service** on Render connected to your GitHub repository.
2. Settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Region**: Singapore (or closest to Mumbai / `asia-south1`)
3. **Environment Variables**:
   Under **Environment** in your Render service settings, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `FIREBASE_SERVICE_ACCOUNT`: Copy and paste the entire JSON content of your `serviceAccountKey.json` file as a secret.
     *(Or Base64-encode it and paste into `FIREBASE_SERVICE_ACCOUNT`)*
   - `GROQ_API_KEY`: *(Optional) Your Groq API key for the AI Chatbot*

Once deployed, Render will provide your live HTTPS URL:
`https://gv-clothings-backend.onrender.com`

---

## 🔄 One-Time Database Migration

If you need to seed or synchronize all collections into Firestore:

```bash
npm run migrate:firestore
```

This populates:
- ✅ Fabric Categories
- ✅ Products & Specifications
- ✅ Customer Enquiries & Status History
- ✅ Sample Requests & Follow-up Status
- ✅ Callback Requests
- ✅ Promotional Offers & Coupon Codes
- ✅ Announcements & Banners
- ✅ Audit & Activity Logs
- ✅ Admin Credentials
