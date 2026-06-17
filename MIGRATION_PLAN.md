# Migration Plan

## Goal

Turn `api-assps-edu-pk` into the operational application repository for:

- authenticated product flows
- admin and school dashboards
- tenant-aware app logic
- API routes and business endpoints

## Current Status

This repository still contains both:

1. operational product code
2. Apex cinematic/marketing experience code

That is acceptable for now because live hosting is still shared.

## Keep Here

These areas should remain in this repository long-term:

- `src/app/admin/`
- `src/app/api/`
- `src/app/auth/`
- `src/app/dashboard/`
- `src/app/login/`
- `src/app/parent/`
- `src/app/student/`
- `src/app/teacher/`
- `src/app/saas-admin/`
- `src/app/super-admin/`
- `src/components/auth/`
- `src/components/PaperGeneratorSaaS/`
- tenant/session/server logic under `src/lib/` and `src/context/`

## Move Out Later

These areas should eventually move fully to `apex-assps-edu-pk`:

- `src/app/apex/`
- purely cinematic/brand-specific components
- demo-first marketing surfaces
- story-driven homepage layers

## Shared For Now

These stay shared until infrastructure separation:

- login shell and session plumbing
- branding helpers
- payment/onboarding flows that currently cross product and marketing concerns

## Safe Split Sequence

1. isolate shared UI primitives from `src/app/apex/`
2. identify components only used by Apex marketing routes
3. move those components to the Apex repo first
4. keep route contracts stable
5. only then separate PM2 runtime and Nginx upstream

## Non-Goals Right Now

- no live route removals
- no production host changes
- no PM2 process split yet

