import { mkdir, writeFile, readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { baseline, evaluate, recommend, textTask, WIDTHS, buildPrompt } from '../src/lib/domain.ts';

// Calls the real local application routes. Never loads or prints credentials.
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const directory = new URL('../artifacts/live-check/', import.meta.url);
await mkdir(directory, { recursive: true });
const imagePath = process.argv[2];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900"><rect width="1400" height="900" fill="#f4efdf"/><rect x="120" y="80" width="1160" height="740" rx="20" fill="#153c35"/><text x="700" y="290" text-anchor="middle" font-family="Arial" font-size="140" fill="white">OPEN</text><text x="700" y="460" text-anchor="middle" font-family="Arial" font-size="56" fill="white">NO SMOKING</text><text x="700" y="580" text-anchor="middle" font-family="Arial" font-size="28" fill="white">NO VAPING</text><text x="700" y="760" text-anchor="middle" font-family="Arial" font-size="18" fill="#c5dace">SYNTHETIC INTEGRATION TEST</text></svg>`;
const bytes = imagePath ? await readFile(imagePath) : await sharp(Buffer.from(svg)).png().toBuffer();
if (!imagePath) await writeFile(new URL('synthetic-signage.png', directory), bytes);
const task = textTask(process.argv[3] ? process.argv[3].split(',').map(s => s.trim()) : ['OPEN', 'NO SMOKING', 'NO VAPING']);
async function post(path, body, json = true) {
  const response = await fetch(`${base}${path}`, { method: 'POST', headers: json ? { 'Content-Type': 'application/json' } : {}, body: json ? JSON.stringify(body) : body, signal: AbortSignal.timeout(65_000) });
  const result = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${result.error ?? 'Request failed'}`);
  return result;
}
const form = new FormData();
const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
form.append('file', new Blob([bytes], { type: isJpeg ? 'image/jpeg' : 'image/png' }), isJpeg ? 'integration-test.jpg' : 'integration-test.png');
const uploaded = await post('/api/upload', form, false);
console.log(`Upload passed: ${uploaded.asset.width} × ${uploaded.asset.height}`);
const report = { mode: 'live', title: imagePath ? 'Supplied source image' : 'Synthetic signage integration test', sourceNote: 'Fresh live API measurements. This is not the historical storefront experiment.', task, prompt: buildPrompt(task), asset: uploaded.asset, imageUrl: uploaded.url, runs: [] };
const widths = WIDTHS.filter(w => w < uploaded.asset.width);
async function save() {
  const evaluations = widths.map(w => evaluate(task, report.runs, w));
  await writeFile(new URL('report.json', directory), JSON.stringify({ ...report, invariants: baseline(task, report.runs), evaluations, recommendation: recommend(evaluations)?.width ?? null }, null, 2));
}
for (const width of [null, ...widths]) {
  for (let repeat = 0; repeat < 3; repeat++) {
    try {
      const run = await post('/api/analyze', { token: uploaded.token, task, width });
      report.runs.push(run);
      console.log(`${width ?? 'original'} run ${repeat + 1}: ${JSON.stringify(run.output)}; model=${run.model ?? 'unreported'}`);
    } catch (error) {
      report.runs.push({ id: crypto.randomUUID(), width, at: new Date().toISOString(), error: error.message });
      await save();
      console.error(`Live check stopped: ${error.message}`);
      process.exitCode = 1;
      break;
    }
    await save();
  }
  if (process.exitCode) break;
  if (width === null && !baseline(task, report.runs).some(f => f.status === 'STABLE')) { console.log('No stable baseline. Stopping.'); break; }
  if (width !== null) console.log(`${width}px: ${evaluate(task, report.runs, width).status}`);
}
console.log('Evidence saved to artifacts/live-check/report.json');
