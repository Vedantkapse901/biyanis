# BJNP EdTech Platform

A React + Vite web app for BJNP (IIT JEE, NEET, CET) with:
- Public website pages (home, courses, results, branches, study material, gallery)
- Admin Panel CMS for managing website content
- AI tutor/review assistant integration hooks

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Firebase (Firestore/Auth fallback-aware)

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Start development server

```bash
npm run dev
```

If port `5173` is already occupied, Vite will auto-switch to the next port (for example `5174`).

### 3) Production build

```bash
npm run build
```

### 4) Preview production build

```bash
npm run preview
```

## App Routes

- `#/` Home
- `#/courses` Courses
- `#/study-material` Study Material
- `#/gallery` Event Gallery
- `#/results` Results
- `#/branches` Branches
- `#/about` About
- `#/contact` Contact
- `#/admin` Admin Panel

> Router uses `HashRouter`, which works well for static hosting.

## Admin Panel

Default admin password:

- `Biyanis@123`

### Important behavior: Draft + Save

Admin edits are made in **draft mode** and only go live after clicking:

- **Save to Website**

This helps prevent accidental live updates while editing.

### What admin can manage

- Hero slides (image/video)
- Courses, results, branches
- Gallery items and Drive links
- Free downloads
- Factory reset (loads default template into draft)

## Media Uploads

Where media fields exist in admin, uploads are from **device file picker** instead of URL input.

Current uploaded media is stored in app data as data URLs (base64).

## Gallery Behavior

Gallery is folder-first:
- Users see folder cards first
- Clicking a folder opens previews (modal is rendered outside the page transition so full-screen overlay works correctly)
- Download flow is intended via that folder's Drive link

## Footer Credits

Footer includes:
- "Made with" line with animated heart by Vedant Kapse and Bhushan Naikwade
- Animated beating heart
- Clickable phone and email links for both profiles

## Notes

- Some large media uploads can increase stored payload size quickly due to base64 storage.
- For heavy production usage, migrate uploads to real object storage (for example Firebase Storage) and keep only file references in data.
