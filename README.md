# InvariantLens

**Optimize pixels. Preserve meaning.**

InvariantLens tests how Cloudinary image transformations change stable AI outputs. Upload an image, define the information that matters, establish a repeated baseline, and compare it with smaller presets.

Built by **SprintX** for **Pixels to Products — Cloudinary AI Hackathon 2026**. Proposed track: **AI Media Pipelines**.

## The problem

An optimized image may look acceptable while losing small details that a downstream AI task needs. AI answers can also vary even when the image has not changed. InvariantLens measures baseline repeatability before reporting transformation-associated changes.

## Run locally

Requires Node.js 20.9 or later (tested with Node 24).

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. Recorded examples work without credentials.

For live analysis, copy `.env.example` to `.env.local`, enter **newly rotated** Cloudinary credentials, set `CLOUDINARY_CREDENTIALS_ROTATED=true`, and enable the **AI Vision add-on**. Restart after editing the environment. Never commit `.env.local` or reuse the exposed secret.

## How to use

1. Explore the recorded storefront, desk and cyclist examples.
2. Switch to **Live analysis** and choose a JPEG, PNG or WebP under 4 MB.
   Or select **Use public test image** to load the included CC0 safety-sign photograph and its text task. Attribution is in `public/samples/ATTRIBUTION.md`.
3. Choose text preservation or object counting and enter comma-separated phrases or objects. Choose **Create your own checks** for a guided task builder: name your task, add instructions, and add up to 12 questions with Yes/No, Count or Text answers. Field keys are generated automatically. **Advanced: edit JSON** supports existing schemas; apply validates changes, while cancel preserves the form. Incomplete questions block a test.
4. Run the stress test. The original and every eligible preset each receive three analyses, up to 18 API calls. Presets equal to or wider than the source are skipped.
5. Inspect the comparison matrix and click a width to see exact changes.
6. Export the JSON report, including raw responses when available.

Images remain in your Cloudinary account until you remove them. Reports stay in browser memory; export before refreshing.

## Cloudinary integration

- Official Node SDK uploads images server-side.
- Signed, expiring upload tokens limit analysis to assets uploaded through the app.
- Explicit transformations: `c_limit,w_<preset>/q_auto` at 1200, 800, 600, 400 and 200px. Original format is retained; `f_auto` is omitted to avoid client-dependent format negotiation.
- AI Vision General uses a JSON Schema inside the prompt, with asynchronous task polling and a 50-second timeout.
- Secrets and authenticated calls stay on the server.

References: [Analyze API](https://cloudinary.com/documentation/analyze_api_reference), [structured output guide](https://cloudinary.com/documentation/analyze_api_guide).

## Decision rules

- **STABLE**: all three valid baseline outputs agree after conservative string normalization.
- **UNSTABLE**: baseline answers differ, or reported model versions change.
- **PASS**: every selected field has a stable baseline and matches in all three valid variant runs.
- **PARTIAL**: comparable fields match, but some original fields are unstable or invalid. No full-task width recommendation is issued.
- **DRIFT**: at least one stable field changes in at least one valid variant run; all values remain visible.
- **ERROR**: incomplete runs, API/schema failures, no stable fields or an incompatible reported model version.
- **Not tested**: no measurements are available.

The recommendation is the **smallest passing tested width**, not the fewest bytes. A smaller width can pass after a larger one fails. Stable output is not ground truth; three repeats do not establish statistical certainty. Unstable fields are excluded and visible. Unknown model versions are recorded as unavailable.

## Recorded evidence and limits

Examples transcribed from the supplied engineering handoff:

| Case | Original | Variant |
| --- | --- | --- |
| Storefront | CHOO, TEA, OPEN, NO SMOKING, NO VAPING detected in 3/3 runs | At 600px, last two phrases absent in 3/3 runs |
| Desk | 3 pens in 3/3 runs | At 200px, 2 pens in 3/3 runs |
| Cyclists | 5, 5, 4 bicycles | No transformation conclusion |

The three sample photos were subsequently supplied and are preserved unchanged in `public/samples`. Exact prompts, raw responses, dates and model versions for the historical results remain unavailable. These are hard-coded reported observations, not verified results for the supplied photos. All three recorded previews display the user-supplied source photos; click a photo to open the original. No 800px pass or other unobserved result is invented. Collect fresh raw reports before presenting these as independently reproduced experiments.

See [the mock-data audit](docs/MOCK-DATA-AUDIT.md) for every location containing fixed example outputs or test fixtures, and [sample attribution](public/samples/ATTRIBUTION.md) for the supplied photos and upload limits.

## Implementation

Next.js App Router, TypeScript, Tailwind CSS, Cloudinary Node SDK, Zod and Vitest. No database or authentication system.

- `src/components/Workspace.tsx`: upload, progress, examples, inspection and export.
- `src/lib/domain.ts`: task validation, baseline, drift and recommendation.
- `src/lib/server.ts`: credentials, signed tokens, URLs and request guards.
- `src/lib/vision.ts`: AI Vision and structured responses.
- `src/app/api`: upload, analyze and status routes.

The browser orchestrates individual requests to avoid a single long serverless job. Stop prevents subsequent calls; an accepted provider request may still complete and incur usage. Rate limits are best-effort and per-process. Before broad public exposure, add provider spending limits and deployment-level access/rate controls. The MVP does not persist jobs, measure transformed bytes or guarantee identical provider models when versions are unreported.

## Checks

```sh
npm test
npm run typecheck
npm run build
```

Tests cover unstable baselines, errors, repeated runs, model changes, schemas, missing evidence and non-monotonic recommendations. Live verification requires configured credentials and the add-on.

With the app running, the live integration check can be run against the public sample:

```sh
node scripts/live-smoke.mjs public/samples/safety-sign.jpg "CAUTION,NO SMOKING,MATCHES,OPEN LIGHTS"
```

This uploads one image and uses up to 18 real AI Vision calls. It saves raw observations and decisions in ignored `artifacts/live-check/report.json`. It stops at the first API error, preserving completed observations. No credentials or upload tokens are saved in the report.

## Deployment and submission

Deploy as a Next.js app (for example on Vercel), configure the four server environment variables, and use a runtime supporting 60-second API requests. Verify upload and analysis on the deployed environment before judging.

Before submission: reproduce the storefront test with the actual image, export evidence, add the deployment URL, record a 2–4 minute demo, complete the survey and submit repository and social links through the organizer's form. No deployment or submission has been performed.
