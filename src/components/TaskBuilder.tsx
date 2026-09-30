"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { taskSchema, type Task } from "@/lib/domain";

export function TaskBuilder({ value, onChange, disabled, onEditingChange }: { value: string; onChange: (value: string) => void; disabled: boolean; onEditingChange: (editing: boolean) => void }) {
  const [task, setTask] = useState<Task>(() => JSON.parse(value) as Task);
  const [advanced, setAdvanced] = useState(false);
  const [draft, setDraft] = useState(value);
  const [jsonError, setJsonError] = useState("");
  const [notice, setNotice] = useState("");
  const nextId = useRef(1);
  const addButton = useRef<HTMLButtonElement>(null);
  useEffect(() => () => onEditingChange(false), [onEditingChange]);
  function update(next: Task) {
    setTask(next);
    onChange(JSON.stringify(next));
  }
  function updateField(index: number, patch: Partial<Task["fields"][number]>) {
    update({ ...task, fields: task.fields.map((field, i) => i === index ? { ...field, ...patch } : field) });
  }
  function addQuestion() {
    let key: string;
    do { key = `question_${nextId.current++}`; } while (task.fields.some(field => field.key === key));
    update({ ...task, fields: [...task.fields, { key, label: "", type: "boolean", description: "" }] });
    setNotice("Question added. Enter a name and what the AI should check.");
    requestAnimationFrame(() => document.getElementById(`label-${key}`)?.focus());
  }
  function applyJson() {
    try {
      const result = taskSchema.parse(JSON.parse(draft));
      if (!result.name.trim() || !result.instruction.trim() || result.fields.some(f => !f.label.trim() || !f.description.trim())) throw new Error("Blank fields");
      update(result); setAdvanced(false); onEditingChange(false); setJsonError(""); setNotice("JSON applied to your questions.");
    } catch { setJsonError("Enter valid task JSON with a name, instructions, and 1–12 questions. Each question needs a unique key, label, supported type, and description."); }
  }
  return <div className="task-builder">
    <div className="builder-intro"><h3>Create your own checks</h3><p>Tell the AI what to look for. We’ll compare its answers across image sizes.</p></div>
    <fieldset disabled={disabled || advanced} className="builder-fields">
      <label htmlFor="check-name">Task name <span>Required</span></label>
      <input id="check-name" value={task.name} maxLength={100} onChange={e => update({ ...task, name: e.target.value })} placeholder="e.g. Product inspection" aria-invalid={!task.name.trim()} />
      {!task.name.trim() && <p className="field-error">Give this task a name.</p>}
      <label htmlFor="check-instructions">What should the AI focus on? <span>Required</span></label>
      <textarea id="check-instructions" value={task.instruction} maxLength={2000} onChange={e => update({ ...task, instruction: e.target.value })} placeholder="e.g. Inspect the product and read its packaging." aria-invalid={!task.instruction.trim()} />
      {!task.instruction.trim() && <p className="field-error">Add a short instruction.</p>}
      <div className="questions-heading"><h4>Questions to check</h4><span>{task.fields.length} of 12</span></div>
      {task.fields.map((field, index) => <fieldset className="question-card" key={field.key}>
        <legend>Question {index + 1}</legend>
        <div className="question-controls"><span>Compare this answer in every image</span><button type="button" className="remove-question" disabled={task.fields.length === 1} aria-label={`Remove question ${index + 1}`} title={task.fields.length === 1 ? "Keep at least one question" : "Remove question"} onClick={() => { update({ ...task, fields: task.fields.filter((_, i) => i !== index) }); setNotice(`Question ${index + 1} removed.`); addButton.current?.focus(); }}><Trash2 size={16}/></button></div>
        <label htmlFor={`label-${field.key}`}>Short name</label>
        <input id={`label-${field.key}`} value={field.label} maxLength={120} placeholder="e.g. Product label" onChange={e => updateField(index, { label: e.target.value })} aria-invalid={!field.label.trim()} aria-describedby={!field.label.trim() ? `label-error-${field.key}` : undefined}/>
        {!field.label.trim() && <p className="field-error" id={`label-error-${field.key}`}>Add a name for this answer.</p>}
        <label htmlFor={`type-${field.key}`}>Answer type</label>
        <select id={`type-${field.key}`} value={field.type} onChange={e => updateField(index, { type: e.target.value as Task["fields"][number]["type"] })} aria-describedby={`hint-${field.key}`}><option value="boolean">Yes / No</option><option value="integer">Count</option><option value="string">Text</option></select>
        <p className="field-hint" id={`hint-${field.key}`}>{field.type === "boolean" ? "For presence or visibility, such as whether a label is readable." : field.type === "integer" ? "For a whole-number count, such as the number of bottles. Zero is allowed." : "For exact words or values, such as a brand name or invoice number."}</p>
        <label htmlFor={`question-${field.key}`}>What should the AI answer?</label>
        <textarea id={`question-${field.key}`} value={field.description} maxLength={300} placeholder={field.type === "boolean" ? "Is the full product label readable?" : field.type === "integer" ? "How many bottles are visible?" : "What brand name is printed on the label?"} onChange={e => updateField(index, { description: e.target.value })} aria-invalid={!field.description.trim()} aria-describedby={!field.description.trim() ? `question-error-${field.key}` : undefined}/>
        {!field.description.trim() && <p className="field-error" id={`question-error-${field.key}`}>Write the question you want the AI to answer.</p>}
      </fieldset>)}
      <button type="button" ref={addButton} className="add-question" disabled={task.fields.length >= 12} onClick={addQuestion}><Plus size={16}/>{task.fields.length >= 12 ? "12-question limit reached" : "Add a question"}</button>
    </fieldset>
    <p className="builder-status" role="status">{notice}</p>
    <button type="button" className="advanced-toggle" disabled={disabled} aria-expanded={advanced} aria-controls="advanced-task-json" onClick={() => { if (!advanced) { setDraft(JSON.stringify(task, null, 2)); setJsonError(""); } setAdvanced(!advanced); onEditingChange(!advanced); }}>{advanced ? "Cancel JSON editing" : "Advanced: edit JSON"}</button>
    {advanced && <div id="advanced-task-json" className="advanced-editor"><label htmlFor="task-json">Task JSON</label><p>Changes take effect only after you apply them.</p><textarea id="task-json" value={draft} disabled={disabled} spellCheck={false} onChange={e => { setDraft(e.target.value); setJsonError(""); }} aria-invalid={!!jsonError} aria-describedby={jsonError ? "json-error" : undefined}/>{jsonError && <p id="json-error" className="field-error" role="alert">{jsonError}</p>}<button type="button" className="secondary" disabled={disabled} onClick={applyJson}>Apply JSON</button></div>}
  </div>;
}
