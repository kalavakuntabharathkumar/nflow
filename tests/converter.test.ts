import { parseWorkflow } from "../src/parser";
import { convertWorkflow } from "../src/converter";
import { validateConversion } from "../src/validator";

describe("conversion pipeline", () => {
  test("converts known actions and links sequential actions", () => {
    const source = parseWorkflow(JSON.stringify({
      id: "w", name: "Demo",
      actions: [
        { id: "s", name: "Start", type: "Start" },
        { id: "d", name: "Wait One Minute", type: "Wait", config: { interval: 1, unit: "Minute" } }
      ]
    }));
    const result = convertWorkflow(source);
    expect(result.convertedCount).toBe(2);
    expect(result.flow.definition.actions["Wait_One_Minute"].runAfter).toEqual({ Start: ["Succeeded"] });
    expect(validateConversion(source, result).passed).toBe(true);
  });

  test("reports unsupported action types", () => {
    const source = parseWorkflow(JSON.stringify({
      id: "w", name: "Demo", actions: [{ id: "x", type: "CustomTask" }]
    }));
    const result = convertWorkflow(source);
    expect(result.unsupportedCount).toBe(1);
    expect(result.issues[0].code).toBe("UNSUPPORTED_ACTION");
    expect(validateConversion(source, result).passed).toBe(false);
  });

  test("warns about placeholder email recipients", () => {
    const source = parseWorkflow(JSON.stringify({
      id: "w", name: "Demo", actions: [{ id: "mail", type: "SendEmail" }]
    }));
    expect(convertWorkflow(source).issues[0].code).toBe("PLACEHOLDER_RECIPIENT");
  });
});
