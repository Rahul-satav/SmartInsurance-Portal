# SmartInsurance Portal (Frontend Only)

Blue-White corporate themed insurance demo. Runs **entirely from GitHub Pages** and connects to a **hosted Spring Boot backend**.

**Live Backend:** `https://smartinsurance-api.onrender.com/api`

## ✨ Features
- Login / Signup (JWT)
- Vehicle Premium Calculator (Bike/Car/SUV, city tiers, liability, NCB)
- Issue policy → PDF with QR → Verify policy
- Dashboard (totals + bar chart)
- Policies list (your issued policies)
- Email notifications on issue (support: ask.resumebuilder@gmail.com)

## 🚀 3 Steps to Go Live
1. Create a repo (e.g., `SmartInsurance-Portal`) and **upload all files** from this folder.
2. In GitHub repo → **Settings → Pages** → Source: **Deploy from branch**, Branch: **main**, Folder: **/** (root).
3. Wait ~60 seconds. Open: `https://<your-username>.github.io/SmartInsurance-Portal`

> For Rahul: `https://rahul-satav.github.io/SmartInsurance-Portal`

## 🔐 Demo Accounts
- **Admin:** `admin@demo.com` / `Admin@1234`
- **User:** `user@demo.com` / `User@1234`

*(If login fails, backend may be sleeping; try again after ~30s.)*

## 🧭 Routes
- `#/home` – landing
- `#/login`, `#/register`
- `#/calculator` – get quote & issue policy
- `#/dashboard` – KPIs + chart (login required)
- `#/policies` – your policies (login required)
- `#/verify?id=POLICY_ID` – public verify

## 🧩 Tech
Plain HTML/CSS/JS, Chart.js via CDN. All API calls via `fetch` to the hosted backend.

## 🛠️ Config
Edit `js/config.js` to change API base, support email, or app name.