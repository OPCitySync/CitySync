# Landing Routing Notes

This directory is deployed as the `city-sync.org` landing project.

## Current route behavior

- `/` serves `index.html` (pitch page / primary landing page)
- `/legacy` serves `index-legacy.html` (previous landing page)
- `/pitch` rewrites to `index.html`

Routing is configured in:

- `landing/vercel.json`

## File roles

- `index.html`: canonical live landing page
- `index-legacy.html`: archived previous homepage
- `index-pitch.html`: editable pitch backup copy (currently identical to `index.html`)

## Update workflow (recommended)

When making pitch page edits, update `index.html` first. If you want to keep the backup copy aligned:

```bash
cp landing/index.html landing/index-pitch.html
```
