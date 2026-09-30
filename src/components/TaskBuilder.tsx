"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { taskSchema, type Task } from "@/lib/domain";

export function TaskBuilder({
  value,
  onChange,
  disabled,
  onEditingChange,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  onEditingChange: (editing: boolean) => void;
}) {
  const [task, setTask] = useState<Task>(() => {
    try {
      return JSON.parse(value) as Task;
    } catch {
      return {
        name: "Custom Inspection",
        instruction: "Inspect the image for required criteria.",
        fields: [{ key: "check_1", label: "Quality Check", type: "boolean", description: "Is this check satisfied?" }],
      };
    }
  });

  const [expandedKey, setExpandedKey] = useState<string | null>(() => task.fields[0]?.key ?? null);
  const [advanced, setAdvanced] = useState(false);
  const [draft, setDraft] = useState(value);
  const [jsonError, setJsonError] = useState("");
  const [notice, setNotice] = useState("");
  const nextId = useRef(task.fields.length + 1);

  useEffect(() => () => onEditingChange(false), [onEditingChange]);

  function update(next: Task) {
    setTask(next);
    onChange(JSON.stringify(next));
  }

  function updateField(index: number, patch: Partial<Task["fields"][number]>) {
    update({
      ...task,
      fields: task.fields.map((field, i) => (i === index ? { ...field, ...patch } : field)),
    });
  }

  function toggleExpand(key: string) {
    setExpandedKey(prev => (prev === key ? null : key));
  }

  function addQuestion() {
    if (task.fields.length >= 12) return;
    let key: string;
    do {
      key = `check_${nextId.current++}`;
    } while (task.fields.some(field => field.key === key));

    const newField: Task["fields"][number] = {
      key,
      label: "",
      type: "boolean",
      description: "",
    };

    update({ ...task, fields: [...task.fields, newField] });
    setExpandedKey(key);
    setNotice("New check added. Enter short name and prompt below.");
  }

  function removeQuestion(index: number) {
    if (task.fields.length <= 1) return;
    const removedKey = task.fields[index].key;
    const nextFields = task.fields.filter((_, i) => i !== index);
    update({ ...task, fields: nextFields });

    if (expandedKey === removedKey) {
      setExpandedKey(nextFields[Math.max(0, index - 1)]?.key ?? null);
    }
    setNotice(`Check ${index + 1} removed.`);
  }

  function applyJson() {
    try {
      const result = taskSchema.parse(JSON.parse(draft));
      if (!result.name.trim() || !result.instruction.trim() || result.fields.some(f => !f.label.trim() || !f.description.trim())) {
        throw new Error("Blank fields");
      }
      update(result);
      setAdvanced(false);
      onEditingChange(false);
      setJsonError("");
      setNotice("Task JSON applied successfully.");
    } catch {
      setJsonError("Enter valid task JSON with a name, instructions, and 1–12 questions with valid types.");
    }
  }

  return (
    <div className="task-builder-compact">
      <fieldset disabled={disabled || advanced} className="builder-fields-compact">
        {/* Compact Task Header: Name & Instruction in clean 2-row layout */}
        <div className="builder-meta-compact">
          <div className="builder-input-row">
            <label htmlFor="check-name" className="compact-field-label">
              TASK NAME <span>{task.fields.length} checks</span>
            </label>
            <input
              id="check-name"
              className="compact-input"
              value={task.name}
              maxLength={100}
              onChange={e => update({ ...task, name: e.target.value })}
              placeholder="e.g. Product inspection"
              aria-invalid={!task.name.trim()}
            />
          </div>

          <div className="builder-input-row">
            <label htmlFor="check-instructions" className="compact-field-label">
              FOCUS INSTRUCTION
            </label>
            <textarea
              id="check-instructions"
              className="compact-textarea-instruction"
              value={task.instruction}
              maxLength={2000}
              onChange={e => update({ ...task, instruction: e.target.value })}
              placeholder="What the AI should analyze in this image..."
              aria-invalid={!task.instruction.trim()}
            />
          </div>
        </div>

        {/* Scrollable list of compact accordion checks */}
        <div className="questions-container-compact">
          <div className="questions-bar">
            <span>INSPECTION CHECKS</span>
            <small>{task.fields.length} of 12 allowed</small>
          </div>

          <div className="questions-scroll-list">
            {task.fields.map((field, index) => {
              const isExpanded = expandedKey === field.key;
              return (
                <div key={field.key} className={`compact-check-card ${isExpanded ? "open" : ""}`}>
                  {/* Collapsed / Header row */}
                  <div
                    className="check-card-header"
                    onClick={() => toggleExpand(field.key)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleExpand(field.key);
                      }
                    }}
                  >
                    <span className="check-number">#{index + 1}</span>
                    <span className={`check-type-tag ${field.type}`}>
                      {field.type === "boolean" ? "Yes/No" : field.type === "integer" ? "Count" : "Text"}
                    </span>
                    <strong className="check-title">{field.label.trim() || "(Untitled check)"}</strong>
                    {!isExpanded && field.description && (
                      <span className="check-summary">{field.description}</span>
                    )}

                    <div className="check-actions" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        className="delete-check-btn"
                        disabled={task.fields.length === 1 || disabled}
                        onClick={() => removeQuestion(index)}
                        title={task.fields.length === 1 ? "Keep at least one check" : `Remove check #${index + 1}`}
                        aria-label={`Remove check #${index + 1}`}
                      >
                        <Trash2 size={13} />
                      </button>
                      <button
                        type="button"
                        className="toggle-expand-btn"
                        onClick={() => toggleExpand(field.key)}
                        aria-label={isExpanded ? "Collapse check" : "Expand check"}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Body: 2 compact input rows */}
                  {isExpanded && (
                    <div className="check-card-body">
                      <div className="compact-fields-row">
                        <div className="field-group flex-2">
                          <label htmlFor={`label-${field.key}`}>Short Name</label>
                          <input
                            id={`label-${field.key}`}
                            className="compact-input"
                            value={field.label}
                            maxLength={120}
                            placeholder="e.g. Brand mark legible"
                            onChange={e => updateField(index, { label: e.target.value })}
                            aria-invalid={!field.label.trim()}
                          />
                        </div>
                        <div className="field-group flex-1">
                          <label htmlFor={`type-${field.key}`}>Answer Type</label>
                          <select
                            id={`type-${field.key}`}
                            className="compact-select"
                            value={field.type}
                            onChange={e => updateField(index, { type: e.target.value as Task["fields"][number]["type"] })}
                          >
                            <option value="boolean">Yes / No</option>
                            <option value="integer">Count</option>
                            <option value="string">Text</option>
                          </select>
                        </div>
                      </div>

                      <div className="field-group mt-1">
                        <label htmlFor={`desc-${field.key}`}>Prompt / Verification Question</label>
                        <textarea
                          id={`desc-${field.key}`}
                          className="compact-textarea-prompt"
                          value={field.description}
                          maxLength={300}
                          placeholder={
                            field.type === "boolean"
                              ? "e.g. Is the brand mark clearly legible?"
                              : field.type === "integer"
                              ? "e.g. Number of bottles on shelf"
                              : "e.g. What text is printed on the label?"
                          }
                          onChange={e => updateField(index, { description: e.target.value })}
                          aria-invalid={!field.description.trim()}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Question Button */}
          <button
            type="button"
            className="compact-add-btn"
            disabled={task.fields.length >= 12 || disabled}
            onClick={addQuestion}
          >
            <Plus size={14} />
            {task.fields.length >= 12 ? "Maximum 12 checks reached" : "Add check question"}
          </button>
        </div>
      </fieldset>

      {/* Advanced JSON and status note */}
      <div className="builder-footer-compact">
        {notice && <span className="compact-notice">{notice}</span>}
        <button
          type="button"
          className="compact-advanced-toggle"
          disabled={disabled}
          onClick={() => {
            if (!advanced) {
              setDraft(JSON.stringify(task, null, 2));
              setJsonError("");
            }
            setAdvanced(!advanced);
            onEditingChange(!advanced);
          }}
        >
          {advanced ? "Close JSON editor" : "Advanced: Edit raw JSON"}
        </button>
      </div>

      {advanced && (
        <div className="compact-advanced-editor">
          <textarea
            value={draft}
            disabled={disabled}
            spellCheck={false}
            onChange={e => {
              setDraft(e.target.value);
              setJsonError("");
            }}
            aria-invalid={!!jsonError}
          />
          {jsonError && <p className="compact-json-error">{jsonError}</p>}
          <button type="button" className="secondary compact-apply-btn" disabled={disabled} onClick={applyJson}>
            Apply JSON
          </button>
        </div>
      )}
    </div>
  );
}
