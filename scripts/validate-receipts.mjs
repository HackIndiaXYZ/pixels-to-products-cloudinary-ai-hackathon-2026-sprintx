import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { baseline, evaluate, buildPrompt } from '../src/lib/domain.ts';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const manifest = JSON.parse((await readFile('public/validation/manifest.json', 'utf8')).replace(/^\uFEFF/, ''));
const root = `artifacts/receipt-validation-${new Date().toISOString().replace(/[:.]/g, '-')}`;
await mkdir(root, { recursive: true });
const task = { name: 'Receipt total extraction', instruction: 'Read the final purchase total printed on this receipt, including tax. Exclude cash tendered, change, subtotals and tax-only amounts. Return the amount with a decimal point and exactly two decimal places, without currency symbols or thousands separators. If the final total cannot be read, return an empty string. Do not calculate a total from line items or guess missing digits.', fields: [{key:'total',label:'Final purchase total',type:'string',comparison:'money',description:'Final purchase total as a decimal string with two digits after the decimal point, or empty string if unreadable.'}] };
async function post(path, body, json=true) {
 const response=await fetch(base+path,{method:'POST',headers:json?{'Content-Type':'application/json'}:{},body:json?JSON.stringify(body):body,signal:AbortSignal.timeout(70000)});
 const data=await response.json(); if(!response.ok) throw new Error(`${response.status}: ${data.error || 'Request failed'}`); return data;
}
console.log(`Evidence directory: ${root}`);
const summary=[];
for(const asset of manifest) {
 if(process.env.RECEIPT_IDS && !process.env.RECEIPT_IDS.split(',').includes(asset.id)) continue;
 const report={mode:'live',title:asset.title,source:asset.source,sha256:asset.sha256,task,prompt:buildPrompt(task),protocol:'Three original runs, then three at each eligible width in [600,200]. No retries or selection of agreeable runs. Empty originals do not qualify.',runs:[],startedAt:new Date().toISOString()};
 let stable=false;
 async function save() {
  report.invariants=baseline(task,report.runs);
  report.evaluations=[600,200].filter(w=>w<asset.width).map(w=>evaluate(task,report.runs,w));
  await writeFile(`${root}/${asset.id}.json`,JSON.stringify(report,null,2));
 }
 try {
  const bytes=await readFile(asset.path);
  if(createHash('sha256').update(bytes).digest('hex')!==asset.sha256) throw new Error('Source hash mismatch');
  const form=new FormData();form.append('file',new Blob([bytes],{type:asset.path.endsWith('.png')?'image/png':'image/jpeg'}),asset.path.split('/').pop());
  const uploaded=await post('/api/upload',form,false);report.asset=uploaded.asset;report.imageUrl=uploaded.url;
  for(const width of [null,...[600,200].filter(w=>w<uploaded.asset.width)]) {
   for(let i=0;i<3;i++) {
    try { await new Promise(resolve => setTimeout(resolve, 2200)); report.runs.push(await post('/api/analyze',{token:uploaded.token,task,width})); }
    catch(e) {report.runs.push({id:crypto.randomUUID(),width,at:new Date().toISOString(),error:e.message}); await save(); throw e;}
    await save();
    console.log(`${asset.id} ${width??'original'} ${i+1}/3 ${JSON.stringify(report.runs.at(-1).output)}`);
   }
   if(width===null) {
    stable=report.invariants.every(f=>f.status==='STABLE' && f.value!=='');
    if(!stable) break;
   }
  }
 } catch(e) {report.error=e.message; console.log(`${asset.id}: ${e.message}`);}
 report.finishedAt=new Date().toISOString();await save();
 const drift=stable && report.evaluations.some(e=>e.status==='DRIFT');
 summary.push({id:asset.id,source:asset.source,baseline:report.invariants.map(f=>({status:f.status,values:f.values})),stableNonemptyBaseline:stable,observedDrift:drift,evaluations:report.evaluations.map(e=>({width:e.width,status:e.status})),error:report.error,report:`${asset.id}.json`});
 await writeFile(`${root}/summary.json`,JSON.stringify(summary,null,2));
 console.log(`RESULT ${asset.id}: ${drift?'STABLE BASELINE + DRIFT':stable?report.evaluations.some(e=>e.status!=='PASS')?'STABLE BASELINE, INVALID PRESET RESULTS':'STABLE BASELINE, ALL TESTED PRESETS PRESERVED':'NOT QUALIFIED'}`);
 if(report.error && /quota|rate limit|401|403|429/i.test(report.error)) {console.log('Stopping batch on provider access/quota error.');break;}
}
