# Bryce Huston Website

Premium personal brand and business website for **Bryce Huston** and **HUSTON SOLUTIONS**.

This repo contains the homepage experience plus supporting pages for:

- `About`
- `Projects`
- `Solutions`
- `Explore`
- `Contact`

The site is built as a **static front-end project** with custom motion, premium UI styling, and a 3D interactive hero.

## ✨ Overview

This project is designed to feel:

- dark
- cinematic
- premium
- modern
- founder-led
- high-intent

The homepage is the main visual centerpiece, with:

- a custom **Three.js hero object**
- **GSAP / ScrollTrigger** motion
- animated stat counters
- traced border accents
- layered glow / trail atmospherics
- editorial-style featured project layouts

## 🧰 Tech Stack

- **HTML5**
- **CSS3**
- **Vanilla JavaScript**
- **GSAP**
- **ScrollTrigger**
- **Three.js**

No framework is required. No build step is required.

## 📁 Project Structure

```text
.
├── index.html          # Homepage
├── homepage.css        # Homepage-specific styles
├── script.js           # Shared motion, reveal, stat, and trace logic
├── styles.css          # Shared styles for inner pages
├── about.html
├── projects.html
├── solutions.html
├── explore.html
├── contact.html
└── site screenshots/   # Reference files / visual source material
```

## 🖥️ Pages

### `index.html`

The main homepage experience, including:

- 3D hero stage
- stats section
- story panels
- featured projects showcase
- HUSTON SOLUTIONS feature block
- explore section
- FAQ
- final CTA

### Supporting Pages

- `about.html`
- `projects.html`
- `solutions.html`
- `explore.html`
- `contact.html`

These pages use the shared `styles.css` and `script.js` system.

## 🎯 Homepage Features

### Hero

- custom **Three.js particle/object animation**
- mode controls for scene variations
- glow / trails toggles
- premium dock styling
- animated title reveal

### Scroll / Motion

- section reveal system
- shared title reveal system
- GSAP-powered scroll triggers
- reduced motion fallbacks

### Stats

- odometer-style number animation
- staggered reveal
- premium card styling

### Featured Projects

- editorial-style asymmetrical layout
- particle background layer
- perimeter border trace accents

### FAQ

- expandable answer panels
- inner answer trace accents
- progressive cyan → blue → violet answer styling

### Final CTA

- animated particle field
- premium CTA card treatment
- traced perimeter accent

## 🚀 Running Locally

Because this is a static site, you can run it with any simple local server.

### Option 1: VS Code Live Server

Open the project folder and launch **Live Server** on `index.html`.

### Option 2: Python

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## 🛠️ Editing Notes

### Homepage styling

Most homepage-specific work lives in:

- [`homepage.css`](./homepage.css)
- [`index.html`](./index.html)
- [`script.js`](./script.js)

### Inner pages

Supporting pages mainly rely on:

- [`styles.css`](./styles.css)
- [`script.js`](./script.js)

## 🎨 Design Direction

The site uses a consistent visual language built around:

- **dark midnight surfaces**
- **baby blue / cool cyan accents**
- **soft violet support tones**
- **subtle glow**
- **thin premium borders**
- **glass / layered depth**
- **clean geometric typography**

The goal is to feel more like a **high-end custom brand site** than a generic template.

## 📌 Current Notes

- Some sections still use placeholder copy/media where real project assets can be dropped in later.
- The structure is already designed to support replacing placeholders without rebuilding the layout.
- Motion is intentionally stronger on the homepage and quieter on the supporting pages.

## 🔮 Good Next Steps

If you want to keep improving the site, the best next upgrades would be:

1. Replace placeholder project/media blocks with real work
2. Add real testimonials / trust signals
3. Refine supporting page content and case-study depth
4. Add a favicon / OG image / social preview assets
5. Optimize final production assets for launch

## 📬 Contact

If you are using this repo as the working site for Bryce Huston:

- update the contact details in `contact.html`
- update final project content in `projects.html` / `solutions.html`
- replace placeholder review references with real review data when ready

---

Built with care for a premium, cinematic web presence. ✨
# brycehuston-site
