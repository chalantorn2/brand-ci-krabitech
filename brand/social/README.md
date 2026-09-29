# Krabi Digital · Social Kit v1.0

Open `social-kit.html` — preview of every asset, mockups (FB / IG / LINE), and all page text with copy buttons.

```
profile/     profile-navy (main) · profile-blue       720²  — FB / IG / LINE OA
facebook/    fb-cover                                 1640 × 624 (mobile safe zone: centre 1110 px)
instagram/   highlight-01…07                          1080²
line-oa/     line-cover 1080 × 878 · richmenu-large 2500 × 1686 · richmenu-compact 2500 × 843
posts/       post-01…09  first 9 posts, publish 01 → 09   1080 × 1350
templates/   tip · review · case · announce · carousel 1-3 · story (1080 × 1920)
copy.md      all text: bio, about, services, Messenger/LINE auto-replies, rich menu actions, 9 captions
```

Every asset is PNG (upload) + SVG (edit in Figma — install Red Hat Display, Plus Jakarta Sans, IBM Plex Sans Thai, LINE Seed Sans TH first).

## Edit & rebuild

Layout: `build/assets.js` · Text: `build/copy.js` · Helpers (logo, pixels, icons, mountain): `build/lib.js`

```
cd brand/social/build
npm install
node build.js            # all assets + social-kit.html + copy.md
node build.js posts/     # only matching files
```

The build warns when a text line overflows its box. Needs Chrome or Edge installed.
