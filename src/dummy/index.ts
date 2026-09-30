import { countTask, taskSchema, textTask, type Task } from "../lib/domain";
import { DUMMY_FIXTURES, type DummyFixture, type DummyConditionPreset } from "./fixtures";

export * from "./fixtures";

/**
 * Find a dummy fixture by ID (e.g. "safety-sign", "storefront-signage")
 */
export function getDummyFixtureById(id: string): DummyFixture | undefined {
  return DUMMY_FIXTURES.find(f => f.id === id);
}

/**
 * Find a dummy fixture by filename (e.g. "safety-sign.jpg", "storefront-signage.jpg")
 */
export function getDummyFixtureByFilename(filename: string): DummyFixture | undefined {
  const clean = filename.toLowerCase().trim();
  return DUMMY_FIXTURES.find(f => {
    const target = f.filename.toLowerCase();
    return clean === target || clean.endsWith(`/${target}`) || clean.endsWith(`\\${target}`) || clean.includes(f.id);
  });
}

/**
 * Automatically determine the best initial condition when an image is loaded or selected.
 * "The condition can be changed by the image."
 */
export function resolveConditionForImage(fileOrName: File | string): {
  taskType: "text" | "count" | "custom";
  terms: string;
  customJson: string;
  matchedFixture?: DummyFixture;
} {
  const filename = typeof fileOrName === "string" ? fileOrName : fileOrName.name;
  const fixture = getDummyFixtureByFilename(filename);

  if (fixture) {
    return {
      taskType: fixture.defaultCondition.taskType,
      terms: fixture.defaultCondition.terms,
      customJson: fixture.defaultCondition.customJson ?? "",
      matchedFixture: fixture,
    };
  }

  // Heuristic matching based on filename keywords if custom uploaded image has descriptive name
  const lower = filename.toLowerCase();
  if (lower.includes("sign") || lower.includes("text") || lower.includes("label") || lower.includes("warning") || lower.includes("caution") || lower.includes("board")) {
    return {
      taskType: "text",
      terms: "HEADER TEXT, WARNING NOTICE, OPERATIONAL INFO",
      customJson: "",
    };
  }
  if (lower.includes("count") || lower.includes("desk") || lower.includes("bike") || lower.includes("car") || lower.includes("people") || lower.includes("crowd") || lower.includes("object")) {
    return {
      taskType: "count",
      terms: "primary objects, secondary objects",
      customJson: "",
    };
  }
  if (lower.includes("product") || lower.includes("package") || lower.includes("box") || lower.includes("inspection")) {
    return {
      taskType: "custom",
      terms: "",
      customJson: JSON.stringify(
        {
          name: "Product Visual Quality",
          instruction: "Inspect the product image for critical visual identity and package attributes.",
          fields: [
            { key: "logo_visible", label: "Logo & Brand Mark", type: "boolean", description: "Is the primary brand mark or logo recognizable?" },
            { key: "text_legible", label: "Main Product Text", type: "boolean", description: "Is the main product title clearly legible?" },
            { key: "flaw_free", label: "Structural Integrity", type: "boolean", description: "Does the package look intact and free of compression distortion?" },
          ],
        },
        null,
        2
      ),
    };
  }

  // Default clean starting condition for any arbitrary uploaded image
  return {
    taskType: "text",
    terms: "KEY PHRASE 1, KEY PHRASE 2",
    customJson: "",
  };
}

/**
 * Builds a validated Task from active UI condition state
 */
export function buildTaskFromCondition(
  taskType: "text" | "count" | "custom",
  terms: string,
  customJson: string
): Task {
  if (taskType === "custom") {
    try {
      const parsed = JSON.parse(customJson);
      return taskSchema.parse(parsed);
    } catch {
      // Fallback valid task
      return taskSchema.parse({
        name: "Custom Inspection",
        instruction: "Inspect the provided image against defined quality criteria.",
        fields: [{ key: "check_1", label: "Quality Check", type: "boolean", description: "Is the check satisfied?" }],
      });
    }
  }

  const items = [...new Set(terms.split(",").map(t => t.trim()).filter(Boolean))];
  const validItems = items.length ? items : [taskType === "count" ? "items" : "KEY TEXT"];
  return taskType === "count" ? countTask(validItems) : textTask(validItems);
}
