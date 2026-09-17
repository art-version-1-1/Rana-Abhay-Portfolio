# Rana Abhay Kumar Portfolio

Modern monochrome portfolio website for Rana Abhay Kumar, an AI Engineer and Web Developer.

The site presents Rana's profile, education, projects, skills, certifications, strengths, and contact links through a responsive single-page experience.

## Features

- Responsive portfolio layout for desktop and mobile
- Floating navigation with active-section tracking
- Smooth reveal, hover, and project-card transitions
- Project list with expandable details and repository links
- Copy-to-clipboard email action
- GitHub and LinkedIn profile links
- Persistent aggregate visitor counter in the navigation bar
- Reduced-motion support for users who prefer less animation

## Tech stack

- React
- TypeScript
- Vite
- React Query
- Lucide React
- Express 5
- PostgreSQL
- Drizzle ORM
- OpenAPI, Orval, and generated Zod/API client types

## Project structure

```text
artifacts/
  rana-portfolio/       React/Vite portfolio frontend
  api-server/            Express API server
lib/
  api-spec/              OpenAPI source and code generation
  api-client-react/      Generated React API client
  api-zod/               Generated request/response schemas
  db/                    Drizzle schema and database client
```

## Requirements

- Node.js
- pnpm
- PostgreSQL

Install dependencies from the repository root:

```bash
pnpm install
```

For local API development, create a `.env` file from `.env.example` and provide a valid `DATABASE_URL`.

## Development

The frontend and API run as separate services:

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/rana-portfolio run dev
```

In Replit, the configured workflows start these services automatically.

After changing the OpenAPI contract, regenerate the API client and Zod schemas:

```bash
pnpm --filter @workspace/api-spec run codegen
```

After changing the Drizzle schema, apply the development database changes:

```bash
pnpm --filter @workspace/db run push
```

## Validation

Run the workspace typechecks:

```bash
pnpm run typecheck
```

Build the workspace:

```bash
pnpm run build
```

## Visitor counter

The frontend sends one `POST /api/visits` request when the page loads. The API stores a single aggregate total in the `visit_stats` table and returns the latest value:

```json
{
  "totalVisits": 14
}
```

The counter tracks page visits, not deduplicated unique people. It stores only the aggregate total and does not collect IP addresses or visitor profiles.

## License

This project is private and intended for Rana Abhay Kumar's portfolio.