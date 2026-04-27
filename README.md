# M&A Readiness Index

A confidential, anonymous diagnostic tool for founders and business owners exploring a sale or liquidity event.

## Live URL
`https://Bpodg74.github.io/MnA_Readiness`

---

## Setup — two things to configure before going live

### 1. Formspree (email delivery)
Formspree receives form submissions and forwards them to your inbox — no server needed.

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form and copy your Form ID (looks like `xpzgkwqr`)
3. Open `js/diagnostic.js` and replace `YOUR_FORM_ID`:
   ```
   fetch('https://formspree.io/f/YOUR_FORM_ID', ...
   ```
4. In Formspree settings, set the notification email to your address

### 2. Cloudflare Turnstile (bot protection)
Turnstile is a free, invisible CAPTCHA that stops bots without annoying humans.

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile
2. Add a site — enter `Bpodg74.github.io` as the hostname
3. Select **Managed** widget type (invisible to users)
4. Copy your **Site Key**
5. Open `pages/diagnostic.html` and replace `0x4AAAAAAA_REPLACE_WITH_YOUR_KEY`:
   ```html
   <div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY" ...>
   ```
6. Add your **Secret Key** to Formspree's server-side validation (optional but recommended)

---

## Enabling GitHub Pages

1. Push this folder to your repo: `Bpodg74/MnA_Readiness`
2. Go to **Settings → Pages** in the repo
3. Under **Source**, select **Deploy from a branch**
4. Choose **main** branch, **/ (root)** folder
5. Click Save — your site will be live at `https://Bpodg74.github.io/MnA_Readiness` within a minute or two

---

## File structure

```
MnA_Readiness/
├── index.html          ← Landing page
├── css/
│   ├── style.css       ← Shared styles (nav, typography, layout)
│   └── diagnostic.css  ← Diagnostic form styles
├── js/
│   └── diagnostic.js   ← Scoring engine, step nav, form submission
├── pages/
│   └── diagnostic.html ← 5-step questionnaire
└── README.md
```

---

## What's built

- Landing page with value proposition, 8-dimension overview, stats and how-it-works
- 5-step diagnostic questionnaire (12 questions across 8 M&A dimensions)
- Weighted scoring engine (0–100) with dimension-level breakdown
- Early signal reveal after first 3 questions (hook)
- Animated score dial and bar chart on results page
- Email gate: submit score + answers to your inbox via Formspree
- Bot protection: honeypot field + Cloudflare Turnstile
- Fully responsive (mobile-friendly)

---

## Next steps (future iterations)

- [ ] Add personalised gap report email (via Formspree autoresponder or Mailchimp)
- [ ] Build a CRM tagging system (score tiers → outreach priority)
- [ ] Add sector/revenue/geography questions for lead qualification
- [ ] Move to a custom domain when ready to go public
