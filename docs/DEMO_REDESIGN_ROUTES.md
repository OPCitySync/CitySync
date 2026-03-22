# Demo Redesign Routes Decision

Decision: keep redesign routes as experimental preview surfaces.

Routes:
- `/demo/redesign`
- `/demo/redesign-shell`
- `/demo/redesign-web-shell`

Policy:
- These routes stay available for rapid UI iteration and stakeholder review.
- They are not treated as canonical production demo entry points.
- They are marked noindex (`robots: index=false, follow=false`) to keep them out of search indexing.
- Canonical user flow remains the live mobile demo role routes (`/demo/issuer`, `/demo/participant`, `/demo/redeemer`).
