# NoblePad Brand Guide (repository)

This document summarises the brand asset usage and rules stored under `public/branding/`.

Primary assets
- `logo.svg` — primary logo (use SVG on web for crisp scaling)
- `logo-monochrome-gold.svg` — gold monochrome version for dark backgrounds
- `logo-monochrome-black.svg` — black mono version for light backgrounds
- `favicon-16.svg`, `favicon-32.svg` — favicons
- `apple-touch-icon.svg` — 180x180 for iOS
- `app-icon-1024.png` — 1024x1024 app icon for mobile stores (replace with provided high-res asset)

Usage rules
- Header placement: top-left on desktop, centered on mobile.
- Maximum logo height: `40px` desktop, `32px` mobile, `24px` footer.
- Minimum clear space: equal to the logo's height on all sides.
- Colors:
  - Primary: `#D4AF37` (Deep Gold)
  - Secondary: `#0A0A0A` (Jet Black)
  - Accent: `#2A0A4A` (Deep Dark Purple)
- Use SVG on web. Export PNG for print materials at 300 DPI.
- Ensure `alt` text for logo images is always set to `"NoblePad logo"`.

Accessibility
- Confirm contrast ratio meets WCAG 2.1 AA for text over background where logo appears.

Animation
- Keep entrance/hover animations subtle: fade + scale (max 1.05) and a soft gold glow on hover.

Replace the placeholder `logo-placeholder.svg` with the official provided SVG and generate the production app icons and favicons following these specs.
