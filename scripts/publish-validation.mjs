import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = process.argv[2];
if (!root) throw new Error('Supply a completed experiment directory; historical results are never combined.');
const manifest = JSON.parse((await readFile('public/validation/manifest.json', 'utf8')).replace(/^\uFEFF/, ''));
const summary = JSON.parse(await readFile(resolve(root, 'summary.json'), 'utf8'));
const rows = [];
for (const asset of manifest) {
  const result = summary.find(r => r.id === asset.id);
  const report = result ? JSON.parse(await readFile(resolve(root, result.report), 'utf8')) : undefined;
  const finding = !result ? 'Not tested in this experiment.' : result.error ? `Incomplete: ${result.error}` : !result.stableNonemptyBaseline ? 'Original total unreadable, invalid, or inconsistent; smaller images not evaluated.' : result.observedDrift ? 'Stable original; amount changed at one or more tested widths.' : result.evaluations.some(e => e.status !== 'PASS') ? 'Stable original; one or more presets returned invalid or incomplete results.' : 'Stable original; amount preserved at the tested widths.';
  rows.push({ id: asset.id, source: asset.source, sha256: asset.sha256, status: !result ? 'NOT TESTED' : result.error ? 'INCOMPLETE' : 'SCREENED', finding, observations: report?.runs.map(({width, at, output, model, error}) => ({width, at, output, model, error})) ?? [], ...(result ? {baseline: result.baseline, evaluations: result.evaluations} : {}) });
}
const stamp = new Date().toISOString();
await copyFile('public/validation/results.json', `public/validation/results-before-${stamp.replace(/[:.]/g, '-')}.json`);
await writeFile('public/validation/results.json', JSON.stringify({ screenedAt: stamp, experiment: root, protocol: 'Three original runs, then three each at eligible 600px and 200px for stable nonempty originals. Money formatting normalized; no answer hints or retries.', limitation: 'Reference totals are not independently verified. Agreement is not proof of accuracy. Width and q_auto change together. This sample cannot estimate production failure rates.', results: rows }, null, 2));
await writeFile('docs/IMAGE-VALIDATION.md', `# Latest receipt screening

Experiment: ${root}

| Receipt | Result |
|---|---|
${rows.map(r => `| ${r.id} | ${r.finding} |`).join('\n')}

Three original analyses, followed by three each at eligible 600px and 200px for stable nonempty originals. Formatting differences are normalized before comparison. Raw observations retain provider output. No retries or answer hints.

These are repeatability observations, not human-verified accuracy. Recommendations still require a manually checked total and currency. Width and automatic quality change together. Earlier evidence is retained in timestamped results-before files.

Reproduce: node --experimental-strip-types scripts/validate-receipts.mjs
Publish a completed experiment: node scripts/publish-validation.mjs <experiment-directory>
`);
console.log(JSON.stringify(rows.map(({id,status,finding,evaluations}) => ({id,status,finding,evaluations})), null, 2));
