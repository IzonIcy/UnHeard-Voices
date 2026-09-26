# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Use GitHub's private reporting flow: go to the **Security** tab on this repository, click **Report a vulnerability**, and fill in the advisory form. That opens a private thread with the maintainer and lets you stage a fix before anything is disclosed.

Include the affected URL or file, what you did, what you expected, and what happened instead. If you have a proof of concept, include it. You can expect an acknowledgement within a few days.

## Threat model

This is a static site. It has no backend, no database, no authentication, no sessions, and no user-submitted content. It ships one JSON file and a JS bundle, then runs entirely in the visitor's browser. There is no server to compromise and no secret to leak, so the realistic risks are a vulnerability in a dependency, an XSS through the rendered dataset, or a misconfigured response header.

## What is already in place

- **Response headers** are set for every route in `vercel.json`: `Content-Security-Policy` (`default-src 'self'`, `script-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`), `Strict-Transport-Security` with a two-year max-age and preload, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy` that disables camera, microphone, and geolocation.
- **Secret scanning** runs gitleaks on every pull request and every push to `main`, over full history.
- **Dependency updates** are handled by Dependabot.
- **CI** gates every pull request on lint, tests, and a production build, with read-only repository permissions.
- The CSP allows no third-party script origins, which is the main defense against an injected script — so if you ever need a CDN for fonts or analytics, treat it as a security change and revisit the policy first.

## Supported versions

Only the current deployment on `main` is supported. This is an archived portfolio project with no releases, so there are no older versions to patch.
