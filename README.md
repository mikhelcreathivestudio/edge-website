# EDGE website: setup guide

This is the live EDGE website plus an admin dashboard at `/admin`.
Everything you will want to change (projects, images, team, prices, text, email, payment links) is edited from the dashboard. You never need to touch code.

What it costs: nothing (GitHub free, Netlify free, Formspree free tier, Stripe takes its normal fee per payment).

---

## 1. Put the files on GitHub (5 minutes)

1. On github.com click **New repository**. Name it `edge-website`. Private is fine.
2. Click **uploading an existing file**, then drag in everything from this folder (all files and the `admin`, `assets`, `content`, `images` folders). Commit.

## 2. Publish it with Netlify (5 minutes)

1. Sign up at netlify.com with your GitHub account.
2. **Add new project > Import an existing project > GitHub** and pick `edge-website`.
3. Leave the build command empty. Set the publish directory to `.` (a single dot). Deploy.
4. Netlify gives you an address like `something.netlify.app`. Your site is live there. (You can add your own domain later under Domain management.)

## 3. Turn on the dashboard login (10 minutes, one time)

The dashboard saves your edits into your GitHub repo, so it needs permission to log in with GitHub.

1. On GitHub open **Settings > Developer settings > OAuth Apps > New OAuth App**.
   - Application name: `EDGE admin`
   - Homepage URL: your Netlify address (for example `https://something.netlify.app`)
   - Authorization callback URL: `https://api.netlify.com/auth/done`
2. Copy the **Client ID**, click **Generate a new client secret** and copy the secret right away (GitHub shows it once).
3. In Netlify open your project, then **Project configuration > Access & security > OAuth** (the menu name may differ slightly; look for "OAuth" or "Authentication providers"). Click **Install provider**, choose **GitHub**, paste the Client ID and secret, save.
4. In your GitHub repo open `admin/config.yml`, click the pencil icon, and change these two things, then commit:
   - `repo: YOUR-GITHUB-USERNAME/edge-website` to your real GitHub username and repo name
   - `site_url` and `display_url` to your real site address
5. Go to `https://your-site/admin/` and click **Login with GitHub**.

Only people with write access to your GitHub repo can log in, so do not add collaborators you do not trust.

If the login does not work the first time, the two usual causes are a typo in `repo:` and a callback URL that is not exactly `https://api.netlify.com/auth/done`.

## 4. Using the dashboard

- **Projects**: add or edit projects. Fill in name, category, price, description, screenshots, and the Stripe/PayPal link. Untick "Show on the site" to hide one without deleting it.
- **Team**: add developers with photo, bio, skills and rate. Each gets their own profile page and Hire button.
- **Site settings & page text**: email, forms, booking, home page, services, packages and prices, FAQ, About page.

Click **Publish** after editing. The live site updates in about a minute.

Tips:
- Keep images under 1 MB and about 1600 px wide so pages load fast.
- "Page address" (like `nova-saas`) is used in the link. Use lowercase with dashes, and do not change it after publishing.
- Put `[[ ]]` around words that should glow blue in a headline, for example `an [[EDGE.]]`.

## 5. Connect Stripe (payments)

For every project and every package:

1. In your Stripe dashboard open **Payment Links > New**.
2. Add the product name and the price, then create the link.
3. Copy it (it starts with `https://buy.stripe.com/`) and paste it into the **Stripe payment link** field in the dashboard.

Clients then pay you directly and you see the payment in Stripe. If a project has no payment link, its Order button shows a request form instead, so nothing breaks.

PayPal works the same way: paste a PayPal.me or PayPal payment link into the **PayPal payment link** field.

## 6. Get form messages in your email

Hire, order, negotiation and booking forms need a small free service to deliver messages:

1. Sign up at formspree.io and create a form that sends to `mikhelcreathivestudio@gmail.com`.
2. Copy the form link (like `https://formspree.io/f/abcdwxyz`).
3. In the dashboard open **Site settings > Contact, forms and booking** and paste it into **Form link**.

Until you do this, the forms open the visitor's own email app with the message filled in, which works but is less smooth.

## 7. Booking calls (optional)

Create a free Cal.com or Calendly link and paste it into **Booking link**. The Book a call page then shows your calendar. Without it, visitors choose a day and time and send you a request.

## 8. Before you go live: replace the samples

- The 3 projects are samples named "Sample Project 1/2/3". Replace them with real work or untick "Show on the site".
- Team members 2 to 4 are samples. Replace or hide them.
- The Starter, Pro and Premium prices ($199 / $499 / $999) are placeholders. Set your real prices.
- "Numbers" and "Testimonials" are empty on purpose, so nothing invented is shown. Add real ones when you have them.

## Running it on your own computer (optional)

Open a terminal in this folder and run `python3 -m http.server 8000`, then visit `http://localhost:8000`. (Opening the HTML files by double-click will not work because the pages load their content from the `content` folder.)

## What is where

- `*.html`: the 9 pages (they all load `assets/app.js`)
- `assets/edge.css`: the dark blue design and animations
- `assets/app.js`: builds each page from the content files
- `content/*.json`: all your text, prices, projects and team (this is what the dashboard edits)
- `admin/`: the dashboard
- `images/uploads/`: images you upload in the dashboard
