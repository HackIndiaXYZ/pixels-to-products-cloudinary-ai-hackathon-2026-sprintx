"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, ArrowDown, ArrowDownToLine, ArrowRight, Check, ChevronDown, CircleHelp, Cloud, Code2, ExternalLink, Eye, FileImage, FlaskConical, Focus, Layers3, LoaderCircle, Play, Plus, ScanLine, ShieldCheck, Sparkles, Square, UploadCloud, X } from "lucide-react";
import { baseline, buildPrompt, countTask, evaluate, recommend, taskSchema, textTask, WIDTHS, type Report, type Run, type Value } from "@/lib/domain";
import { TaskBuilder } from "./TaskBuilder";
import { examples } from "@/lib/examples";

type Uploaded = { token: string; url: string; asset: NonNullable<Report["asset"]> };
const defaultCustom = JSON.stringify({ name: "Product inspection", instruction: "Inspect the visible product in this image.", fields: [{ key: "label_readable", label: "Product label", type: "boolean", description: "Is the full product label readable?" }] }, null, 2);
const displayValue = (v: Value | undefined) => v === undefined ? "—" : v === true ? "Detected" : v === false ? "Missing" : String(v);

function Status({ status }: { status: string }) {
  return <span className={`status ${status.toLowerCase()}`}>{status === "PASS" || status === "STABLE" ? <Check size={12} /> : status === "DRIFT" ? <Activity size={12} /> : null}{status === "UNTESTED" ? "Not tested" : status}</span>;
}

const samplePhotos: Record<string, string> = {
  storefront: '/samples/trista-le-sRjRt-_hy9M-unsplash.jpg',
  desk: '/samples/2h-media-0nc4sJqL87U-unsplash.jpg',
  cyclists: '/samples/aboodi-vesakaran-d_h5vVS_YxY-unsplash.jpg',
};

export function Workspace() {
  const [mode, setMode] = useState<"recorded" | "live">("recorded");
  const [example, setExample] = useState("storefront");
  const [report, setReport] = useState<Report>(examples.storefront);
  const [tab, setTab] = useState("workspace");
  const [width, setWidth] = useState(600);
  const [taskType, setTaskType] = useState("text");
  const [terms, setTerms] = useState("OPEN, NO SMOKING, NO VAPING");
  const [custom, setCustom] = useState(defaultCustom);
  const [editingJson, setEditingJson] = useState(false);
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<string>();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 18, label: "" });
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => { fetch("/api/status").then(r => r.json()).then(s => setReady(s.configured)).catch(() => {}); }, []);
  useEffect(() => {
    if (!file) { setPreview(undefined); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => () => controller.current?.abort(), []);

  const customValid = (() => { try { const t = taskSchema.parse(JSON.parse(custom)); return !!t.name.trim() && !!t.instruction.trim() && t.fields.every(f => !!f.label.trim() && !!f.description.trim()); } catch { return false; } })();
  const invariants = baseline(report.task, report.runs);
  const stableCount = invariants.filter(f => f.status === "STABLE").length;
  const evaluations = WIDTHS.map(w => evaluate(report.task, report.runs, w));
  const recommendation = recommend(evaluations);
  const selected = evaluations.find(v => v.width === width)!;
  const tested = evaluations.filter(e => e.status !== "UNTESTED");
  const totalChanges = new Set(evaluations.flatMap(e => e.changes.map(c => c.key))).size;

  function loadExample(key: string) {
    setExample(key); setReport(examples[key]); setWidth(key === "desk" ? 200 : 600); setError("");
  }
  function changeMode(next: "live" | "recorded") {
    if (busy) return;
    setMode(next); setEditingJson(false); setError("");
    if (next === "recorded") loadExample(example);
    else setReport({ mode: "live", title: "Your next experiment", task: textTask(["OPEN", "NO SMOKING", "NO VAPING"]), runs: [] });
  }
  function selectFile(next?: File) {
    if (!next) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(next.type) || next.size > 4_000_000 || next.size === 0) { setError("Choose a JPG, PNG or WebP image smaller than 4 MB."); return; }
    setFile(next); setError("");
  }
  async function loadPublicSample() {
    try {
      const response = await fetch("/samples/safety-sign.jpg");
      if (!response.ok) throw new Error("Sample unavailable.");
      const blob = await response.blob();
      selectFile(new File([blob], "safety-sign.jpg", { type: "image/jpeg" }));
      setTaskType("text");
      setTerms("CAUTION, NO SMOKING, MATCHES, OPEN LIGHTS");
    } catch { setError("Could not load the sample image. Please choose a local image."); }
  }
  async function requestJson(path: string, options: RequestInit) {
    const response = await fetch(path, options);
    const data = await response.json().catch(() => ({ error: "The server returned an unexpected response. Please retry." }));
    if (!response.ok) throw new Error(data.error ?? "Request failed.");
    return data;
  }
  async function runTest() {
    if (!file || busy || (taskType === "custom" && (!customValid || editingJson))) return;
    let task;
    try {
      const items = [...new Set(terms.split(",").map(t => t.trim()).filter(Boolean))];
      task = taskType === "custom" ? taskSchema.parse(JSON.parse(custom)) : taskType === "text" ? textTask(items) : countTask(items);
    } catch { setError("Add 1–12 comma-separated items, or a valid custom task with unique field keys."); return; }
    const abort = new AbortController(); controller.current = abort;
    setBusy(true); setError(""); setProgress({ done: 0, total: 18, label: "Uploading to Cloudinary" });
    const current: Report = { mode: "live", title: file.name, task, runs: [] };
    setReport(current);
    try {
      const form = new FormData(); form.append("file", file);
      const uploaded: Uploaded = await requestJson("/api/upload", { method: "POST", body: form, signal: abort.signal });
      current.imageUrl = uploaded.url; current.asset = uploaded.asset;
      const widths = WIDTHS.filter(w => w < uploaded.asset.width);
      const allWidths = [null, ...widths];
      const total = allWidths.length * 3;
      for (const w of allWidths) {
        for (let i = 0; i < 3; i++) {
          if (abort.signal.aborted) throw new DOMException("Cancelled", "AbortError");
          setProgress({ done: current.runs.length, total, label: w === null ? `Establishing baseline · run ${i + 1} of 3` : `Testing ${w}px · run ${i + 1} of 3` });
          let result: Run;
          try {
            result = await requestJson("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: uploaded.token, width: w, task }), signal: abort.signal });
          } catch (err) {
            if (abort.signal.aborted) throw err;
            result = { id: crypto.randomUUID(), width: w, at: new Date().toISOString(), error: err instanceof Error ? err.message : "Analysis failed." };
          }
          current.runs.push(result); setReport({ ...current, runs: [...current.runs] });
          setProgress(p => ({ ...p, done: current.runs.length }));
        }
        if (w === null && !baseline(task, current.runs).some(f => f.status === "STABLE")) {
          setError("No stable baseline fields were found. Review the run details or try a clearer image or task."); break;
        }
        if (w !== null) setWidth(w);
      }
    } catch (err) {
      setError(abort.signal.aborted ? "Test stopped. Completed observations are still available below." : err instanceof Error ? err.message : "The test could not finish.");
    } finally { setBusy(false); controller.current = null; }
  }
  function exportReport() {
    const data = { ...report, prompt: report.mode === "live" ? buildPrompt(report.task) : "Original experiment prompt unavailable; task schema reconstructed from handoff", invariants, evaluations, recommendation: recommendation?.width ?? null, recommendationMetric: "smallest tested width (not measured file size)", presets: WIDTHS.map(w => ({ width: w, transformation: `c_limit,w_${w}/q_auto` })), exportedAt: new Date().toISOString() };
    const form = document.createElement("form");
    form.method = "POST"; form.action = "/api/report"; form.hidden = true;
    const input = document.createElement("input");
    input.type = "hidden"; input.name = "report"; input.value = JSON.stringify(data);
    form.append(input); document.body.append(form); form.submit(); form.remove();
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="InvariantLens home"><span className="brand-icon"><Focus size={24}/></span><span>Invariant<span className="brand-light">Lens</span><small>MEDIA INTELLIGENCE LAB</small></span></a>
      <div className="project-switch"><span className="project-avatar">S</span><div>SprintX workspace<small>Hackathon project</small></div><ChevronDown size={14}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="Main navigation">
        <button className={tab === "workspace" ? "active" : ""} onClick={() => setTab("workspace")}><FlaskConical size={18}/>Stress test<span className="nav-dot"/></button>
        <button className={tab === "evidence" ? "active" : ""} onClick={() => setTab("evidence")}><Layers3 size={18}/>Evidence library<span className="nav-count">3</span></button>
        <button className={tab === "guide" ? "active" : ""} onClick={() => setTab("guide")}><CircleHelp size={18}/>How it works</button>
      </nav>
      <div className="sidebar-note"><span className="tiny-eyebrow"><Sparkles size={13}/> BUILT FOR THE DETAILS</span><p>Smaller images.<br/>The same understanding.</p><span>Measure what survives<br/>your media pipeline.</span><div className="note-line"/></div>
      <div className="sidebar-footer"><Cloud size={20}/><div>Powered by Cloudinary<small>Pixels to Products · 2026</small></div><span className="green-dot"/></div>
    </aside>

    <main>
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{tab === "workspace" ? "Stress test" : tab === "evidence" ? "Evidence library" : "How it works"}</strong></div><div className="topbar-right"><span className="version">MVP / 01</span><a href="https://github.com/HackIndiaXYZ/pixels-to-products-cloudinary-ai-hackathon-2026-sprintx" target="_blank" rel="noreferrer">Project source <ExternalLink size={13}/></a><span className="user-avatar">SX</span></div></header>
      <div className="page-content">
        {tab === "guide" ? <section className="guide"><div className="eyebrow">THE METHOD</div><h1>Test what your AI sees.</h1><p className="subtitle">A smaller file should not quietly change an important answer.</p><div className="guide-steps">{[["01", "Establish a baseline", "Analyze the original three times. A field is stable only when all three valid results agree. Agreement is repeatability, not proof of accuracy."], ["02", "Change the image, keep the task", "Cloudinary generates explicit width presets with automatic quality. The same prompt and schema are used for three runs on every variant."], ["03", "Compare stable answers", "Each stable field must match in all three variant runs to pass. Mixed outcomes remain visible as drift. API and schema failures are errors."], ["04", "Recommend within the evidence", "Choose the smallest passing tested width. Untested presets, unstable fields and missing results never count as passes. Results may be non-monotonic."]].map(([n, title, body]) => <article key={n}><span>{n}</span><div><h2>{title}</h2><p>{body}</p></div></article>)}</div><div className="notice"><ShieldCheck size={19}/><p>Results apply to this image, task, prompt, available model version and tested transformations. They do not certify safety. Model versions not reported by the provider cannot be verified.</p></div><button className="primary" onClick={() => setTab("workspace")}>Open the workspace <ArrowRight size={16}/></button></section> : tab === "evidence" ? <section><div className="eyebrow">REPORTED OBSERVATIONS</div><h1>Small details. Real questions.</h1><p className="subtitle">Three experiments from our engineering handoff. Explore the evidence and its limits.</p><div className="evidence-grid">{Object.entries(examples).map(([key, e]) => <button className="evidence-card" key={key} disabled={busy} onClick={() => { setMode("recorded"); loadExample(key); setTab("workspace"); }}><span className="evidence-icon">{key === "storefront" ? <ScanLine/> : key === "desk" ? <Layers3/> : <Activity/>}</span><span className="eyebrow">{e.task.name}</span><h2>{e.title}</h2><p>{key === "storefront" ? "Prominent text survived. Two smaller phrases disappeared at 600px." : key === "desk" ? "Three pens became two in every reported 200px analysis." : "The unchanged original returned 5, 5 and 4 bicycles."}</p><span className="card-link">Explore observations <ArrowRight size={16}/></span></button>)}</div><div className="notice"><CircleHelp size={18}/><p>{examples.storefront.sourceNote}</p></div></section> : <>
          <div className="page-heading"><div><div className="eyebrow"><span/> THE SEMANTIC STRESS TEST</div><h1>Optimize pixels. Preserve meaning.</h1><p className="subtitle">Find where image optimization changes what your AI understands.</p></div><button className="secondary export-button" onClick={exportReport} disabled={!report.runs.length || busy}><ArrowDownToLine size={15}/>Export report</button></div>
          <div className="workspace-toolbar"><div className="mode-switch" aria-label="Analysis mode"><button disabled={busy} className={mode === "recorded" ? "selected" : ""} onClick={() => changeMode("recorded")}><FlaskConical size={14}/>Recorded examples</button><button disabled={busy} className={mode === "live" ? "selected" : ""} onClick={() => changeMode("live")}><span className="live-dot"/>Live analysis</button></div><span className="toolbar-caption">{mode === "recorded" ? "Explore the method. No API calls." : "Your image. Your task. Measured results."}</span></div>

          <div className="setup-grid">
            <section className="panel input-panel"><div className="section-heading"><span className="step-number">01</span><h2>Choose your input</h2><span className="muted-label">{mode === "recorded" ? "EXAMPLE" : "SOURCE IMAGE"}</span></div>
              {mode === "recorded" ? <><div className="example-select"><label htmlFor="example">Experiment</label><div className="select-wrap"><select id="example" value={example} onChange={e => loadExample(e.target.value)}><option value="storefront">Storefront signage</option><option value="desk">Desk object count</option><option value="cyclists">Cyclist baseline variability</option></select><ChevronDown size={15}/></div></div><div className="image-preview"><a href={samplePhotos[example]} target="_blank" rel="noreferrer" aria-label={`Open original photo: ${report.title}`}><img src={samplePhotos[example]} alt={report.title} /></a><span className="image-caption">Your source photo · historical results unverified</span></div><div className="asset-footer"><FileImage size={15}/><span>{report.title}</span><span className="file-tag">HANDOFF</span></div></> : <><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => selectFile(e.target.files?.[0])}/><button disabled={busy} className={`upload-zone ${dragging ? "dragging" : ""}`} onClick={() => fileInput.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); if (!busy) selectFile(e.dataTransfer.files[0]); }}>{preview ? <img src={preview} alt="Selected image for analysis"/> : <><span className="upload-icon"><UploadCloud size={28}/></span><strong>Drop an image to begin</strong><span>or click to browse your files</span><small>JPG, PNG, WebP · up to 4 MB</small></>}</button><div className="asset-footer"><FileImage size={15}/><span>{file?.name ?? "No image selected"}</span>{file && <small>{(file.size / 1000).toFixed(0)} KB</small>}</div><div className="sample-action"><button className="secondary" disabled={busy} onClick={loadPublicSample}>Use public test image</button><a href="/samples/ATTRIBUTION.md" target="_blank" rel="noreferrer">Photo credit · CC0</a></div><p className="input-note">Uploaded images are stored in your Cloudinary account. Only presets smaller than the original are tested.</p></>}
            </section>
            <section className="panel task-panel"><div className="section-heading"><span className="step-number">02</span><h2>Define what matters</h2><span className="muted-label">AI TASK</span></div>
              {mode === "recorded" ? <><div className="task-selected"><span className="task-icon">{report.task.name === "Text preservation" ? <ScanLine size={21}/> : <Layers3 size={21}/>}</span><div><strong>{report.task.name}</strong><p>{example === "storefront" ? "Keep every selected phrase readable." : "Preserve the visible object count."}</p></div><Check size={17}/></div><label className="field-label">SELECTED INVARIANTS <span>{report.task.fields.length} fields</span></label><div className="invariant-chips">{report.task.fields.map(f => <span key={f.key}><Check size={12}/>{f.label}</span>)}</div><div className="baseline-explainer"><ShieldCheck size={19}/><div><strong>Consistency comes first.</strong><p>Three original runs establish which answers are stable enough to compare.</p></div><span className="runs-token">×3</span></div><div className="recorded-banner"><span className="amber-dot"/><span>Recorded observations · not a live test</span></div></> : <><label className="field-label" htmlFor="task-type">TASK TEMPLATE</label><div className="select-wrap"><select id="task-type" disabled={busy} value={taskType} onChange={e => { setEditingJson(false); setTaskType(e.target.value); setTerms(e.target.value === "count" ? "pens, phones, laptops" : "OPEN, NO SMOKING, NO VAPING"); }}><option value="text">Text preservation</option><option value="count">Object counting</option><option value="custom">Create your own checks</option></select><ChevronDown size={15}/></div>{taskType === "custom" ? <TaskBuilder value={custom} onChange={setCustom} disabled={busy} onEditingChange={setEditingJson}/> : <><label className="field-label" htmlFor="task-content">{taskType === "text" ? "PHRASES TO PRESERVE" : "OBJECTS TO COUNT"}</label><textarea id="task-content" disabled={busy} value={terms} onChange={e => setTerms(e.target.value)}/><p className="input-note">Separate items with commas. All selected fields are tested.</p></>}<div className="baseline-explainer"><ShieldCheck size={19}/><div><strong>3 baseline runs + 3 runs per preset</strong><p>Up to 18 AI Vision requests per experiment.</p></div></div><button className="primary run-button" onClick={runTest} disabled={!ready || !file || busy || (taskType === "custom" && (!customValid || editingJson))}>{busy ? <LoaderCircle className="spin" size={16}/> : <Play size={15}/>} {busy ? "Test in progress" : "Run stress test"}<ArrowRight size={16}/></button></>}
            </section>
          </div>
          {mode === "live" && !ready && <div className="notice setup-notice"><Cloud size={20}/><div><strong>Connect Cloudinary to run live tests</strong><p>Add rotated credentials to <code>.env.local</code>, set <code>CLOUDINARY_CREDENTIALS_ROTATED=true</code>, enable AI Vision, then restart the app. Recorded examples are ready to explore.</p></div></div>}
          {error && <div role="alert" className="error-banner"><CircleHelp size={17}/><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={15}/></button></div>}
          {busy && <div className="progress-panel" role="status"><div><LoaderCircle size={16} className="spin"/><strong>{progress.label}</strong><span>{progress.done} / {progress.total}</span><button className="text-button" onClick={() => controller.current?.abort()}><Square size={12}/>Stop</button></div><progress value={progress.done} max={progress.total}/></div>}

          <div className="results-heading"><div><span className="step-number">03</span><h2>Follow the evidence</h2></div><span className="results-meta">{report.runs.length ? `${report.runs.length} observations` : "Awaiting your first test"}<span>·</span>{report.mode === "recorded" ? "Recorded example" : "Live experiment"}</span></div>
          <div className="metrics-grid"><div className="metric"><span className="metric-label">STABLE BASELINE <ShieldCheck size={16}/></span><div><strong>{report.runs.length ? stableCount : "—"}</strong><span>/ {report.task.fields.length} fields</span><span className="metric-note">{stableCount === report.task.fields.length ? "Consistent across 3 runs" : "Only stable fields compared"}</span></div></div><div className="metric"><span className="metric-label">PRESETS TESTED <Layers3 size={16}/></span><div><strong>{tested.length}</strong><span>/ {WIDTHS.length} presets</span><span className="metric-note">{mode === "recorded" ? "Reported measurements only" : "Three runs per preset"}</span></div></div><div className="metric"><span className="metric-label">CHANGED INVARIANTS <Activity size={16}/></span><div><strong className={totalChanges ? "orange-text" : ""}>{totalChanges}</strong><span>fields</span><span className="metric-note">{totalChanges ? "Explore the differences below" : "No observed changes"}</span></div></div></div>

          <section className="panel matrix-panel"><div className="matrix-header"><div><h2>Invariant comparison</h2><p>The same task. A different image size.</p></div><div className="legend"><span><i className="legend-pass"/>Preserved</span><span><i className="legend-drift"/>Changed</span><span><i className="legend-empty"/>Not tested</span></div></div><div className="table-scroll"><table><thead><tr><th>SELECTED INVARIANT</th><th>Original<small>baseline ×3</small></th>{WIDTHS.map(w => <th key={w} className={width === w ? "selected-column" : ""}><button onClick={() => setWidth(w)} aria-label={`Inspect ${w}px results`}>{w}<span>px</span><small>{evaluations.find(e => e.width === w)?.runs.length || "—"} runs</small></button></th>)}</tr></thead><tbody>{invariants.map(f => <tr key={f.key}><th><span className="field-dot"/>{f.label}{f.status !== "STABLE" && report.runs.length > 0 && <small className="unstable-label">{f.status.toLowerCase()}</small>}</th><td><span className={`baseline-value ${f.status === "STABLE" ? "" : "muted"}`}>{f.status === "STABLE" ? <><Check size={13}/>{displayValue(f.value)}</> : f.values.length ? f.values.map(displayValue).join(" / ") : "—"}</span></td>{evaluations.map(e => { const values = e.runs.map(r => r.output?.[f.key]); const unknown = !values.length || values.some(v => v === undefined) || e.status === "ERROR" || f.status !== "STABLE"; const changed = e.changes.some(c => c.key === f.key); return <td className={width === e.width ? "selected-column" : ""} key={e.width}><button className={`cell-result ${unknown ? "cell-empty" : changed ? "cell-drift" : "cell-pass"}`} onClick={() => setWidth(e.width)} title={unknown ? e.status === "ERROR" ? e.reason : "No comparable observation" : values.map(displayValue).join(" / ")} aria-label={`${f.label}, ${e.width}px: ${unknown ? "unavailable" : changed ? "changed" : "preserved"}`}>{unknown ? "—" : changed ? <X size={15}/> : <Check size={15}/>}</button></td>; })}</tr>)}</tbody><tfoot><tr><th>TEST RESULT</th><td><span className="baseline-tag">REFERENCE</span></td>{evaluations.map(e => <td className={width === e.width ? "selected-column" : ""} key={e.width}><Status status={e.status}/></td>)}</tr></tfoot></table></div><div className="matrix-footnote"><ShieldCheck size={14}/><span>Only stable baseline fields count toward PASS or DRIFT. Select a width to inspect its results.</span><span className="matrix-footnote-right">{stableCount} comparable fields</span></div></section>

          <div className="findings-grid"><section className="panel drift-panel"><div className="section-heading"><span className="finding-icon"><Activity size={17}/></span><h2>What changed at {width}px?</h2><Status status={selected.status}/></div>{selected.changes.length ? <div className="change-list">{selected.changes.map(c => <div className="change-row" key={c.key}><div><strong>{c.label}</strong><span>{c.after.filter(v => v !== c.before).length}/3 runs changed</span></div><span className="before-value">{displayValue(c.before)}</span><ArrowRight size={14}/><span className="after-value">{[...new Set(c.after)].map(displayValue).join(" / ")}</span></div>)}</div> : <div className="empty-finding"><Eye size={24}/><p>{selected.status === "UNTESTED" ? "This preset has no recorded measurements." : selected.status === "PASS" ? "Every stable field was preserved in all three runs." : selected.reason}</p></div>}<div className="transformation"><Code2 size={14}/><code>c_limit,w_{width}/q_auto</code><span>Cloudinary transformation</span></div></section><section className="recommendation-panel"><div className="recommendation-eyebrow"><ShieldCheck size={16}/> TESTED RECOMMENDATION</div><h2>{recommendation ? <>{recommendation.width}<span>px</span></> : "More evidence needed."}</h2><p>{recommendation ? "Smallest passing width among the tested presets." : "No transformed preset has passed yet. We need a passing measurement before recommending a width."}</p><div className="recommendation-bottom">{recommendation ? <><Check size={14}/>{stableCount} stable fields preserved · 3/3 runs</> : <><FlaskConical size={14}/>A result, never a guess.</>}</div></section></div>
          <details className="technical-details"><summary><Code2 size={15}/>Inspect experiment details<Plus size={15}/></summary><div className="technical-body">{report.sourceNote && <p className="source-note">{report.sourceNote}</p>}<h3>{report.mode === "recorded" ? "Reconstructed task (original prompt unavailable)" : "Exact prompt sent to AI Vision"}</h3><pre>{buildPrompt(report.task)}</pre><h3>Baseline observations</h3><div className="baseline-details">{invariants.map(f => <div key={f.key}><strong>{f.label}</strong><span>{f.values.map(displayValue).join(" → ") || "No runs yet"}</span><Status status={f.status}/></div>)}</div><h3>Run log · raw responses included when available</h3><pre>{JSON.stringify(report.runs, null, 2)}</pre></div></details>
          <footer className="page-footer"><span><Focus size={14}/>InvariantLens</span><p>Evidence for this image, task and tested configuration. No universal safety claims.</p><span>Built with Cloudinary <Cloud size={14}/></span></footer>
        </>}
      </div>
    </main>
  </div>;
}
