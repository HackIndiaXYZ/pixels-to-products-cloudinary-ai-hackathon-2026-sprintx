import { describe, expect, it } from "vitest";
import {
  DUMMY_FIXTURES,
  getDummyFixtureById,
  getDummyFixtureByFilename,
  resolveConditionForImage,
  buildTaskFromCondition,
} from "./index";

describe("Dummy benchmark fixtures and image-to-condition resolution", () => {
  it("provides standardized dummy test fixtures with valid schemas", () => {
    expect(DUMMY_FIXTURES.length).toBeGreaterThanOrEqual(4);
    for (const fixture of DUMMY_FIXTURES) {
      expect(fixture.id).toBeTruthy();
      expect(fixture.title).toBeTruthy();
      expect(fixture.filename).toMatch(/\.(jpg|jpeg|png|webp)$/i);
      expect(fixture.defaultCondition.task.fields.length).toBeGreaterThan(0);
      expect(fixture.conditionPresets.length).toBeGreaterThan(0);
    }
  });

  it("resolves the correct condition when an image is selected by filename", () => {
    // Safety sign
    const safetyResolved = resolveConditionForImage("safety-sign.jpg");
    expect(safetyResolved.taskType).toBe("text");
    expect(safetyResolved.terms).toContain("CAUTION");
    expect(safetyResolved.matchedFixture?.id).toBe("safety-sign");

    // Storefront
    const storefrontResolved = resolveConditionForImage("storefront-signage.jpg");
    expect(storefrontResolved.taskType).toBe("text");
    expect(storefrontResolved.terms).toContain("OPEN");
    expect(storefrontResolved.matchedFixture?.id).toBe("storefront-signage");

    // Desk workspace
    const deskResolved = resolveConditionForImage("desk-workspace.jpg");
    expect(deskResolved.taskType).toBe("count");
    expect(deskResolved.terms).toContain("pens");
    expect(deskResolved.matchedFixture?.id).toBe("desk-workspace");

    // Cyclists
    const cyclistsResolved = resolveConditionForImage("urban-cyclists.jpg");
    expect(cyclistsResolved.taskType).toBe("count");
    expect(cyclistsResolved.terms).toContain("bicycles");
    expect(cyclistsResolved.matchedFixture?.id).toBe("urban-cyclists");

    // Product packaging
    const productResolved = resolveConditionForImage("product-packaging.jpg");
    expect(productResolved.taskType).toBe("custom");
    expect(productResolved.matchedFixture?.id).toBe("product-packaging");
  });

  it("builds a validated Task from active condition state", () => {
    const textTask = buildTaskFromCondition("text", "EXIT, EMERGENCY, FIRE", "");
    expect(textTask.fields.length).toBe(3);
    expect(textTask.fields[0].label).toBe("EXIT");
    expect(textTask.fields[0].type).toBe("boolean");

    const countTask = buildTaskFromCondition("count", "apples, oranges", "");
    expect(countTask.fields.length).toBe(2);
    expect(countTask.fields[0].label).toBe("apples");
    expect(countTask.fields[0].type).toBe("integer");
  });

  it("handles custom task JSON gracefully with fallback", () => {
    const validJson = JSON.stringify({
      name: "Custom Inspection",
      instruction: "Inspect item",
      fields: [{ key: "q1", label: "Check 1", type: "boolean", description: "Is it valid?" }],
    });
    const task = buildTaskFromCondition("custom", "", validJson);
    expect(task.name).toBe("Custom Inspection");
    expect(task.fields.length).toBe(1);

    // Invalid JSON falls back to a valid task
    const invalidTask = buildTaskFromCondition("custom", "", "invalid json {");
    expect(invalidTask.fields.length).toBeGreaterThan(0);
  });
});

it("applies money comparison and screening labels to every receipt preset", () => {
  const receipts = DUMMY_FIXTURES.filter(f => f.id.startsWith("receipt-"));
  expect(receipts).toHaveLength(10);
  for (const fixture of receipts) {
    expect(fixture.screening).toBeTruthy();
    expect(fixture.defaultCondition.task.fields[0].comparison).toBe("money");
    for (const preset of fixture.conditionPresets) {
      expect(buildTaskFromCondition(preset.taskType, preset.terms, preset.customJson ?? "").fields[0].comparison).toBe("money");
    }
  }
});
