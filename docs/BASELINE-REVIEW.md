# Baseline reliability review

The cyclist screenshot shows original bicycle answers of 5, 5, 4 and helmet answers of 2, 2, 1. People are stable at 4. Original means reference input, not verified ground truth. The screenshot alone cannot establish why the provider changed its answers; raw responses, source identity and model versions are needed.

## Fixed

- A matching subset now produces PARTIAL instead of PASS. PASS requires every selected field to have a stable baseline and be preserved.
- Partial results cannot generate a full-task width recommendation. Drift in a comparable field remains visible even when other baseline fields are excluded.
- The UI explains original variability and lists excluded fields with their actual responses. Exports include comparable and total field counts.
- Counting instructions explicitly cover foreground/background, partly occluded objects, unique instances, bicycles versus motorcycles, and helmets versus hats. Prompt clarification is not a guarantee of stable or correct recognition.
- Regression tests cover partial comparisons, withheld recommendations, drift with partial coverage, and incomplete provider output.

Existing completed runs keep their original task and answers. Start a new experiment to test the revised prompt; do not keep retrying and discard disagreeing runs to manufacture a stable baseline.

## Remaining coding work, by priority

1. Add a baseline-only check before the full sweep, with explicit user choice when some fields are unstable. Currently a partially stable original still triggers the variant sweep.
2. Add human-reviewed expected answers and distinguish correctness from repeatability. For crowded scenes, consider selectable regions or an object detector with boxes; test the actual downstream model.
3. Add durable experiment history and report import. Save source hashes, exact prompts, transformation parameters, provider request IDs and model versions, including derivative provenance. Current reports remain in browser memory until exported.
4. Measure transformed bytes and dimensions. Current recommendations optimize tested width, not measured bytes. Separate fixed-quality experiments from resizing to isolate their effects.
5. Before public deployment, add shared rate limits/access controls and bounded retry/backoff for transient provider errors. Verify the hosting timeout and real upload/analyze/export flow.
6. Review the new sample fixtures and their provenance, finish regression checks, and publish the complete current workspace. Historical example outputs must remain identified as unverified.

## Primary sources

- Cloudinary structured output guarantees a JSON shape, not correct image interpretation: https://cloudinary.com/documentation/analyze_api_guide
- Cloudinary's general analysis API documents prompts and model-version output: https://cloudinary.com/documentation/analyze_api_reference
- OpenAI documents approximate object counting as a vision-model limitation: https://developers.openai.com/api/docs/guides/images-vision . This is supporting evidence about vision models generally, not identification of Cloudinary's underlying model.
