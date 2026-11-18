# Running AZMIQ on your own server

The shop runs on any server with Docker. These steps use **Hetzner Cloud** (about €4.50/month)
and **Coolify**, a free control panel that deploys from GitHub like Netlify does. The database
(Supabase), Stripe and email stay exactly as they are; only the hosting moves.

## 1. Create the server (Hetzner)
1. Sign up at hetzner.com/cloud and create a project.
2. **Add Server**: location **Nuremberg** or **Falkenstein** (closest to the UK), image **Ubuntu 24.04**,
   type **CX22**, or whichever is the cheapest shared plan with 2 CPU and 4 GB RAM. Add your SSH key or use the emailed root password.
3. Note the server's **IPv4 address**.

## 2. Install Coolify
Open the server's console (Hetzner → your server → **Console**) and run:

```
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Then open `http://<server-ip>:8000` and create your Coolify admin account.

## 3. Add the shop
1. Coolify → **Projects → New → Add Resource → Public/Private Repository (GitHub App)** → connect
   GitHub and choose `iqbalazmi-commits/Azmiq`, branch `main`.
2. **Build Pack: Dockerfile**. Port **3000**.
3. **Environment Variables**: add the same ones as in Netlify. Tick **Build Variable** on these
   three, because the build needs them:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SITE_URL` = `https://azmiq.com`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

   The rest are normal (runtime) variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`,
   `EMAIL_FROM`, `ORDER_ALERT_EMAIL`, `CRON_SECRET`.
4. **Domains**: `https://azmiq.com,https://www.azmiq.com`. Coolify gets the HTTPS certificate itself.
5. **Deploy**. Pushes to `main` redeploy automatically.

## 4. Daily basket reminder
Coolify → the shop → **Scheduled Tasks → Add**: command `node scripts/cron-basket-recovery.mjs`,
frequency `0 10 * * *`. (Needs `CRON_SECRET` set.)

## 5. Point the domain at the server (GoDaddy → DNS)
| Type | Name | Value |
|---|---|---|
| A | `@` | your server's IPv4 address |
| CNAME | `www` | `azmiq.com` |

Leave the MX and TXT records alone (they run the shop@azmiq.com mailbox). When the site works on
the new server, delete the project from Netlify.

## Keeping it healthy
- Coolify shows the shop's status and logs, and restarts it if the health check fails.
- Run `apt update && apt upgrade -y` in the server console about once a month.
- The database is on Supabase, so the server holds no customer data that needs backing up.
