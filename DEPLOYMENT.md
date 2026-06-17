# Deployment Notes

## Production Mapping

- Domain: `api.assps.edu.pk`
- Runtime: Next.js app behind Nginx
- Proxy target: `127.0.0.1:3000`
- PM2 process: `apex-connect`

## Current Behavior

- `/` redirects to `/login`
- multiple admin/login routes are handled in the Next.js app

## Safety

- This domain currently shares the same live application runtime as `apex.assps.edu.pk`
- Deploy carefully if the goal is to avoid affecting the Apex marketing/experience domain

