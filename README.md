# SpendSense — real full-stack starter

A dark, minimalist student-focused money manager built with Next.js, TypeScript, Supabase Auth/Postgres, and Vercel deployment.

## What is included

- Landing page and email magic-link login UI.
- Auth callback and server-side session handling.
- Protected app shell.
- Transactions: create, list and delete records.
- Dashboard metrics calculated from records actually entered.
- Category breakdown and basic cash-flow insights.
- Profile settings and monthly income target.
- Database schema for budgets and subscriptions (UI for budgets is currently a read-only breakdown; subscription CRUD is a roadmap item).
- Restricted admin page for account list and tracked activity events.
- RLS policies for user-owned rows.
- Mobile-responsive dark UI.

## Honest limitations

This is a starter, not a finished financial product. You must configure Supabase and run the SQL before the app can persist real user data. Admin event tracking only records selected actions; it is not a full analytics/audit product. Subscription CRUD, editable category budgets, statement/receipt import, CSV export, account deletion, recurring reminders, and bank integrations are not yet implemented. There is no bank account connection. Dashboard calculations reflect only transactions the user entered. Review and test the code, policies, and legal/privacy documents before inviting real users.

## Requirements

- Node.js LTS (current supported LTS recommended)
- npm
- Git and a GitHub account
- Supabase account
- Vercel account (for hosting)

## 1. Create the Supabase project

1. Create a project in Supabase.
2. Open **SQL Editor**.
3. Copy/paste `supabase/schema.sql` and run it.
4. In **Authentication -> URL Configuration**, add your local URL `http://localhost:3000/auth/callback` and later your production callback URL `https://YOUR-APP.vercel.app/auth/callback`.
5. Configure email delivery. The built-in email sender is rate-limited for testing; configure a custom SMTP provider for a public app.
6. Copy the Project URL and publishable/anon key from Project API settings.

## 2. Configure locally on Windows

In the extracted project folder, open PowerShell:

```powershell
npm install
Copy-Item .env.example .env.local
notepad .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SECRET
```

The service-role key is optional for normal user features but required for `/admin`. Keep it server-only. Never prefix it with `NEXT_PUBLIC_`. Never commit `.env.local`.

Then run:

```powershell
npm run dev
```

Open `http://localhost:3000`.

## 3. Set up your admin account

1. Sign up and verify your own email once.
2. In Supabase Dashboard, open **Authentication -> Users** and copy your user UUID.
3. Open **SQL Editor** and run this, replacing the UUID with your own user ID:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where id = 'YOUR-USER-UUID';
```

4. Sign out and sign in again so the session refreshes.
5. Open `http://localhost:3000/admin`.

Do not let public users edit app_metadata or promote themselves. The app checks the role server-side before creating the admin client.

## 4. Deploy to GitHub + Vercel

1. Create a new **private** GitHub repository for this project.
2. From PowerShell in the project folder:

```powershell
git init
git add .
git commit -m "Initial SpendSense app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

3. In Vercel, select **Add New -> Project**, import that GitHub repository, and deploy using the detected Next.js preset.
4. In Vercel Project -> Settings -> Environment Variables, add the same three values from `.env.local`. Keep the service key unprefixed and server-only.
5. Redeploy after setting environment variables.
6. In Supabase Auth URL Configuration, set Site URL to your Vercel URL and add `https://YOUR-APP.vercel.app/auth/callback` to Redirect URLs.

Pushing later commits to `main` will normally trigger a new production deployment. Vercel provides deployment logs; Supabase provides database, auth and API logs.

## 5. Where to see users and activity

- **GitHub:** source code, commits and issues.
- **Vercel:** deployment history, build/runtime logs, domains, environment variables.
- **Supabase -> Authentication -> Users:** registered accounts, confirmation status and last sign-in.
- **Supabase -> Table Editor:** your database tables.
- **App `/admin`:** first 100 accounts and last 100 tracked events for an admin user.

The admin dashboard intentionally excludes users' transaction descriptions and amounts. Collect only the operational information you need. Tell users in your privacy notice what you track and why.

## 6. Data durability and backups

Supabase Free is suitable for an early prototype but does not include automatic database backups. Export important data regularly and test restoring it. Before a public launch, configure a backup plan and document data deletion/export procedures.

## Security checklist before launch

- Confirm Row Level Security is enabled on every user-data table.
- Test with two separate user accounts and verify neither can read the other's records.
- Keep the service-role/secret key out of client code and Git.
- Use custom SMTP for reliable email delivery.
- Add rate limiting, error monitoring, export/delete flows, terms, privacy policy, and a support contact.
- Do not store bank passwords, PINs, CVVs, or full card numbers.
- Avoid claiming the app is bank-connected or provides financial advice.

## New account and appearance options

- Sign in with either an email/password or a one-time email link.
- Create an account from the password sign-in tab, request a password reset, and change your password from Settings.
- Supabase SSR cookies plus the middleware session refresh keep an authenticated session available across visits until sign-out or expiry.
- Choose from eight palettes in **Settings → Appearance**: Midnight Lime, Ocean Blue, Aurora Violet, Rose Quartz, Amber Glow, Forest, Paper Light, and Monochrome. The theme preference is stored locally in the current browser/device and does not change account data.

### Supabase Auth URLs for production

In Supabase Dashboard → Authentication → URL Configuration, set **Site URL** to the deployed production origin, for example `https://spendsense-git-main-malay9.vercel.app`, and add the deployed origin plus `/auth/callback` as an allowed redirect URL. Keep `http://localhost:3000/auth/callback` for local development. Password-reset links also return through `/auth/callback` and continue to `/auth/reset-password`.

Use the actual production URL shown by Vercel if it differs from the example above. Never commit `.env.local` or a Supabase service-role key.
