---
name: Cardiolife
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3e4850'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6e7881'
  outline-variant: '#bec8d2'
  surface-tint: '#006591'
  primary: '#006591'
  on-primary: '#ffffff'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#89ceff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006c49'
  on-tertiary: '#ffffff'
  tertiary-container: '#00b17b'
  on-tertiary-container: '#003b26'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is engineered for a healthcare environment that prioritizes precision, trust, and accessibility. It follows a **Modern Corporate** aesthetic with strong influences from **Minimalism** to ensure that complex medical data remains legible and stress-free for doctors, staff, and patients. 

The visual narrative focuses on "Clinical Clarity"—using ample whitespace, a structured card-based architecture, and a calming color palette to reduce cognitive load. The interface should feel institutional yet approachable, moving away from cold, traditional medical software toward a high-end, user-centric SaaS experience.

## Colors
This design system utilizes a palette optimized for high-performance clinical environments:

- **Primary (Sky Blue):** Used for primary actions, active navigation states, and focus indicators. It represents vitality and technological precision.
- **Secondary (Dark Navy):** Applied to typography, sidebars, and deep structural elements to provide a grounded, authoritative contrast.
- **Accent (Emerald Green):** Reserved for positive statuses, "Success" states, and healthy vitals or completed appointments.
- **Background (Light Gray):** A soft, neutral canvas that reduces eye strain during long shifts.

Functional semantic colors should be used for feedback: `#EF4444` for alerts/errors and `#F59E0B` for pending tasks or warnings.

## Typography
The typography system uses **Inter**, a typeface designed for screen legibility and functional clarity. 

- **Language Support:** All strings must be in Spanish (e.g., "Expediente Médico", "Citas Pendientes").
- **Hierarchy:** Use `Secondary/Dark Navy` for headings to establish authority. Use a mid-tone gray for secondary body text to create clear visual levels.
- **Readability:** Maintain a strict line-height ratio (at least 1.5x for body text) to ensure medical notes and patient histories are easily scannable.
- **Labels:** Use `label-md` for table headers and small captions, utilizing a slight tracking increase and uppercase transform for distinction.

## Layout & Spacing
The layout follows a **Fluid Grid** model with high-density protection for data-heavy views.

- **Grid System:** A 12-column grid for desktop with 24px gutters. On mobile, transition to a 1-column or 2-column stack with 16px margins.
- **Container Strategy:** Content is housed within card-based containers. For large dashboard views (Doctors), cards should use a flexible masonry or grid flow.
- **Vertical Rhythm:** Use increments of 8px for all spacing between elements to maintain a mathematical, professional consistency.
- **Safe Areas:** Maintain a 40px margin on desktop to prevent the UI from feeling cramped, reinforcing the "Minimalist" brand value.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Ambient Shadows**.

- **Surface Levels:** 
  - Level 0 (Background): #F8FAFC.
  - Level 1 (Cards/Sidebar): #FFFFFF with a subtle border (#E2E8F0).
- **Shadows:** Use extremely soft, diffused shadows to lift cards from the background. 
  - `shadow-sm`: 0px 1px 2px rgba(15, 23, 42, 0.05).
  - `shadow-md`: 0px 4px 6px -1px rgba(15, 23, 42, 0.1).
- **Interactions:** On hover, cards may transition from `shadow-sm` to `shadow-md` with a slight Y-axis lift (2px) to signify interactivity.

## Shapes
The design system employs a "Soft Geometric" approach. While the professional nature requires some structure, rounded corners are used to make the medical environment feel more empathetic and modern.

- **Components (Buttons, Inputs):** 0.5rem (8px).
- **Containers (Cards, Modals):** `rounded-xl` (1.5rem / 24px) or `rounded-2xl` (2rem / 32px) for primary dashboard cards.
- **Selection Indicators:** Use pill-shaped (full round) for tags and chips to distinguish them from functional buttons.

## Components
- **Buttons:** Primary buttons use a solid Sky Blue fill with white text. Ghost buttons use Sky Blue text with no border. All buttons use `semibold` weight.
- **Cards:** White background, `rounded-2xl`, and `shadow-sm`. Cards should include a 1px border in `#F1F5F9` to ensure separation on light displays.
- **Input Fields:** Use a subtle background fill (#F1F5F9) rather than a heavy border. On focus, the border transitions to Sky Blue with a soft outer glow.
- **Status Chips:** Small, pill-shaped elements. 
  - *Confirmada:* Emerald Green background (10% opacity) with Emerald Green text.
  - *Cancelada:* Red background (10% opacity) with Red text.
- **Lists:** Patient lists should use high-contrast rows with 16px vertical padding. Use `body-md` for primary list items and `body-sm` for sub-text (e.g., "Última consulta: 12 Oct").
- **Navigation:** A fixed left sidebar in Dark Navy (#0F172A) for internal staff, or a top horizontal bar for the Patient portal.