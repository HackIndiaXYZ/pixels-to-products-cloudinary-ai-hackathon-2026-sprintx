# Latest receipt screening

Experiment: artifacts/receipt-validation-2026-09-30T11-58-41-962Z

| Receipt | Result |
|---|---|
| receipt-01 | Stable original; amount changed at one or more tested widths. |
| receipt-02 | Stable original; amount preserved at the tested widths. |
| receipt-03 | Stable original; amount preserved at the tested widths. |
| receipt-04 | Stable original; amount preserved at the tested widths. |
| receipt-05 | Stable original; amount preserved at the tested widths. |
| receipt-06 | Stable original; amount changed at one or more tested widths. |
| receipt-07 | Stable original; amount preserved at the tested widths. |
| receipt-08 | Stable original; one or more presets returned invalid or incomplete results. |
| receipt-09 | Stable original; amount preserved at the tested widths. |
| receipt-10 | Original total unreadable, invalid, or inconsistent; smaller images not evaluated. |

Three original analyses, followed by three each at eligible 600px and 200px for stable nonempty originals. Formatting differences are normalized before comparison. Raw observations retain provider output. No retries or answer hints.

These are repeatability observations, not human-verified accuracy. Recommendations still require a manually checked total and currency. Width and automatic quality change together. Earlier evidence is retained in timestamped results-before files.

Reproduce: node --experimental-strip-types scripts/validate-receipts.mjs
Publish a completed experiment: node scripts/publish-validation.mjs <experiment-directory>
