# Ops Folder

This folder contains operational helpers and historical scripts for the `api.assps.edu.pk` repository.

## Layout

- `legacy/` - preserved one-off local patch helpers that should not live beside product components

## Safety

- review every script before running it
- keep credentials and secrets in environment variables only
- do not treat legacy scripts as the deployment source of truth
- prefer documented build and deploy flows over ad hoc patch files
