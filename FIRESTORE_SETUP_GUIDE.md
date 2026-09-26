# ☁️ Connecting Google Cloud Firestore to Your Project

Your backend is now fully configured with the official **Google Cloud Firestore SDK (`firebase-admin`)** and includes automatic data migration and local fail-safe storage.

Follow these **3 simple steps** to connect your live Google Cloud Firestore database:

---

### Step 1: Create a Free Firebase / Google Cloud Project

1. Open the [Firebase Console](https://console.firebase.google.com/) (sign in with your Google account).
2. Click **"Add project"** and name it (e.g., `gv-clothings-tirupur`).
3. In the left sidebar, click **"Build"** ➔ **"Firestore Database"**.
4. Click **"Create database"**:
   - **Location**: Choose `asia-south1` (Mumbai) for the fastest speed in India.
   - **Security rules**: Select **"Start in test mode"** (or production mode) and click **Enable**.

---

### Step 2: Download Your Service Account Key

1. In the Firebase Console, click the ⚙️ **Gear icon** (Project Settings) next to *Project Overview* in the top-left menu.
2. Select the **"Service accounts"** tab.
3. Click the blue **"Generate new private key"** button, then confirm by clicking **"Generate key"**.
4. A `.json` file will download to your computer.
5. Rename the downloaded file to:
   ```
   serviceAccountKey.json
   ```
6. Move `serviceAccountKey.json` into your project root folder:
   ```
   c:\Users\yesov\fsd_project\serviceAccountKey.json
   ```
   *(Note: `serviceAccountKey.json` is already ignored in git to keep your private key secure).*

---

### Step 3: Migrate Your Existing Data to Firestore

Once the `serviceAccountKey.json` file is in your project folder, run this single command in your terminal:

```bash
npm run migrate:firestore
```

This will automatically upload:
- ✅ All **Fabric Categories**
- ✅ All **Fabric Products & Specifications**
- ✅ All **Bulk Customer Enquiries & History**
- ✅ All **Promotional Offers & Announcements**
- ✅ **Admin Credentials**

---

### Step 4: Verify Live Connection

Open:
👉 **[http://localhost:5000/api/health](http://localhost:5000/api/health)**

You will see:
```json
{
  "status": "OK",
  "app": "G V Clothings B2B Backend",
  "database": "Google Cloud Firestore (Live)",
  "firestore_connected": true
}
```

---

### 🛡️ Fail-Safe Protection
Even without the key, your project will continue working 100% smoothly using the local database engine. Once you add `serviceAccountKey.json`, the backend will automatically recognize it and switch to live Google Cloud Firestore!
