# 🚀 Deploying Student Zone to Vercel (1-Click Guide)

This project is a Next.js 15 full-stack application configured for Vercel deployment. When deployed to Vercel, the entire public website, customer document ordering, live tracking timeline, API endpoints, file uploads, and secure admin dashboard run under **one single domain link** (e.g. `https://student-zone-tenali.vercel.app`).

---

## 📋 Pre-Deployment Checklist

1. **GitHub Repository**: Push this codebase to your GitHub account.
2. **Vercel Account**: Log in at [https://vercel.com](https://vercel.com).
3. **Database (for Vercel Serverless)**:
   - For Vercel, create a free cloud PostgreSQL database on **Supabase** ([https://supabase.com](https://supabase.com)) or **Neon** ([https://neon.tech](https://neon.tech)).
   - Alternatively, use **Prisma Postgres** or Vercel Postgres in 1 click.

---

## 🛠️ Step-by-Step Vercel Deployment

### Step 1: Import Project to Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** → **Project**.
3. Select your GitHub repository (`student_zone`) and click **Import**.

### Step 2: Configure Environment Variables
Under the **Environment Variables** section on Vercel, add:

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:pass@db.xxxx.supabase.co:5432/postgres` | Cloud Postgres Connection String |
| `JWT_SECRET` | `student_zone_tenali_super_secret_admin_jwt_key_2026` | Admin Session Encryption Secret |

*(Note: Change provider to `postgresql` in `prisma/schema.prisma` if using PostgreSQL).*

### Step 3: Deploy
1. Click **Deploy**.
2. Vercel will automatically build all static pages and serverless API functions.
3. Once completed, Vercel will give you a single production URL, e.g.:
   `https://student-zone-tenali.vercel.app`

---

## 🔗 Single Unified URL Map

When deployed, every feature is connected under your single Vercel domain:

- **Public Home Page**: `https://your-domain.vercel.app/`
- **Order Document Prints**: `https://your-domain.vercel.app/order`
- **Track Order Live**: `https://your-domain.vercel.app/track`
- **Services Catalog**: `https://your-domain.vercel.app/services`
- **Advertising Quotes**: `https://your-domain.vercel.app/advertising`
- **About & Contact**: `https://your-domain.vercel.app/about` & `/contact`
- **Admin Login**: `https://your-domain.vercel.app/admin/login`
- **Admin Live Kanban Board**: `https://your-domain.vercel.app/admin/live`
- **Admin Orders & Document Downloads**: `https://your-domain.vercel.app/admin/orders`
- **Pricing Engine Config**: `https://your-domain.vercel.app/admin/pricing`

---

## ⚡ Seed Initial Database Data on Vercel

After deployment, run the database seed to pre-populate default services, rates, settings, and default admin credentials:

```bash
npx prisma db seed
```
Default Admin Login:
- **Email**: `admin@studentzone.com`
- **Password**: `admin123`
