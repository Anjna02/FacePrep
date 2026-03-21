# FACEPrep – React Project

A React conversion of the FACEPrep multi-page HTML application.

## Project Structure

```
faceprep/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Root component + client-side routing
    ├── styles/
    │   └── global.css        # Global reset & keyframe animations
    ├── data/
    │   └── assessments.js    # Static data (assessments, test sections)
    ├── components/
    │   ├── Navbar.jsx        # Shared top navigation bar
    │   ├── AssessmentCard.jsx # Card for active/completed assessments
    │   └── SectionCard.jsx   # Card for individual test sections
    └── pages/
        ├── LoginPage.jsx         # Login screen
        ├── DashboardPage.jsx     # Dashboard (greeting + spinner)
        ├── AssessmentsPage.jsx   # Assessments list with Active/Completed tabs
        └── TestSectionsPage.jsx  # Test sections grid page
```

## Pages & Navigation

| Page | Route (state) | HTML source |
|------|--------------|-------------|
| Login | `login` | `login.html` / `index.html` |
| Dashboard | `dashboard` | `dashboard.html` / `index.html` |
| Assessments | `assessments` | `assessments.html` |
| Test Sections | `test-sections` | `test_sections.html` |

Navigation is handled via React state in `App.jsx` — no external router needed.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Key Changes from HTML Version

- All pages are now React components instead of separate HTML files
- `script.js` logic is split into component-level state/hooks
- `style.css` styles are inlined as JS style objects per component
- `localStorage` session persistence is retained via `useEffect` in `App.jsx`
- Data (assessments, sections) is centralized in `src/data/assessments.js`
- Navigation uses React state instead of `window.location.href`
