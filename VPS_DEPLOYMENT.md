# VPS Deployment Playbook — LumaFlow

This playbook details the step-by-step process of deploying the LumaFlow platform (React/Vite frontend + Express/TSX backend) onto a Linux VPS (Ubuntu 22.04+ recommended) with Nginx, PM2, and SSL.

---

## 1. Prerequisites on VPS
Log in to your VPS and install the required packages:

```bash
# Update software repositories
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 or v20 recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx, Git, and Certbot (for SSL)
sudo apt install -y nginx git certbot python3-certbot-nginx

# Install PM2 globally to manage node processes
sudo npm install -y pm2 -g
```

---

## 2. Clone Repository & Setup Environment Variables
Clone your git repository into a safe directory, e.g., `/var/www/lumaflow`:

```bash
# Create directory and set permissions
sudo mkdir -p /var/www/lumaflow
sudo chown -R $USER:$USER /var/www/lumaflow

# Clone the repository (replace with your git URL)
git clone <your-repo-url> /var/www/lumaflow
cd /var/www/lumaflow

# Install project dependencies (frontend + backend devs)
npm install
```

### Setup Environment Variables
Create a production `.env` file in the root folder of the project. **Never commit this `.env` file to Git.**

```bash
cp .env.example .env
nano .env
```

Fill in the production credentials:
- **Supabase**: Set production `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` (ensure database RLS rules match).
- **Stripe**: Update Stripe secret keys and setup a webhook endpoint pointing to your API server URL (e.g., `https://api.thelumaflow.com/api/payments/webhook`).
- **Resend**: Input production email API keys.
- **URLs**: Update `VITE_API_URL` to `https://api.thelumaflow.com/api` and `FRONTEND_URL` to `https://thelumaflow.com`.

---

## 3. Build the Frontend SPA
Run the production build compiler for the Vite SPA:

```bash
npm run build
```
This compile step bundles all HTML, Javascript, CSS, and asset files into the `dist/` directory.

---

## 4. Run the Backend API with PM2
Use PM2 to spawn and manage the Express server background process:

```bash
# Start backend server
npm run start:server

# Save PM2 process list to restore on VPS system reboots
pm2 save
pm2 startup
```

*(Copy the systemd command outputted by `pm2 startup` and run it to enable PM2 automatic boot resurrection).*

**Useful Process Management Commands:**
- Show status: `pm2 status`
- Monitor logs: `npm run logs:server` or `pm2 logs lumaflow-backend`
- Restart server: `pm2 restart lumaflow-backend`

---

## 5. Configure Nginx Web Server
Copy the pre-configured Nginx setup to your sites directory:

```bash
# Copy config template
sudo cp nginx.example.conf /etc/nginx/sites-available/thelumaflow.com

# Enable the site configuration by symlinking
sudo ln -s /etc/nginx/sites-available/thelumaflow.com /etc/nginx/sites-enabled/

# Disable default nginx page (optional/recommended)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx syntax configuration
sudo nginx -t

# Reload Nginx configuration
sudo systemctl reload nginx
```

---

## 6. Secure with Let's Encrypt SSL
Provision free, automated SSL certificates for the domains:

```bash
sudo certbot --nginx -d thelumaflow.com -d www.thelumaflow.com -d api.thelumaflow.com
```

- Follow the interactive prompts to enter email and accept terms.
- Certbot will automatically rewrite the Nginx configurations to redirect HTTP traffic to secure HTTPS and inject the SSL key certificates.
- Validate that Certbot automatic certificate renewal is active: `sudo systemctl status certbot.timer`.

---

## 7. Supabase Database Schema Sync (First-Time Only)
If you haven't run the migrations on your production database yet:
1. Log into your Supabase Dashboard.
2. Go to the **SQL Editor** tab.
3. Open `supabase/migrations/20260520_cms_architecture.sql` from your repository, copy its entire contents, and execute them. This script will construct all required tables, enable Row Level Security, configure indexes, and populate initial seed data (default homepage sections, offerings, and the Intelligent Recommendation Matrix).

