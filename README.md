# SaaS Contracts Dashboard

A clean, modern React (Vite) + Tailwind CSS single-page dashboard for browsing and reviewing SaaS contract records.  
The app is fully responsive, handles all key UI states, and is deployed for instant demo access.

---

## 🌐 Live Demo
[https://saas-contracts-dashboard1.netlify.app/](https://saas-contracts-dashboard1.netlify.app/)

## 📂 Repository
[https://github.com/Mrigank-Mouli-Singh/saas-contracts-dashboard1](https://github.com/Mrigank-Mouli-Singh/saas-contracts-dashboard1)

---

## 🧰 Tech Stack

| Category | Choice | Reason |
|----------|-------|-------|
| Framework | **React 18 + Vite** | Fast builds & modern tooling |
| Styling | **Tailwind CSS** | Utility-first, mobile-first, clean responsive design |
| Routing | **React Router** | Smooth client-side page navigation |
| Deployment | **Netlify** | Zero-config hosting with SPA redirects |
| Tooling | ESLint, Prettier (recommended) | Maintainable, consistent code style |

---

## 🚀 Getting Started

### Prerequisites
- Node.js **v18+**
- npm, pnpm, or yarn

### Local Development
```bash
# install dependencies
npm install

# start dev server
npm run dev

# build for production
npm run build

# preview the production build locally
npm run preview
```

##Deployment
###Netlify settings:

Build command: npm run build

Publish directory: dist

Repo includes _redirects or netlify.toml to ensure proper SPA routing.

## Folder Structure
```
  components/       # Reusable UI widgets (tables, cards, loaders, etc.)
  hooks/            # Custom React hooks (data fetch, responsive helpers)
  pages/            # Route-level views (Dashboard, ContractDetail, Reports, Settings)
  lib/              # Helpers, constants, utilities
  styles/           # Global Tailwind imports
  App.jsx           # Main app layout & router
  main.jsx          # Entry point
public/             # Static assets
```
This structure keeps UI, logic, and routing well separated and easy to scale.

## ✅ UI/UX Features
Clean, modern look powered by Tailwind.

Fully responsive on mobile, tablet, and desktop.

Robust state handling: loading skeletons, empty states, error messages, and success views.

Smooth navigation: instant transitions with React Router.

## 💡 Assumptions
Demo is public—no login/auth required.

Using mock or local data for now; can be swapped for an API later.

SPA hosting on Netlify satisfies all deployment needs.

## 🧩 Future Enhancements (Optional)
Integrate real API for live contract data.

Add authentication (e.g., OAuth/JWT) if private access is needed.

Include automated tests with Vitest + React Testing Library.

## 👤 Author

Mrigank Mouli Singh
