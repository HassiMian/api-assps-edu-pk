# Architecture Notes

## Purpose

This repository currently represents the application served on:

- `https://api.assps.edu.pk`

Even though the hostname suggests "API", the live domain currently serves a full Next.js application behind Nginx and PM2.

## Current Live Reality

- Runtime: shared Next.js app
- Proxy target: `127.0.0.1:3000`
- PM2 process: `apex-connect`
- Shared live codebase with: `https://apex.assps.edu.pk`

## What Belongs Here Long-Term

Recommended long-term focus for this repository:

- login and portal flows
- school admin dashboards
- SaaS admin dashboards
- API route handlers under `src/app/api`
- tenant-aware business logic
- authenticated product surfaces

## What Is Still Shared Today

This snapshot still includes Apex experience pages because production is not yet isolated at infrastructure level.

Shared areas currently include:

- `src/app/apex/`
- shared branding utilities
- shared auth/session/runtime configuration

## Recommended Future Split

When infrastructure separation is ready:

1. keep authenticated dashboards and app routes in this repository
2. keep API handlers in this repository
3. move Apex cinematic/marketing experience fully to `apex-assps-edu-pk`
4. run separate PM2 processes and separate Nginx upstream targets

## Safety Rule

Until live infrastructure is separated, changes here may still conceptually affect the shared super-app code line, even if source control is now split.

See also [MIGRATION_PLAN.md](MIGRATION_PLAN.md).
