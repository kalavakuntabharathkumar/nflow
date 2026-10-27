import { parseWorkflow } from "../src/parser";

const valid = JSON.stringify({
  id: "w1", name: "Demo",
  actions: [{ id: "a1", type: "Start" }, { id: "a2", type: "Wait", next: ["a1"] }]
});

describe("parseWorkflow", () => {
  test("parses a valid workflow", () => {
    expect(parseWorkflow(valid).actions).toHaveLength(2);
  });
  test("rejects invalid JSON", () => {
    expect(() => parseWorkflow("{")).toThrow("not valid JSON");
  });
  test("rejects duplicate IDs", () => {
    expect(() => parseWorkflow(JSON.stringify({ id: "w", name: "x", actions: [
      { id: "a", type: "Start" }, { id: "a", type: "Wait" }
    ] }))).toThrow("Duplicate action id");
  });
  test("rejects missing targets", () => {
    expect(() => parseWorkflow(JSON.stringify({ id: "w", name: "x", actions: [
      { id: "a", type: "Start", next: ["missing"] }
    ] }))).toThrow("points to missing action");
  });
  test("preserves unknown types for later conversion reporting", () => {
    expect(parseWorkflow(JSON.stringify({ id: "w", name: "x", actions: [
      { id: "a", type: "CustomTask" }
    ] })).actions[0].type).toBe("CustomTask");
  });
});
