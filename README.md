# Evidence Desk

Evidence Desk is an evidence-first public-company research workspace. This export contains the source for the live front-end MVP.

The current demonstration is seeded with AMD research so that every view has realistic content. The research query is editable, but changing the company does **not** fetch or generate a new analysis yet. Live company selection, data retrieval, LLM orchestration, calculations, and storage are the next implementation phase.

## Run locally

### Requirements

- Node.js 22.13 or newer
- npm

### Windows PowerShell, macOS, or Linux

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal, normally `http://localhost:5173`.

To stop the development server, press `Ctrl+C`.

## Production build

```bash
npm run build
npm run start
```

## Useful commands

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Serve the production build
npm run lint     # Run ESLint
npm test         # Build and run the included smoke test
```

## Project map

- `app/page.tsx` — application UI, seeded AMD evidence, claims, and metrics
- `app/globals.css` — complete responsive design system
- `app/layout.tsx` — document layout and metadata
- `public/` — icons and static assets
- `worker/index.ts` — Vinext/Cloudflare runtime entry point
- `vite.config.ts` — local development and build configuration

## Planned generalization

The intended workflow is:

1. Accept a company/ticker, research question, and optional peers.
2. Resolve the company and build a research plan.
3. Retrieve SEC filings, investor materials, market data, transcripts, and news.
4. Run deterministic financial calculations and peer comparisons.
5. Form claims linked to supporting and contradicting evidence.
6. Produce a cited report with risks, confidence, and unresolved questions.

AMD should remain as a sample dataset while the hard-coded arrays in `app/page.tsx` are moved behind typed company/research-result models and API routes.
