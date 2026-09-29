# COLORIDO 2K26 — Official Cultural & Sports Frontend Prototype
**RVR & JC College of Engineering, Guntur**

> **Tagline:** *"Your Stage. Your Game. Your COLORIDO."*  
> **Registration Fee:** **NO REGISTRATION FEE (100% Free)**  
> **Festival Scope:** Exclusively Cultural & Sports Events  

---

## 🌟 Architecture & Technical Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling & Design System:** Tailwind CSS v4 + Custom Neon Glow & Stage Gradients
- **3D Graphics & Simulation:** Three.js + React Three Fiber (`@react-three/fiber`) + `@react-three/drei`
- **Iconography:** Lucide React
- **Celebration Effects:** Canvas Confetti

---

## 🏛️ Campus Assets & Real Reference Mappings

All real campus photographs provided have been integrated directly into `public/assets/`:

| Campus Venue / Element | File Name | Screen & Feature |
| :--- | :--- | :--- |
| **RVR & JC Main Campus Building** | `rvrjc.jpg` | Full-screen cinematic Homepage Hero background with subtle 3D/parallax |
| **RVR & JC Official Crest** | `rvr_logo.jpg` | Navbar crest, Footer branding, and favicon |
| **Festival Visual Identity Poster** | `colorido_poster.png` | Homepage About Section & Festival Identity Showcase |
| **RVRJC OAT (Open Air Theatre)** | `oat1.jpeg` ~ `oat5.jpg` | Procedural 3D amphitheatre model + 5-angle architectural photo inspection modal |
| **Playground in front of SJB Block** | `volleyball1.jpg` | Boys Volleyball & Girls Throwball venue with 360° & Guided exploration |
| **Basketball Court inside campus** | `basketball1.jpg`, `basketball2.webp` | Boys Basketball arena with multi-angle guided views |
| **Sports Plex in front of Canteen** | `sportsplex.jpg` | Boys/Girls Table Tennis & Girls Tennikoit indoor pavilion |

---

## ⚙️ Centralized Data Architecture (`src/data/festivalData.ts`)

Everything that is likely to be updated by the college organizing committee is strictly isolated in `src/data/festivalData.ts`:

- `festivalConfig`: Dates, tagline, fee notice, college address, official contacts, social channels.
- `culturalCategories`: 6 categories with 3D hotspot coordinates on the OAT (`DANCE`, `MUSIC`, `FINE ARTS`, `LITERARY`, `DRAMATIC`, `FASHION`).
- `boysSportsEvents`: Volleyball, Basketball, Table Tennis (Orange / Red athletic identity).
- `girlsSportsEvents`: Throwball, Tennikoit, Table Tennis (Blue / Cyan athletic identity).
- `campusVenues`: Architectural features, descriptions, and guided camera angles.
- `registrationUrls`: Exactly 3 official Google Form destinations (`cultural`, `boysSports`, `girlsSports`).

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
