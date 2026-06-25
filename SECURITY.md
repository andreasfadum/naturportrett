# Security Policy

This document governs (a) how sensitive information is handled in this
repository and (b) how to report a security vulnerability.

## What must never be in this repository

Naturportrett is released under the MIT License and the repository is
**public**. Any file checked into git is permanently visible to anyone, even
after later deletion (history can be inspected unless rewritten with
`git filter-repo` + force-push, which still doesn't help if anyone has cloned
or forked in the meantime).

Therefore, the following must **never** be committed:

### Secrets

- API keys, tokens, passwords (Anthropic, Resend, GitHub, etc.)
- `.env` files or any file containing real credentials
- Hardcoded passwords as default fallbacks in code — admin routes and any
  authenticated endpoint must require an environment variable and fail
  closed (HTTP 503) if it is missing
- Private SSH keys, OAuth client secrets, signing keys

### Files not used by the application code

If a file is not referenced by the running application — server code,
client code, build scripts, or runtime data — it does **not** belong in
the repository. Even when the file lives locally in the working
directory, `.gitignore` must keep it out of git. This includes:

- Internal planning notes, meeting minutes, draft strategy documents
- Risk assessment material (ROS), application templates (maler), brand
  resources we already have copied into `public/`
- Third-party copyrighted material we have no distribution rights to
- Presentation slides, PDFs, Word docs, Photoshop/Illustrator source
  files that are background material rather than product

This rule is enforced by entries in `.gitignore` and reviewed before each
push. See `CLAUDE.md` (section "Arbeidsregler for endringer") for the
matching guideline for AI assistants working on the code.

### Personally identifiable information

- Personal email addresses except where required as default recipients
  for opt-in feedback flows. Where possible use generic addresses
  (e.g., `<service>@<agency>.no`) and rely on env-vars to override in
  production.
- User feedback content (`workshop-app/data/`, `data/`) is stored on the
  Railway persistent volume only and is `.gitignore`-d locally as a
  belt-and-braces measure.

## How sensitive material is removed if it slips in

1. **From HEAD:** `git rm` or `git rm --cached` plus add to `.gitignore`,
   commit and push.
2. **From history:** when the material is sensitive (copyright, secrets,
   PII), rewrite the history with `git filter-repo --invert-paths
   --path <file>` followed by `git push --force origin main`. Coordinate
   with anyone who has cloned the repo — they must `git fetch && git
   reset --hard origin/main`.
3. **Rotate credentials:** if a secret was committed even briefly, treat
   it as compromised and rotate it.

## Branch protection

Direct pushes to `main` and force-pushes are restricted. Changes go
through pull requests with explicit owner approval. Only the repository
owner has write access; collaborators (if any) require an invitation and
operate under the same review gate. Third parties cannot modify code or
governance files in this repository — only fork it and propose changes
via pull request, which the owner reviews before merging.

## Reporting a vulnerability

If you believe you have found a security vulnerability in Naturportrett:

1. **Do not** open a public GitHub issue.
2. Email **andreas.haugstad@pbe.oslo.kommune.no** with `[SECURITY]` in the
   subject line. Include a description, reproduction steps, and the impact
   you believe the vulnerability has.
3. We will acknowledge within five working days and aim to resolve or
   mitigate within thirty days, depending on severity.

We are grateful for responsible disclosure and will credit reporters in
release notes unless anonymity is preferred.
