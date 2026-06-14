<<<<<<< HEAD
# helping_mechons_website
=======
# Helping Mechons — NGO Website & Admin Portal

A fully responsive NGO website and admin system built with **Next.js 14**, **Supabase**, **Gmail SMTP**, and **Google Drive**. Deployed on **Vercel**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database & Auth | Supabase (PostgreSQL + Auth + RLS) |
| Styling | Tailwind CSS |
| Email | Gmail SMTP via Nodemailer |
| File Storage | Google Drive (Service Account) |
| Deployment | Vercel |

---

## Project Structure

```
helping-mechons-nextjs/
├── app/
│   ├── page.js                    # Home page
│   ├── about/                     # About Us
│   ├── our-work/                  # Our Work & Gallery
│   ├── campaigns/                 # Campaign list + individual campaign
│   ├── donate/                    # Donation form with UPI/QR
│   ├── transparency/              # Trust & impact page
│   ├── login/                     # Login
│   ├── signup/                    # Sign up
│   ├── forgot-password/           # Request password reset email
│   ├── reset-password/            # Set new password (from email link)
│   ├── profile/                   # Donor profile & donation history
│   ├── admin/                     # Admin portal (protected)
│   │   ├── page.js                # Dashboard
│   │   ├── donations/             # Approve / reject donations
│   │   ├── campaigns/             # Create & manage campaigns
│   │   ├── gallery/               # Upload & manage gallery photos
│   │   ├── ledger/                # Financial ledger
│   │   ├── users/                 # User & role management
│   │   └── change-password/       # Forced first-login password reset
│   └── api/
│       ├── donate/route.js        # Create donation
│       ├── donate/approve/route.js# Approve or reject donation
│       ├── drive/route.js         # Upload image to Google Drive
│       └── auth/logout/route.js   # Sign out
├── components/layout/             # Navbar, Footer, MobileDonateBar
├── lib/
│   ├── supabase/                  # Browser + server Supabase clients
│   ├── email/mailer.js            # Gmail SMTP + email templates
│   ├── drive/upload.js            # Google Drive uploader
│   └── images/drivePhotos.js      # Central photo → Drive ID config
├── supabase/
│   ├── schema.sql                 # Full DB schema + RLS policies
│   └── seed.sql                   # Sample campaigns + admin user setup
└── public/photos/                 # Fallback photos (used until Drive IDs are set)
```

---

## Prerequisites

Before you start, make sure you have:

- **Node.js 18+** installed — [nodejs.org](https://nodejs.org)
- **Git** installed — [git-scm.com](https://git-scm.com)
- A **GitHub** account — [github.com](https://github.com)
- A **Supabase** account — [supabase.com](https://supabase.com) (free tier is enough)
- A **Gmail** account with 2FA enabled
- A **Google Cloud** account — [console.cloud.google.com](https://console.cloud.google.com) (free)
- A **Vercel** account — [vercel.com](https://vercel.com) (free tier is enough)

---

## Step 1 — GitHub: Create Repo & Push Code

### 1a. Extract the ZIP

Download and extract `helping-mechons-nextjs-final.zip`. You will get a folder called `helping-mechons-nextjs`.

Open a terminal and go into that folder:

```bash
cd helping-mechons-nextjs
```

### 1b. Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `helping-mechons`
3. Set it to **Private**
4. Do **not** add a README, .gitignore, or license (we already have them)
5. Click **Create repository**
6. Copy the repository URL shown — it will look like `https://github.com/YOUR-USERNAME/helping-mechons.git`

### 1c. Push the Code

Run these commands in your terminal inside the project folder:

```bash
git init
git add .
git commit -m "Initial commit — Helping Mechons"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/helping-mechons.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

> If Git asks for your GitHub password, use a **Personal Access Token** instead.
> Generate one at: GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic) → New token → check `repo` scope.

---

## Step 2 — Supabase: Database & Auth Setup

### 2a. Create a Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `helping-mechons`
3. Set a strong database password (save it somewhere safe)
4. Region: **Singapore** (closest to India)
5. Click **Create new project** — takes about 2 minutes

### 2b. Run the Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `supabase/schema.sql` from the project folder
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run**

You should see "Success" — this creates all tables, views, triggers, and RLS policies.

### 2c. Run the Seed Data

1. In SQL Editor, click **New query** again
2. Open `supabase/seed.sql`, copy and paste it
3. Click **Run**

This inserts sample campaigns and gallery items.

### 2d. Create the Admin User

1. Go to **Authentication** → **Users** → **Add user** → **Create new user**
2. Email: `helpingmechons@gmail.com` (or your admin email)
3. Password: `HelpingMechons@2026` (temporary — will be forced to change on first login)
4. Click **Create user**
5. Copy the **User UUID** shown in the users table

Now promote this user to admin. In SQL Editor, run:

```sql
UPDATE public.profiles
SET role = 'admin', must_change_password = true
WHERE id = 'PASTE-UUID-HERE';
```

Replace `PASTE-UUID-HERE` with the UUID you just copied.

### 2e. Configure Auth Settings

Go to **Authentication** → **URL Configuration**:

- **Site URL**: `https://your-project.vercel.app` (fill this in after Vercel deploy)
- **Redirect URLs**: add `https://your-project.vercel.app/**`

Also go to **Authentication** → **Providers** → **Email**:
- Turn **off** "Confirm email" if you want users to log in immediately without email confirmation (recommended for testing)

### 2f. Get Your API Keys

Go to **Project Settings** → **API**:

- Copy **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon / public key** → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role key** → this is `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — never expose it on the frontend)

---

## Step 3 — Gmail: SMTP Email Setup

The app sends automatic emails when donations are received, approved, or rejected.

### 3a. Enable 2-Factor Authentication on Gmail

1. Go to your Gmail account → **Manage your Google Account**
2. Click **Security** tab
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the steps to turn it on

> If 2FA is already on, skip to 3b.

### 3b. Generate an App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sign in if prompted
3. Under "App name", type `Helping Mechons`
4. Click **Create**
5. Google will show a **16-character password** like `abcd efgh ijkl mnop`
6. Copy it immediately — it will not be shown again

Your SMTP environment variables will be:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=helpingmechons@gmail.com
SMTP_PASS=abcdefghijklmnop        ← paste the 16-char password without spaces
SMTP_FROM_NAME=Helping Mechons
SMTP_FROM_EMAIL=helpingmechons@gmail.com
```

---

## Step 4 — Google Drive: Image Storage Setup

The admin gallery uploads photos to Google Drive instead of storing them in Supabase or Vercel (to save storage).

### 4a. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it `helping-mechons` → click **Create**
4. Make sure this project is selected in the dropdown

### 4b. Enable Google Drive API

1. In the left menu, go to **APIs & Services** → **Library**
2. Search for `Google Drive API`
3. Click it → click **Enable**

### 4c. Create a Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service account**
3. Name: `helping-mechons-drive`
4. Click **Create and Continue**
5. For role, click **Select a role** → choose **Basic** → **Editor**
6. Click **Continue** → **Done**

### 4d. Generate a JSON Key

1. On the Credentials page, click your new service account email
2. Go to the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** → click **Create**
5. A file `key.json` will download to your computer

### 4e. Base64 Encode the Key

Open a terminal where `key.json` was downloaded and run:

**On Mac / Linux:**
```bash
cat key.json | base64 -w0
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("key.json")) | Out-File -NoNewline encoded.txt
type encoded.txt
```

Copy the entire output — this is your `GOOGLE_DRIVE_SERVICE_ACCOUNT_BASE64`.

### 4f. Create a Google Drive Folder

1. Go to [drive.google.com](https://drive.google.com)
2. Click **New** → **Folder**
3. Name it `Helping Mechons Photos`
4. Open the folder
5. Copy the **Folder ID** from the URL bar:
   `https://drive.google.com/drive/folders/THIS-PART-IS-THE-ID`

### 4g. Share the Folder with the Service Account

1. Right-click the folder → **Share**
2. In the "Add people and groups" field, paste the **service account email** from step 4c
   (it looks like `helping-mechons-drive@your-project.iam.gserviceaccount.com`)
3. Set permission to **Editor**
4. Click **Share**

> This gives the app read + write access to that specific folder only — not your entire Drive.

### 4h. Set the Environment Variables

```
GOOGLE_DRIVE_SERVICE_ACCOUNT_BASE64=paste-your-base64-string-here
GOOGLE_DRIVE_FOLDER_ID=paste-your-folder-id-here
```

### 4i. Wire Up the Static Site Photos (Optional but Recommended)

Upload your 8 photos to the Drive folder you created. For each photo:

1. Right-click → **Share** → change to **Anyone with the link** → **Viewer**
2. Copy the file URL: `https://drive.google.com/file/d/FILE-ID-HERE/view`
3. Copy just the `FILE-ID-HERE` part

Open `lib/images/drivePhotos.js` and paste the file IDs:

```js
const DRIVE_PHOTOS = {
  "food-distribution-1": "1abc...xyz",
  "food-distribution-2": "1def...uvw",
  // ... etc
};
```

Until you do this, the site still works fine using the local photos from `public/photos/`.

---

## Step 5 — Local Development (Optional)

To run the site on your computer before deploying:

```bash
# Copy the example env file
cp .env.example .env.local

# Open .env.local and fill in all the values from steps 2–4

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 6 — Vercel: Deploy to Production

### 6a. Import the Project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Click **Import Git Repository**
3. Select your `helping-mechons` GitHub repo
4. Vercel auto-detects Next.js — leave all settings as default
5. **Do not click Deploy yet** — set environment variables first

### 6b. Add Environment Variables

In the Vercel import screen, scroll down to **Environment Variables** and add each one:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase → Project Settings → API |
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` |
| `NEXT_PUBLIC_ORG_NAME` | `Helping Mechons` |
| `NEXT_PUBLIC_ORG_UPI_ID` | Your UPI ID e.g. `helpingmechons@upi` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` |
| `SMTP_USER` | `helpingmechons@gmail.com` |
| `SMTP_PASS` | Your 16-char Gmail App Password |
| `SMTP_FROM_NAME` | `Helping Mechons` |
| `SMTP_FROM_EMAIL` | `helpingmechons@gmail.com` |
| `GOOGLE_DRIVE_SERVICE_ACCOUNT_BASE64` | Your base64 key |
| `GOOGLE_DRIVE_FOLDER_ID` | Your Drive folder ID |

### 6c. Deploy

Click **Deploy**. Vercel will build and deploy — takes about 1–2 minutes.

### 6d. Update Supabase with Your Live URL

Once deployed, copy your Vercel URL (e.g. `https://helping-mechons.vercel.app`).

Go back to Supabase → **Authentication** → **URL Configuration**:
- **Site URL**: paste your Vercel URL
- **Redirect URLs**: paste `https://helping-mechons.vercel.app/**`

Click **Save**.

---

## Step 7 — Post-Deployment Checklist

Run through these after your first deploy:

- [ ] Home page loads and photos display
- [ ] Admin login works at `/login` with the credentials from Step 2d
- [ ] Admin is forced to change password on first login
- [ ] Donation form submits without errors
- [ ] Admin can approve a donation and email is received
- [ ] Gallery upload from admin panel saves to Drive
- [ ] Forgot password → email arrives → `/reset-password` page works
- [ ] Campaigns page shows your seeded data

---

## Step 8 — Future Updates

Every time you make code changes:

```bash
git add .
git commit -m "describe your change"
git push
```

Vercel will automatically rebuild and redeploy within ~1 minute.

---

## Environment Variables Reference

Full list in `.env.example`. Never commit `.env.local` — it is in `.gitignore`.

---

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. Only used in server-side API routes — never exposed to the browser.
- The default admin password is temporary. The app forces a change on first login before granting portal access.
- All admin routes are protected at both the middleware and API level.
- The service account only has access to the single Drive folder you shared with it — not your entire Google Drive.

---

## Support

Email: helpingmechons@gmail.com
>>>>>>> 8639d2e (Initial commit — Helping Mechons)
