---
paths:
  - "src/robo-wash-react/**"
---

# Client: React, TypeScript

```
src/api/          HTTP client + DTO types mirroring the API contracts
src/context/      providers holding data several screens share
src/pages/        LocationPage, TerminalPage, WashSessionPage, HistoryPage — screens drawn over the map
src/components/   shared UI
src/hooks/        useDeviceId and friends
src/utils/        pure helpers (no I/O, no React)
```

- Function components and hooks only.
- API DTO types are hand-written in `src/api` to match the server contracts; no codegen in a demo this size.
- No state-management library — local state plus a small context is enough for four screens.
- Styling is Tailwind. Class names must be literal strings — the scanner never sees `bg-${level}-100`, so map a
  value to whole class names instead.
- Keep the API surface in `src/api`; components never call `fetch` directly.
- The client and the API are separate Cloud Run services, so the client calls the API by absolute address from
  `VITE_API_BASE_URL`. Vite substitutes `VITE_*` while building, so that address arrives as a
  `docker build --build-arg`: a container environment variable never reaches a bundle that is already built.
  Locally the variable stays empty, the path stays relative, and the Vite proxy forwards it to the API.
- The map is 2GIS MapGL (`@2gis/mapgl`), which is imperative and has no React wrapper: create the map in an
  effect against a container ref, destroy it on unmount, and keep every marker call inside the map component so
  the instance never leaks into the rest of the tree. Markers belong in their own effect — data changes must
  re-create markers, never the map, or the user loses the position and zoom they set by hand.
  The map itself is mounted once in `App`, above the router, and screens render over it — that is what keeps the
  camera when the user opens and closes a location card.
