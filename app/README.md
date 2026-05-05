# Based Gecko — App (Frontend)

Next.js 14 frontend for the Based Gecko token monitoring platform.

## Development

```bash
npm install
npm run dev       # Start dev server on port 3000
npm run build     # Production build
npm run test:run  # Run tests
npm run lint      # ESLint
```

## Structure

```
src/
├── app/              Next.js App Router (pages + API routes)
├── components/       React components
│   ├── brainPage/    Token detail page components
│   ├── modules/      Shared UI (Header, TokenList, Footer)
│   ├── webgl/        Three.js 3D scene
│   └── svg/          SVG icon components
├── services/         API data fetching
├── hooks/            Custom React hooks
├── store/            Valtio global state
├── constants/        Contract addresses, API URLs
└── util/             Utility functions
```

## Environment Variables

See `.env.example` for required variables.
