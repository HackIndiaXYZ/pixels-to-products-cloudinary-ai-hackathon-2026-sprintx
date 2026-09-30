# Receipt safeguards

All ten receipt samples carry screening status and monetary comparison metadata. Screening is historical evidence, not verification of the printed total.

Before running, enter a manually checked total and a three-letter currency code. The reference is frozen into that report and is excluded from the provider prompt. An absent or mismatched reference blocks recommendations. A recommendation describes the smallest passing tested width, not a guarantee of accuracy or the smallest byte size.

Money comparison accepts two fractional digits with a comma or point, and strictly grouped thousands. Empty and malformed amounts are invalid. Currency is supplied by the reviewer; the app does not independently verify it or convert currencies. This receipt task is limited to amounts representable with two fractional digits.

A failed analysis stops the experiment immediately and preserves completed evidence. Provider quota errors require an allowance reset or account action; the application cannot replenish quota. Start a fresh experiment after resolving the failure. No automatic retries consume additional allowance.

Checks: TypeScript and unit tests for formatting, unreadable totals, reference mismatch, request failures, and every receipt preset. Live paid provider calls were not rerun.
