## Cursor Cloud specific instructions

This is a small single-service Next.js app (no monorepo, no database, no auth, no env vars).

### Running the app

- `npm run dev` — starts the dev server on port 3000 (serves both the React frontend and the `/api/fetch` API route).
- See `README.md` for the standard setup commands (`npm install`, `npm run dev`).

### Key notes

- The API route (`src/app/api/fetch/route.js`) makes outbound HTTPS requests to `https://xpat.egov.mv`. Internet access is required for the app to return real data.
- There is no lint script configured in `package.json`. The build step (`npm run build`) runs Next.js's built-in linting and type checking.
- There are no automated tests in this project.
- No environment variables or secrets are needed.
