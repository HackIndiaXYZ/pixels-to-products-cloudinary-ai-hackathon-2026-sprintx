# InvariantLens Dummy Test Fixtures & Invariant Conditions

This directory and `/public/dummy/` provide standardized benchmark test images and semantic invariant conditions for InvariantLens.

## Purpose

When benchmarking AI Vision models against progressive image compression and downsampling (e.g. Cloudinary transformations `c_limit,w_<width>/q_auto`), each test image represents a distinct semantic challenge:

1. **Text & Regulatory Signage** (`safety-sign.jpg`, `storefront-signage.jpg`):
   - Invariance goal: Safety warnings and brand typography must not be lost or misread at smaller delivery widths.
   - Condition type: Text preservation (`textTask`).
2. **Object Counting & Scene Density** (`desk-workspace.jpg`, `urban-cyclists.jpg`):
   - Invariance goal: Discrete object counts (pens, bicycles, commuters) must not merge or disappear under low resolution.
   - Condition type: Object counting (`countTask`).
3. **Structured Packaging & Compliance** (`product-packaging.jpg`):
   - Invariance goal: Multi-field quality criteria (brand legibility, batch code, tamper-evident seal, barcode) must all remain valid.
   - Condition type: Custom schema inspection (`taskSchema`).

## Industry Standard Best Practices

- **Self-Contained Fixtures**: All sample images are standardized to web-ready sizes (< 2 MB) below the 4 MB upload limit.
- **Image-to-Condition Binding**: Selecting an image dynamically loads its corresponding invariant conditions, avoiding cross-contamination from unrelated mock prompts.
- **Customizable Invariants**: Users can select alternative presets or refine field definitions per image.
- **Attribution & Licensing**: CC0 and Unsplash permissive licenses. See `public/samples/ATTRIBUTION.md`.
