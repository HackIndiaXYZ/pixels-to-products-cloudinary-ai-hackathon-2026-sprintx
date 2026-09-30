# Mock data and evidence audit

## Hard-coded outputs shown in the application

`src/lib/examples.ts` defines all three recorded reports:

- Storefront: five text fields true on the original; NO SMOKING and NO VAPING false at 600px.
- Desk: 3 pens on the original, 2 at 200px.
- Cyclists: original bicycle counts of 5, 5, 4.

These values were transcribed from the handoff. The `repeat` helper repeats fixed values three times; it does not call an API. Dates and model versions say "Not recorded in handoff". Treat these as unverified historical examples, not measured results for the newly supplied photos.

`src/components/Workspace.tsx` starts in recorded mode and imports these reports. The Evidence cards and their numerical descriptions also summarize these fixed values. Its `SignIllustration` SVG is a drawn storefront; desk and cyclist previews are icons with fixed numbers. These previews are not original photographs or provider outputs.

`README.md`, under Recorded evidence and limits, repeats the historical observations with the same limitations.

## Test-only fixtures

- `src/lib/domain.test.ts`: fabricated outputs, models, errors and runs used to test comparison rules.
- `src/lib/provider-errors.test.ts`: fabricated provider errors, including dummy secret strings, used to test safe diagnostics.
- `src/lib/request-origin.test.ts`: fabricated request origins used to test request guards.
- `scripts/live-smoke.mjs`: creates a clearly labeled synthetic signage image only when no image path is provided. It still calls the real upload and analysis endpoints; its results are not mocked.

## Templates, not analysis results

The default custom task in `Workspace.tsx` and task builders in `src/lib/domain.ts` define questions and schemas. They do not supply AI answers. Empty live runs and the progress counter are initial UI state.

## Real integration and assets

Live mode calls `/api/upload` and `/api/analyze`; `src/lib/vision.ts` calls Cloudinary AI Vision. Provider failures surface as errors rather than falling back to recorded answers. `/api/status` checks configuration presence; it does not prove authentication succeeds.

`public/samples` contains real photographs, including the three user-supplied Unsplash files. Supplying a photo does not validate any historical report. No new AI analysis of these three photos was performed as part of this Git publication.

`docs/LIVE-VALIDATION.md` describes the separate safety-sign live test. Raw local reports are under ignored `artifacts/live-check`; they are not included in Git. That live test passed every tested width and did not reproduce drift.

## Supplied originals and upload limits

| File | Bytes | Accepted by current 4,000,000-byte upload limit? |
| --- | ---: | --- |
| trista-le-sRjRt-_hy9M-unsplash.jpg | 7,449,446 | No |
| 2h-media-0nc4sJqL87U-unsplash.jpg | 660,718 | Yes |
| aboodi-vesakaran-d_h5vVS_YxY-unsplash.jpg | 9,332,723 | No |

Original files are preserved without resizing or recompression. The storefront and cyclist images need a separately documented derivative or a deliberate upload-limit change before live testing through the current app. A derivative becomes a new baseline and should not be described as the untouched original.
