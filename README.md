# SEO Ideas Hub & ICE Prioritization Dashboard

A sleek, lightweight, executive-ready dashboard for collecting SEO ideas from the team and prioritizing them using the **ICE framework** (Impact, Confidence, Ease).

## 🚀 Key Features

### 1. Two Dedicated Portals & Secure Passcode Access
- **Team Entry Portal** (`Password: 7730`):
  - Submit new SEO growth initiatives with live preview.
  - Rate initiatives across **Impact (1-10)**, **Confidence (1-10)**, and **Ease (1-10)**.
  - Team Stream Feed to explore ideas submitted across the organization.
- **Admin Management Portal** (`Password: 8967`):
  - Executive KPI summaries (Total Submissions, Go Ahead/Selected count, In Discussion, Average ICE score).
  - Calculated **Total ICE Score** `(Impact + Confidence + Ease) ÷ 3` with visual score badges.
  - Dynamic **Selection Stage Status** assignment:
    - `Selected`
    - `Rejected`
    - `Route for discussion`
    - `Discussion`
    - `Go ahead`
  - Real-time search, category filtering, and sorting (by Highest ICE score, Impact, Confidence, Ease, or Date).
  - Admin evaluation notes & full idea inspection modals.
  - 1-click **Export to CSV** for reporting.

### 2. Design & Aesthetics
- Crisp, modern, light background theme.
- Responsive across mobile, tablet, and desktop screens.
- Zero external build tool dependencies — runs natively in any modern browser.

---

## 🛠️ How to Run Locally

Simply double-click [`index.html`](index.html) in any browser, or use any local web server:

```bash
# Using Python
python -m http.server 8000

# Or using npx serve
npx serve .
```

---

## 🔐 Credentials Summary

| Portal | Passcode | Access Level |
| :--- | :--- | :--- |
| **Team Portal** | `7730` | Submit ideas, rate ICE parameters, view team feed |
| **Admin Portal** | `8967` | Review calculated ICE scores, assign selection stages, delete/edit, export data |
