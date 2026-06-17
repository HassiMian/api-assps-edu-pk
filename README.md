# api.assps.edu.pk

Apex Connect / portal application repository.

## Domain

- Production: `https://api.assps.edu.pk`

## Local Snapshot Source

- Original workspace source: `c:\projects\My SAas\super-app`

## Live Server Mapping

- App runs through Next.js / PM2
- Reverse proxy target: `127.0.0.1:3000`

## Important Architecture Note

- `api.assps.edu.pk` and `apex.assps.edu.pk` currently come from the same live codebase.
- This repository is split separately for source control clarity, but live hosting is still shared unless infrastructure is separated later.

## Boundary Guide

- operational app focus: yes
- authenticated dashboards: yes
- API route handlers: yes
- Apex cinematic marketing experience: currently present, but should move out over time

See [ARCHITECTURE.md](ARCHITECTURE.md).

## Safety

- GitHub pushes do not change production automatically.
