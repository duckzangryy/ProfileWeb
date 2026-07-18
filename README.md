# profile-web

Next.js personal profile site for **Vương Việt Anh** — glass UI, snow, media player, visitor panel, and light anti-abuse guards.

Built with the App Router and a Radix / shadcn-style component set.

## Features

- Hero profile layout with photography & avatar assets
- Falling snow effect (`components/snow-effect.tsx`)
- Background media player with local tracks under `public/`
- Theme provider (dark-friendly)
- Visitor / network info panel
- Optional anti-inspect / anti-DDoS shield components (client-side only — not real security)

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19 · Radix UI · Tailwind · Lucide |
| Analytics | Vercel Analytics (optional) |

## Quick start

```bash
git clone https://github.com/duckzangryy/profile-web.git
cd ProfileWeb
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Project structure

```
ProfileWeb/
├── app/                 # layout, page, global styles
├── components/          # media-player, snow, shields, UI primitives
├── hooks/               # mobile, toast
├── lib/                 # utils
└── public/              # images, audio, icons
```

## Customize

| Goal | Where |
|------|--------|
| Main page content | `app/page.tsx` |
| Global styles | `app/globals.css` |
| Music / images | `public/*.mp3`, `public/*.webp` |
| Snow / player | `components/snow-effect.tsx`, `components/media-player.tsx` |

## Deploy

Works on **Vercel** out of the box:

1. Import the GitHub repo
2. Framework preset: Next.js
3. Deploy

Or any Node host:

```bash
npm run build && npm start
```

## Notes

- Client “anti-inspect” scripts only deter casual users; do not rely on them for security.
- Keep large media optimized (WebP / compressed audio) for faster LCP.

## Author

[duckzangryy](https://github.com/duckzangryy) · related: [Portfolio-1](https://github.com/duckzangryy/personal-portfolio)
