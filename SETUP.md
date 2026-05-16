# Setup Instructions

One-time setup before Claude Code starts working. This is **your** work, not Claude Code's. Do this once, then you're set.

Estimated time: 30-60 minutes.

---

## 1. Create the GitHub repository (5 min)

1. Go to https://github.com/new
2. Create a new private repository named `tomorrowlabs-platform` (or whatever you prefer)
3. **Do not initialize with README, .gitignore, or license** — this repo already has those files
4. Note the SSH or HTTPS clone URL

## 2. Initialize the local repository (5 min)

```bash
# Unzip this repo where you want it
cd ~/Projects  # or wherever you keep code
unzip tomorrowlabs-platform.zip
cd tomorrowlabs-platform

# Initialize git and push to GitHub
git init
git add .
git commit -m "chore: initial commit from architecture handoff"
git branch -M main
git remote add origin <YOUR-GITHUB-URL>
git push -u origin main
```

## 3. Set up your Supabase project (10 min)

You said you have a Supabase project already. Do the following in your Supabase dashboard:

1. **Get your credentials:**
   - Go to Project Settings → API
   - Copy the `Project URL`
   - Copy the `anon` `public` key
   - Copy the `service_role` `secret` key (you'll need this for migrations; never expose to client)

2. **Verify the database is empty** or in a state where you can run our migrations. If there are existing tables you want to preserve, talk to Claude Code about merging — don't just run our migrations on top.

3. **Save credentials to an `.env.local` file** in the repo root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

This file is gitignored — never commit it.

## 4. Run the migrations (15 min)

This is the moment the architecture stops being theoretical.

**Option A: Via Supabase SQL Editor (recommended for first run)**

1. Open the Supabase SQL Editor
2. Run `migrations/migration-001-omnilingual-cv-ipa.sql` — paste, run, verify no errors
3. Repeat for migrations 002 through 007 in order
4. Verify success by querying: `SELECT count(*) FROM languages;` (should return a small number from seed data)

**Important note:** Migration 000 (the original language database with the languages table itself) is NOT in this folder. It was created in the original conversation. You'll need to either:
- Recreate it from the schema catalog spreadsheet (see `knowledge-base/03-schema/`), or
- Have Claude Code reconstruct it as its first task

The cleanest path is to have Claude Code reconstruct migration-000 as its very first task, because it can verify the schema against the downstream migrations.

**Option B: Wait for Claude Code to handle it**

If you'd rather have Claude Code run migrations programmatically, skip this step and tell Claude Code to do it in the first session. It will need access to your service role key (in `.env.local`).

## 5. Install Node.js and dependencies (10 min)

If you don't have Node.js installed:
- Install via https://nodejs.org (LTS version, currently 20.x)

Then in the repo:

```bash
# Claude Code will create package.json in its first session
# For now, just verify node works:
node --version  # Should be 20.x or higher
npm --version
```

You don't need to install dependencies yet — Claude Code will set up the Next.js project and install everything in its first session.

## 6. Install Claude Code (5 min)

Follow the installation instructions at https://docs.claude.com/en/docs/claude-code/overview

Once installed, navigate to your repo:

```bash
cd ~/Projects/tomorrowlabs-platform
claude
```

This starts Claude Code in your repo. It will automatically read `CLAUDE.md` at the start of every session.

## 7. Start your first session

Open `docs/FIRST_SESSION_PROMPT.md` and paste the prompt into Claude Code. That kicks off the first session.

---

## What you should NOT do during setup

- **Don't write any code yourself first.** Let Claude Code set up the project structure. Adding files manually before Claude Code starts can cause confusion.
- **Don't modify the migrations.** They're tested and consistent. If you need changes, Claude Code creates new migrations (008, 009, etc.).
- **Don't run migrations partially.** Run them all or none. Running 001-003 but not 004 leaves the database in an inconsistent state.
- **Don't share credentials publicly.** The `.env.local` file is gitignored for a reason. Never paste credentials into a chat or commit them.

## Troubleshooting

**Migration fails with "relation does not exist":**
You're running migrations out of order, or migration-000 hasn't been created yet. See section 4.

**Migration fails with "type already exists":**
A previous migration partially succeeded. You may need to clean up by dropping the existing types/tables, or roll the migration forward carefully. Don't proceed without understanding the state.

**Supabase connection fails:**
Check `.env.local` has the right values. Project URL should end with `.supabase.co`. Anon key is a long JWT-style string.

**Claude Code doesn't see CLAUDE.md:**
Make sure you're running `claude` from the repository root, not from a subfolder.

## After setup

Once everything is set up, your day-to-day flow is:

1. `cd tomorrowlabs-platform`
2. `claude` (starts Claude Code)
3. Tell Claude Code what you want to work on (or let it read `docs/CURRENT_TASK.md`)
4. Review and approve its work
5. Commit when ready

The architecture is settled. The first build (admin UI) is scoped. Setup is a one-time cost. Everything after is incremental.

---

**Questions you'll probably have:**

**"Why didn't you just have Claude Code do all of this setup too?"**
Setup requires credentials and accounts that only you can create. The repo, the Supabase project, your GitHub account — those are yours. Claude Code can do everything that happens inside the repo after these basics are in place.

**"What if I want to use a different framework than Next.js?"**
Tell Claude Code in the first session. The CLAUDE.md mentions Next.js as the default, but the architecture is framework-agnostic. SvelteKit, Remix, Nuxt all work. Just be consistent.

**"What if I want to deploy to somewhere other than Vercel?"**
Same answer — tell Claude Code. Netlify, Cloudflare Pages, your own server all work. Just decide before you're deep in deployment-specific configuration.

**"How long until I have a working admin UI?"**
With focused work from Claude Code: probably 2-4 sessions of 1-2 hours each. Less if you're available to make decisions quickly; more if you want extensive review at each step.
