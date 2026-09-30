# Live validation — 30 September 2026

## Verified

- Upload of the included 1984 × 1488 CC0 safety-sign photo through the real application API.
- Cloudinary AI Vision General with four phrases: CAUTION, NO SMOKING, MATCHES, OPEN LIGHTS.
- Three original runs and three runs at each of 1200, 800, 600, 400 and 200px.
- All four fields stable in the original; every tested variant passed.
- Model version reported by Cloudinary: 1.
- Smallest passing tested width: 200px. This is a passing case, not evidence of drift.
- A separate full browser run reproduced the result with 18 raw responses and 18 distinct request IDs.
- The browser downloaded `invariantlens-report.json`; the downloaded data contains all 18 runs, raw responses and the 200px recommendation.

Local evidence is kept in ignored `artifacts/live-check/`: `report.json` for the API-driven run, `browser-report.json` for the browser run, and `exported-report.json` for the download endpoint check. These files contain public asset URLs and measurements, not API credentials or upload tokens.

## Fixed during validation

- Local browser uploads were incorrectly rejected when Next.js reconstructed the internal request URL with localhost instead of the browser's 127.0.0.1 Host. The origin guard now checks the actual requested Host, with regression coverage for foreign domains, ports and schemes.
- Upload failures now distinguish authentication, permission and rate-limit problems without exposing provider error details.
- Report export uses a stateless attachment response instead of a temporary browser blob URL.

## Still to do

- Reproduce a transformation-associated drift case with source images and full raw evidence. Historical handoff examples are still labeled reported observations.
- Test the deployed environment; local success does not verify serverless limits or production networking.
- Prepare the demo video and final submission materials.

Photo source and license: `public/samples/ATTRIBUTION.md`.
