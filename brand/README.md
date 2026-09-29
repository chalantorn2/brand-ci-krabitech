# Krabi Digital Solutions — Brand CI v1.4

Brand book: open `k8-brand-guidelines.html` in a browser (also published at https://claude.ai/artifact/HjTvT6n4aZYTtw8uuWZ3H2).

| | |
|---|---|
| Logo | **K8 · Pixel K** — solid K, lower arm breaks into pixels |
| Colors | Navy `#041A53` · Electric Blue `#0059FF` · Cyan `#09FFFF` (dark only) · Sky `#7FAEFF` · Mist `#EEF3FC` |
| Type | Head: Red Hat Display + **LINE Seed Sans TH** (700/800) · Body: Plus Jakarta Sans + **IBM Plex Sans Thai** |
| Signature illustration | เขาขนาบน้ำ, 6 simplification levels — pick by display size, never lock with the logo |

## Folders

```
k8-brand-guidelines.html   the brand book (single source; everything below is exported from it)
logo/           k8-*.svg — symbol, circle (navy / blue / white), horizontal + vertical × primary / reversed / mono navy / mono white, app icon, favicon
illustration/   kn-illustration-*.svg (L1 original), kn-level-2…6-*.svg, kn-pixel-dissolve.svg, kn-badge-*.svg
icons/          icon-*.svg — 6 service icons (24 px, 2 px stroke, one Blue pixel accent)
  social/       14 social & contact icons × 7 variants, social-sprite.svg, social-icons.css
                edit social-icons.src.js, then `node brand/icons/social/build.js` (also updates the brand book)
tokens/         krabi-tokens.css (CSS variables) · krabi-tailwind.css (Tailwind v4 @theme)
fonts/          RedHatDisplay.ttf, LINESeedSansTH_*.ttf/.woff2 + OFL — install before outlining lockups for print; self-host the woff2 on the web
source/         เขาขนาบน้ำ.ai / .svg (original artwork) · reference photo
motion/         k8-logo-intro.svg, k8-symbol-intro(-dark).svg, k8-loader(-dark).svg — animated SVG (CSS inside, works in <img>)
                social-motion.html — logo sting / post / story / lower third; `node brand/motion/build/export.js` → export/*.mp4 (+ poster .png)
                export uses Chrome WebCodecs + build/mp4.js, no ffmpeg needed
templates/      documents/ quotation · invoice · receipt .html (edit in browser, print A4) — company & bank details in doc.js
                  `node brand/templates/documents/build-previews.js` → samples/*.pdf/.png
                office/ krabi-documents.xlsx (formulas, BAHTTEXT) + *.docx — `python brand/templates/office/build/build_office.py`
gradient/       gradient-compare.html — Soft Mesh vs Pixel Mesh study (not part of the CI until one is chosen)
deploy/         docker-compose.yml (Portainer stack `brandci`) · pack.py → brandci-html.tar
```

## Deploy (https://brandci.krabitech.com)

Site files live on the Docker host (10.10.30.11) at **`/opt/brandci/html/`**, bind-mounted read-only into the `brandci` nginx container. The stack itself only holds nginx config.

After editing the brand book:
1. `python brand/deploy/pack.py` → `brand/deploy/brandci-html.tar` (index.html + logo, illustration, icons, fonts, tokens)
2. Extract the tar into `/opt/brandci` on the host (it contains `html/`). Without SSH: via the Portainer Docker API, start a temporary `nginx:alpine` container with `/opt/brandci:/target`, `PUT /containers/{id}/archive?path=/target` with the tar, then remove it. No stack redeploy needed.
3. If a logo/illustration/icon changed, re-export it first: open the page, section **15 / Files**, *Copy SVG*, overwrite the file here. The same section has *Copy PNG* / ↓ (transparent, 2048 px; icons 1024 px).

**Before print:** lockup SVGs use live Red Hat Display text. Open in Figma/Illustrator with the font installed and Create Outlines. CMYK/PMS values are approximations; proof with the printer.

Old concepts and AI explorations are in `../_archive/brand-explorations/` (not part of the CI).
