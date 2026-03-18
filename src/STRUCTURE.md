# Project Structure (Modular & Distributed)

## Overview

The app is organized by **feature** and **layer**: pages (routes), shared layout, feature-specific components, config, and utils.

## Folder Layout

```
src/
├── app/                    # (optional future: App shell, providers)
├── pages/                  # Route-level screens (one per route)
│   ├── Home/               # Landing page (templates, quotes, feedback)
│   │   └── index.js
│   ├── Templates/          # Image templates listing
│   │   └── index.js
│   ├── InputForm/          # Biodata form (re-exports component)
│   │   └── index.js
│   ├── Preview/            # PDF preview & download
│   │   └── index.js
│   ├── About/
│   │   └── index.js
│   ├── Contact/
│   │   └── index.js
│   ├── Terms/
│   │   └── index.js
│   ├── UsePolicy/
│   │   └── index.js
│   └── JoinWhatsApp/
│       └── index.js
│
├── components/             # Reusable & feature-specific UI
│   ├── layout/             # App shell (Navbar, Footer)
│   │   ├── Navbar.js
│   │   └── Footer.js
│   ├── home/               # Home page only (sliders, quotes)
│   │   ├── FeedbackSlider.js
│   │   ├── QuoteSlideshow.js
│   │   └── TemplateSlider.js
│   ├── form/               # Form & input (crop, transliteration)
│   │   ├── ImageCropComponent.js
│   │   ├── ImageUploadWithCrop.js
│   │   └── TransliterationInput.js
│   ├── pdf/                # PDF generation & preview
│   │   ├── PDFDocument.js
│   │   └── PDFPreview.js
│   ├── InputFormPage.js    # Full form page (uses form/, stays here)
│   ├── PreviewPage.js      # Full preview page (uses pdf/)
│   ├── AboutUs.js
│   ├── ContactUs.js
│   ├── TermsAndConditions.js
│   └── UsePolicy.js
│
├── config/                 # App & service config
│   └── firebase.js
│
├── utils/                  # Helpers (no React)
│   ├── cropImageHelper.js
│   ├── imageUtils.js
│   └── readFileAsDataURL.js
│
├── assets/                 # Static assets
│   ├── fonts/              # Devanagari fonts for PDF
│   │   ├── NotoSansDevanagari-Regular.ttf
│   │   └── NotoSansDevanagari-Bold.ttf
│   └── ...                 # SVGs, images
│
├── App.js                  # Router & layout wiring
├── index.js
└── reportWebVitals.js
```

## Import Conventions

- **Pages** import from `../../components/...` (layout, home, form, pdf).
- **Layout** components have no internal app imports (only react-router, etc.).
- **Form** components import utils from `../../utils/...`.
- **PDF** components import fonts from `../../assets/fonts/...`.
- **App.js** imports pages from `./pages/<PageName>` and layout from `./components/layout/...`.

## Adding a New Page

1. Create `src/pages/<PageName>/index.js` (export default component).
2. In `App.js`, add route and import:  
   `import <PageName>Page from './pages/<PageName>';`  
   `<Route path="/path" element={<PageName>Page />} />`

## Adding a New Shared Component

- **Layout (Navbar/Footer-like):** `src/components/layout/<Name>.js`
- **Feature-specific:** `src/components/<feature>/<Name>.js` (e.g. `home/`, `form/`, `pdf/`)
- **Page-level (big screen):** keep in `src/components/` and re-export from `src/pages/<Page>/index.js` if it’s a route.
